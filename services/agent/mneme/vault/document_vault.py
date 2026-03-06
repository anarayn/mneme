"""
DocumentVault — encrypted file storage with per-user envelope encryption.

Key hierarchy:
    Master Key (AWS KMS)
      └── User DEK (per user, KMS-wrapped, stored encrypted in PG)
            └── File CEK (per file, DEK-wrapped, stored in S3 metadata)

Agent accesses content through this vault only — never raw bytes in memory.
"""

from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from uuid import uuid4
from typing import Any


@dataclass
class DocumentRef:
    id: str
    title: str
    storage_ref: str


class DocumentVault:
    def __init__(self, user_id: str) -> None:
        self.user_id = user_id
        # TODO: initialize boto3 KMS, S3, asyncpg pool, Pinecone, Voyage, Kafka emitter
        self._kms: Any = None
        self._s3: Any = None
        self._pg: Any = None
        self._pinecone: Any = None
        self._voyage: Any = None
        self._emitter: Any = None

    async def store(self, file_content: bytes, file_name: str, file_type: str,
                    project_id: str | None = None) -> DocumentRef:
        """
        Store an encrypted file. Steps:
            1. Generate per-file CEK via AWS KMS
            2. Encrypt content with AES-256-GCM
            3. Store ciphertext in S3/R2
            4. Store metadata in PostgreSQL
            5. Emit Kafka event → async indexer worker
            6. Emit Kafka event → async graph worker
        """
        # 1. Generate CEK
        cek_response = self._kms.generate_data_key(
            KeyId=f"alias/mneme-user-{self.user_id}",
            KeySpec="AES_256",
        )
        plaintext_cek: bytes = cek_response["Plaintext"]
        encrypted_cek: bytes = cek_response["CiphertextBlob"]

        # 2. Encrypt
        nonce = os.urandom(12)
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        cipher = AESGCM(plaintext_cek)
        ciphertext = cipher.encrypt(nonce, file_content, None)

        # 3. Store in S3
        storage_key = f"users/{self.user_id}/docs/{uuid4().hex}"
        self._s3.put_object(
            Bucket="mneme-vault",
            Key=storage_key,
            Body=ciphertext,
            Metadata={
                "nonce": base64.b64encode(nonce).decode(),
                "encrypted_cek": base64.b64encode(encrypted_cek).decode(),
            },
        )

        # 4. Metadata in PG
        doc = await self._pg.fetchrow(
            """
            INSERT INTO mneme.documents
            (id, user_id, title, type, project_id, storage_ref, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
            RETURNING id
            """,
            self.user_id, file_name, file_type, project_id, storage_key,
        )

        # 5 & 6. Async events
        if self._emitter:
            self._emitter.emit("mneme.documents.index", {
                "user_id": self.user_id,
                "doc_id": str(doc["id"]),
                "storage_ref": storage_key,
                "project_id": project_id,
                "file_type": file_type,
            })
            self._emitter.emit("mneme.graph.updates", {
                "operation": "create_document_node",
                "doc_id": str(doc["id"]),
                "project_id": project_id,
                "owner_id": self.user_id,
            })

        del plaintext_cek  # Never persist plaintext key
        return DocumentRef(id=str(doc["id"]), title=file_name, storage_ref=storage_key)

    async def read_for_agent(self, doc_id: str, session_id: str, purpose: str) -> str:
        """
        Decrypt and return file content for the agent.
        Always writes to audit log. Never returns raw bytes to LLM directly.
        """
        doc = await self._pg.fetchrow(
            "SELECT * FROM mneme.documents WHERE id = $1 AND user_id = $2",
            doc_id, self.user_id,
        )
        if not doc:
            raise PermissionError("Document not found")

        obj = self._s3.get_object(Bucket="mneme-vault", Key=doc["storage_ref"])
        ciphertext = obj["Body"].read()
        nonce = base64.b64decode(obj["Metadata"]["nonce"])
        encrypted_cek = base64.b64decode(obj["Metadata"]["encrypted_cek"])

        plaintext_cek = self._kms.decrypt(CiphertextBlob=encrypted_cek)["Plaintext"]

        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        cipher = AESGCM(plaintext_cek)
        content = cipher.decrypt(nonce, ciphertext, None).decode()
        del plaintext_cek

        await self._pg.execute(
            """
            INSERT INTO mneme.doc_access_log
            (doc_id, user_id, action, session_id, purpose, timestamp)
            VALUES ($1, $2, 'read', $3, $4, NOW())
            """,
            doc_id, self.user_id, session_id, purpose,
        )

        return content
