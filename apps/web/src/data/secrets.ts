export const SECRET_TYPES = [
  {
    type: "Passwords",
    icon: "🔒",
    vault_path: "secret/users/{uid}/passwords/{label}",
    rotation: "User-triggered or scheduled",
    agentUse:
      "Login tool fetches → uses → forgets. Never in logs.",
  },
  {
    type: "API Keys",
    icon: "🗝",
    vault_path: "secret/users/{uid}/api_keys/{service}",
    rotation: "Auto-rotate where service supports",
    agentUse:
      "Tool requests key → uses → key never in LLM prompt.",
  },
  {
    type: "OAuth Tokens",
    icon: "🎫",
    vault_path: "secret/users/{uid}/oauth/{service}",
    rotation: "Vault refreshes before expiry",
    agentUse:
      "Vault returns fresh token. Expired tokens auto-refreshed.",
  },
  {
    type: "SSH Keys",
    icon: "🔐",
    vault_path: "secret/users/{uid}/ssh/{host}",
    rotation: "Manual + quarterly nudge",
    agentUse:
      "SSH tool receives path, uses vault agent. Key bytes never in Python.",
  },
  {
    type: "Certificates",
    icon: "📜",
    vault_path: "pki/users/{uid}/certs/{label}",
    rotation: "Vault PKI auto-renews",
    agentUse:
      "Vault PKI engine issues short-lived certs. No long-lived certs.",
  },
  {
    type: "Env / Config",
    icon: "⚙️",
    vault_path: "secret/users/{uid}/config/{app}",
    rotation: "On change",
    agentUse:
      "Config fetch at session start. Injected into tool env, not LLM context.",
  },
];

export const SECRETS_CODE = `class SecretsVault:
    """
    Zero-knowledge credential management.

    Core principle: The LLM NEVER sees secret values.
    Secrets flow: Vault → Tool executor → External service
                  (never through LLM context window)

    Vault namespacing:
        secret/users/{user_id}/passwords/{label}
        secret/users/{user_id}/api_keys/{service}
        secret/users/{user_id}/oauth/{service}
        secret/users/{user_id}/ssh/{host}

    Agent permission model:
        User explicitly grants: "Allow MNEME to use GitHub API key"
        Graph stores: (:Person)-[:HAS_ACCESS_TO {granted_at}]->(:Credential)
        Vault policy enforces: only mneme-agent role can read that path
    """
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.vault   = hvac.Client(url=VAULT_ADDR,
                                    token=self._get_agent_token())
        self.pg      = get_pg_pool()
        self.neo4j   = get_neo4j_client()

    async def fetch(self, label: str,
                    session_id: str,
                    purpose: str) -> SecretValue:
        """
        Fetch a secret by human-readable label.
        Validates permission, fetches from Vault, audits.
        Returns value ONLY to the tool executor — not to LLM.
        """
        # 1. Resolve label → vault path via PostgreSQL
        ref = await self.pg.fetchrow("""
            SELECT vault_path, type FROM mneme.secret_refs
            WHERE user_id=$1 AND label=$2
        """, self.user_id, label)
        if not ref:
            raise SecretNotFoundError(f"No secret labeled '{label}'")

        # 2. Check graph permission edge
        # (:user)-[:HAS_ACCESS_TO]->(:Credential {vault_path})
        permitted = await self.neo4j.run("""
            MATCH (:Person {id:$uid})-[:HAS_ACCESS_TO]->
                  (:Credential {vault_path:$path})
            RETURN count(*) > 0 AS permitted
        """, uid=self.user_id, path=ref["vault_path"])

        if not permitted:
            raise PermissionError(f"Agent not authorized for '{label}'")

        # 3. Fetch from HashiCorp Vault
        secret = self.vault.secrets.kv.v2.read_secret_version(
            path=ref["vault_path"]
        )
        value = secret["data"]["data"]["value"]

        # 4. Audit log — mandatory, always
        await self.pg.execute("""
            INSERT INTO mneme.secret_access_log
            (secret_ref_id, user_id, action, session_id, purpose, timestamp)
            VALUES ($1,$2,'read',$3,$4,NOW())
        """, ref["id"], self.user_id, session_id, purpose)

        # 5. Return SecretValue — wrapper that prevents logging
        return SecretValue(value=value, label=label, type=ref["type"])


class SecretValue:
    """
    Wrapper that prevents accidental logging/serialization of secrets.
    Overrides __repr__, __str__, __json__ to return redacted placeholder.
    """
    def __init__(self, value: str, label: str, type: str):
        self._value = value   # Private — not accessible from outside
        self.label  = label
        self.type   = type

    def use(self) -> str:
        """Explicit .use() required — forces intentional access."""
        return self._value

    def __repr__(self): return f"SecretValue(label={self.label}, type={self.type}, value=REDACTED)"
    def __str__(self):  return "[REDACTED SECRET]"

    # Prevents JSON serialization leaking secret
    def __json__(self): return {"label": self.label, "type": self.type, "value": "REDACTED"}


# ── Tool executor pattern — secret never touches LLM ────────────────────
async def github_create_issue_tool(
    repo: str, title: str, body: str,
    secrets: SecretsVault, session_id: str
) -> ToolResult:
    """
    Pattern: tool fetches secret, uses it, secret never in LLM context.
    LLM sees: tool call {repo, title, body} — no credentials.
    LLM sees: tool result {issue_url, number} — no credentials.
    Secret flows: Vault → tool → GitHub API (never through LLM).
    """
    token = await secrets.fetch(
        label="github_api_key",
        session_id=session_id,
        purpose=f"create issue in {repo}"
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.github.com/repos/{repo}/issues",
            headers={"Authorization": f"token {token.use()}"},
            json={"title": title, "body": body}
        )

    return ToolResult(
        success=True,
        data={"url": resp.json()["html_url"], "number": resp.json()["number"]}
        # Note: no credentials in result — only what LLM needs to see
    )`;
