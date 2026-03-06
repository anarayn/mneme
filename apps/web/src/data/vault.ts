export const DOC_TYPES = [
  {
    type: "Documents",
    icon: "📄",
    exts: ["PDF", "DOCX", "TXT", "MD"],
    store: "Encrypted S3/R2",
    index: "Pinecone (chunked)",
    meta: "PostgreSQL",
    agentAccess:
      "Full read. Agent fetches, chunks, summarizes. Never caches raw bytes in working memory.",
  },
  {
    type: "Images",
    icon: "🖼",
    exts: ["PNG", "JPG", "WEBP"],
    store: "Encrypted S3/R2",
    index: "Pinecone (vision embeddings)",
    meta: "PostgreSQL",
    agentAccess:
      "Vision model processes on access. Stored encrypted. Description cached in semantic memory.",
  },
  {
    type: "Spreadsheets",
    icon: "📊",
    exts: ["XLSX", "CSV"],
    store: "Encrypted S3/R2",
    index: "Postgres + Pinecone",
    meta: "PostgreSQL",
    agentAccess:
      "Structured extraction to Postgres + semantic index. Agent queries structured data directly.",
  },
  {
    type: "Emails/Messages",
    icon: "✉️",
    exts: ["EML", "MSG", "thread"],
    store: "Encrypted Postgres",
    index: "Pinecone",
    meta: "PostgreSQL + Neo4j",
    agentAccess:
      "Content → Pinecone. People/relationships → Neo4j. Prospective intents extracted and planted.",
  },
  {
    type: "Code",
    icon: "💻",
    exts: ["py", "ts", "go", "rs", "any"],
    store: "Encrypted S3/R2",
    index: "Pinecone (AST-aware chunks)",
    meta: "PostgreSQL",
    agentAccess:
      "AST-chunked by function/class. Language-specific embeddings. Project graph linked.",
  },
  {
    type: "Credentials",
    icon: "🔑",
    exts: ["passwords", "API keys", "tokens", "certs"],
    store: "HashiCorp Vault ONLY",
    index: "Never indexed",
    meta: "PostgreSQL (reference only)",
    agentAccess:
      "Agent requests by label. Vault returns value direct to tool. Never in LLM context window. Full audit.",
  },
];

export const VAULT_CODE = `class DocumentVault:
    """
    All user files stored encrypted at rest.
    Agent accesses content through this vault only —
    never raw bytes in memory or LLM context.

    Encryption: AES-256-GCM per file
    Key hierarchy:
        Master Key (AWS KMS)
          └── User DEK (Data Encryption Key, per user, KMS-wrapped)
                └── File CEK (Content Encryption Key, per file, DEK-wrapped)

    This means: compromise of one file key ≠ compromise of user.
                compromise of user DEK ≠ compromise of other users.
    """
    def __init__(self, user_id: str):
        self.user_id  = user_id
        self.kms      = boto3.client("kms")
        self.s3       = boto3.client("s3")
        self.pg       = get_pg_pool()
        self.pinecone = get_pinecone_client()
        self.voyage   = get_voyage_client()
        self.emitter  = get_kafka_emitter()

    async def store(self, file: UploadedFile,
                    project_id: str = None) -> DocumentRef:
        # 1. Generate per-file content encryption key
        cek_response = self.kms.generate_data_key(
            KeyId=f"alias/mneme-user-{self.user_id}",
            KeySpec="AES_256"
        )
        plaintext_cek = cek_response["Plaintext"]
        encrypted_cek = cek_response["CiphertextBlob"]

        # 2. Encrypt file content with CEK
        nonce    = os.urandom(12)
        cipher   = AESGCM(plaintext_cek)
        ciphertext = cipher.encrypt(nonce, file.content, None)

        # 3. Store encrypted bytes in S3/R2
        storage_key = f"users/{self.user_id}/docs/{uuid4().hex}"
        self.s3.put_object(
            Bucket="mneme-vault",
            Key=storage_key,
            Body=ciphertext,
            Metadata={
                "nonce": base64.b64encode(nonce).decode(),
                "encrypted_cek": base64.b64encode(encrypted_cek).decode(),
            }
        )

        # 4. Store metadata in PostgreSQL (no raw content)
        doc = await self.pg.fetchrow("""
            INSERT INTO mneme.documents
            (id, user_id, title, type, project_id, storage_ref, created_at)
            VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,NOW())
            RETURNING *
        """, self.user_id, file.name, file.type, project_id, storage_key)

        # 5. Async: chunk + embed + index (Kafka → worker)
        self.emitter.emit("mneme.documents.index", {
            "user_id":    self.user_id,
            "doc_id":     str(doc["id"]),
            "storage_ref": storage_key,
            "project_id": project_id,
            "file_type":  file.type,
        })

        # 6. Update Neo4j graph (async)
        self.emitter.emit("mneme.graph.updates", {
            "operation": "create_document_node",
            "doc_id":    str(doc["id"]),
            "project_id": project_id,
            "owner_id":  self.user_id,
        })

        del plaintext_cek  # Never persist plaintext key
        return DocumentRef(id=doc["id"], title=file.name)

    async def read_for_agent(self, doc_id: str,
                              session_id: str,
                              purpose: str) -> str:
        """
        Agent-facing read. Returns decrypted text content.
        Logs access. Never returns raw bytes to LLM directly —
        always via tool result, not system prompt injection.
        """
        # 1. Fetch metadata + storage ref
        doc = await self.pg.fetchrow(
            "SELECT * FROM mneme.documents WHERE id=$1 AND user_id=$2",
            doc_id, self.user_id
        )
        if not doc: raise PermissionError("Document not found")

        # 2. Fetch encrypted file from S3
        obj = self.s3.get_object(Bucket="mneme-vault", Key=doc["storage_ref"])
        ciphertext   = obj["Body"].read()
        nonce        = base64.b64decode(obj["Metadata"]["nonce"])
        encrypted_cek = base64.b64decode(obj["Metadata"]["encrypted_cek"])

        # 3. Decrypt CEK with KMS
        plaintext_cek = self.kms.decrypt(
            CiphertextBlob=encrypted_cek
        )["Plaintext"]

        # 4. Decrypt content
        cipher  = AESGCM(plaintext_cek)
        content = cipher.decrypt(nonce, ciphertext, None).decode()
        del plaintext_cek

        # 5. Audit log — always
        await self.pg.execute("""
            INSERT INTO mneme.doc_access_log
            (doc_id, user_id, action, session_id, purpose, timestamp)
            VALUES ($1,$2,'read',$3,$4,NOW())
        """, doc_id, self.user_id, session_id, purpose)

        return content  # Plain text — returned to tool, not injected into memory`;
