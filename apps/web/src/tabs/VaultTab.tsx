import { C } from "../constants";
import { Tag } from "../components/Tag";
import { CodeBlock } from "../components/CodeBlock";
import { SectionHeader } from "../components/SectionHeader";
import { DOC_TYPES, VAULT_CODE } from "../data/vault";

export function VaultTab() {
  return (
    <div className="fade">
      <SectionHeader
        title="Document & File Vault"
        sub="Encrypted object store — agent accesses, never stores raw bytes"
      />

      {/* Encryption hierarchy */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 20,
          borderLeft: `4px solid ${C.amber}`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: C.amber,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Key Hierarchy — Envelope Encryption
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              label: "Master Key (AWS KMS)",
              color: C.crimson,
              desc: "Managed by AWS. Never leaves KMS. Used to wrap User DEKs only.",
            },
            {
              label: "User DEK — Data Encryption Key",
              color: C.amber,
              desc: "One per user. KMS-wrapped. Stored encrypted in PostgreSQL. Compromise of one user's DEK ≠ compromise of others.",
            },
            {
              label: "File CEK — Content Encryption Key",
              color: C.gold,
              desc: "One per file. DEK-wrapped. Stored in S3 object metadata. Compromise of one file key ≠ compromise of user.",
            },
            {
              label: "Encrypted File Content (AES-256-GCM)",
              color: C.green,
              desc: "Stored in S3/R2. Nonce stored alongside. Agent decrypts at read time. Never persisted in plaintext anywhere.",
            },
          ].map(({ label, color, desc }, i) => (
            <div key={label} style={{ display: "flex", gap: 0 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                {i < 3 && (
                  <div
                    style={{
                      width: 1,
                      height: 36,
                      background: `${color}50`,
                      margin: "2px 0",
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: i < 3 ? 8 : 0 }}>
                <div style={{ fontSize: 12, color, fontWeight: 600 }}>
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textDim,
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File type table */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.goldDim,
            marginBottom: 14,
          }}
        >
          File Types & Storage Strategy
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <thead>
              <tr>
                {["Type", "Store", "Index", "Meta", "Agent access pattern"].map(
                  (h) => (
                    <td
                      key={h}
                      style={{
                        padding: "8px 14px",
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: C.textDim,
                        borderBottom: `1px solid ${C.border2}`,
                      }}
                    >
                      {h}
                    </td>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {DOC_TYPES.map((d, i) => (
                <tr
                  key={d.type}
                  style={{ background: i % 2 === 0 ? "#080810" : C.surface }}
                >
                  <td style={{ padding: "9px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{d.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: C.text }}>
                          {d.type}
                        </div>
                        <div style={{ fontSize: 9, color: C.textDim }}>
                          {d.exts.join(", ")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <Tag label={d.store} color={C.amber} />
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <Tag label={d.index} color={C.violet} />
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <Tag label={d.meta} color={C.green} />
                  </td>
                  <td
                    style={{
                      padding: "9px 14px",
                      fontSize: 10,
                      color: C.textDim,
                      fontStyle: "italic",
                      maxWidth: 220,
                    }}
                  >
                    {d.agentAccess}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CodeBlock
        code={VAULT_CODE}
        file="mneme/vault/document_vault.py"
        lang="Python"
      />
    </div>
  );
}
