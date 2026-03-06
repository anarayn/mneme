import { C } from "../constants";
import { CodeBlock } from "../components/CodeBlock";
import { SectionHeader } from "../components/SectionHeader";
import { SECRET_TYPES, SECRETS_CODE } from "../data/secrets";

export function SecretsTab() {
  return (
    <div className="fade">
      <SectionHeader
        title="Secrets & Credentials Vault"
        sub="Zero-knowledge — LLM never sees raw secret values"
      />

      {/* Core principle */}
      <div
        style={{
          background: C.surface,
          border: `2px solid ${C.crimson}`,
          borderRadius: 12,
          padding: "20px 28px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: C.crimson,
            fontWeight: 700,
            marginBottom: 10,
            letterSpacing: "0.05em",
          }}
        >
          ⚠ Core Security Principle
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.rose,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              ❌ What MNEME never does
            </div>
            {[
              "Store passwords in PostgreSQL or Redis",
              "Put API keys in LLM system prompt or context window",
              "Log secret values in traces (Langfuse, stdout, Sentry)",
              "Cache secrets in working memory after use",
              "Return raw secret in tool result to LLM",
              "Store secrets in environment variables of agent VM",
            ].map((s) => (
              <div
                key={s}
                style={{
                  fontSize: 11,
                  color: C.textDim,
                  display: "flex",
                  gap: 7,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: C.rose, flexShrink: 0 }}>✕</span>
                {s}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.teal,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              ✓ What MNEME does instead
            </div>
            {[
              "All secrets in HashiCorp Vault with per-user namespaces",
              "Agent requests by human-readable label, not path",
              "Vault returns value direct to tool executor only",
              "SecretValue wrapper prevents accidental serialization",
              "Full audit log: who, when, why, which session",
              "Graph permission edge: user explicitly grants agent access",
            ].map((s) => (
              <div
                key={s}
                style={{
                  fontSize: 11,
                  color: C.textDim,
                  display: "flex",
                  gap: 7,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: C.teal, flexShrink: 0 }}>✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: `${C.crimson}10`,
            borderRadius: 8,
            fontSize: 11,
            color: C.textMid,
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: C.crimson }}>Flow:</strong> LLM decides to
          call{" "}
          <code style={{ color: C.gold }}>
            github_create_issue(repo, title, body)
          </code>{" "}
          → Tool executor calls{" "}
          <code style={{ color: C.gold }}>
            SecretsVault.fetch("github_api_key")
          </code>{" "}
          → Vault returns token → Tool calls GitHub API → Returns{" "}
          <code style={{ color: C.teal }}>{`{url, number}`}</code> to LLM.
          Token never in LLM context. Never in logs.
        </div>
      </div>

      {/* Secret types */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {SECRET_TYPES.map((s) => (
          <div
            key={s.type}
            style={{
              background: C.surface,
              border: `1px solid ${C.border2}`,
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>
                {s.type}
              </span>
            </div>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: C.textDim,
                background: C.bg,
                padding: "5px 8px",
                borderRadius: 4,
                marginBottom: 8,
                wordBreak: "break-all",
              }}
            >
              {s.vault_path}
            </div>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>
              <span style={{ color: C.amber }}>Rotation: </span>
              {s.rotation}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {s.agentUse}
            </div>
          </div>
        ))}
      </div>

      <CodeBlock
        code={SECRETS_CODE}
        file="mneme/vault/secrets_vault.py"
        lang="Python"
      />
    </div>
  );
}
