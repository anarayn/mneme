"""
SecretsVault — zero-knowledge credential management.

Core principle: The LLM NEVER sees secret values.
Secrets flow: Vault → Tool executor → External service
              (never through LLM context window)
"""

from __future__ import annotations

from typing import Any


class SecretValue:
    """
    Wrapper that prevents accidental logging/serialization of secrets.
    Requires explicit .use() call to access the raw value.
    """

    def __init__(self, value: str, label: str, secret_type: str) -> None:
        self._value = value
        self.label = label
        self.type = secret_type

    def use(self) -> str:
        """Explicit .use() required — forces intentional access."""
        return self._value

    def __repr__(self) -> str:
        return f"SecretValue(label={self.label!r}, type={self.type!r}, value=REDACTED)"

    def __str__(self) -> str:
        return "[REDACTED SECRET]"

    def to_dict(self) -> dict:
        """Safe serialization — never exposes value."""
        return {"label": self.label, "type": self.type, "value": "REDACTED"}


class SecretNotFoundError(Exception):
    pass


class SecretsVault:
    def __init__(self, user_id: str) -> None:
        self.user_id = user_id
        # TODO: initialize hvac.Client, asyncpg pool, Neo4j client
        self._vault: Any = None
        self._pg: Any = None
        self._neo4j: Any = None

    async def fetch(self, label: str, session_id: str, purpose: str) -> SecretValue:
        """
        Fetch a secret by human-readable label.
        Validates graph permission edge before fetching.
        Returns SecretValue — never a raw string.
        """
        # 1. Resolve label → vault path
        ref = await self._pg.fetchrow(
            "SELECT id, vault_path, type FROM mneme.secret_refs WHERE user_id = $1 AND label = $2",
            self.user_id, label,
        )
        if not ref:
            raise SecretNotFoundError(f"No secret labeled {label!r}")

        # 2. Check graph permission: (:Person)-[:HAS_ACCESS_TO]->(:Credential)
        result = await self._neo4j.run(
            """
            MATCH (:Person {id: $uid})-[:HAS_ACCESS_TO]->(:Credential {vault_path: $path})
            RETURN count(*) > 0 AS permitted
            """,
            uid=self.user_id, path=ref["vault_path"],
        )
        if not result:
            raise PermissionError(f"Agent not authorized for {label!r}")

        # 3. Fetch from HashiCorp Vault
        secret = self._vault.secrets.kv.v2.read_secret_version(path=ref["vault_path"])
        value: str = secret["data"]["data"]["value"]

        # 4. Audit log — always
        await self._pg.execute(
            """
            INSERT INTO mneme.secret_access_log
            (secret_ref_id, user_id, action, session_id, purpose, timestamp)
            VALUES ($1, $2, 'read', $3, $4, NOW())
            """,
            ref["id"], self.user_id, session_id, purpose,
        )

        return SecretValue(value=value, label=label, secret_type=ref["type"])
