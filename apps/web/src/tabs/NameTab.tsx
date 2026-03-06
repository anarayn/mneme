import { C } from "../constants";

export function NameTab() {
  return (
    <div className="fade">
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 14,
          padding: "36px 44px",
          marginBottom: 20,
          borderTop: `3px solid ${C.gold}`,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: C.gold,
                marginBottom: 18,
                letterSpacing: "0.05em",
              }}
            >
              Why MNEME?
            </h2>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.9,
                color: C.textMid,
                marginBottom: 16,
              }}
            >
              In Greek mythology,{" "}
              <strong style={{ color: C.text }}>Mneme</strong> was one of the
              three original Muses — the muse of memory itself. Daughter of
              Mnemosyne, she governed not just storage but the act of meaningful
              remembrance.
            </p>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.9,
                color: C.textMid,
                marginBottom: 16,
              }}
            >
              The name now carries more weight: MNEME is a full cognitive
              architecture — graph memory for structure, vectors for meaning, a
              document vault, a secrets manager, and a role-configurable brain.
              Not a chatbot. A cognitive infrastructure platform.
            </p>
            {[
              [
                "Memory-native",
                "8-layer memory model is the foundation, not a feature.",
              ],
              [
                "Role-fluid",
                "Secretary, lawyer, trader, partner — one brain, DNA-configured.",
              ],
              [
                "Graph-aware",
                "Org charts, project hierarchies, people relationships — traversable.",
              ],
              [
                "Zero-knowledge vault",
                "Passwords and credentials managed; LLM never sees raw secrets.",
              ],
              [
                "Production-grade",
                "Firecracker isolation, polyglot storage, full observability.",
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: C.gold,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.text,
                      fontWeight: 600,
                    }}
                  >
                    {k} —{" "}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.textDim,
                      lineHeight: 1.7,
                    }}
                  >
                    {v}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                background: C.bg,
                borderRadius: 10,
                padding: "24px 28px",
                border: `1px solid ${C.border}`,
                marginBottom: 16,
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
                Identity
              </div>
              {[
                ["Full name", "MNEME"],
                ["Pronunciation", "/ˈniː.miː/"],
                ["Origin", "Greek · Μνήμη"],
                ["Tagline", "Memory that knows its role."],
                ["CLI", "mneme run · mneme role · mneme vault"],
                ["Domain", "mneme.io / mneme.dev"],
                ["Version", "v2 — Graph + Vault + Secrets"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 10, color: C.textDim }}>{k}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: C.text,
                      fontFamily: k === "CLI" ? "monospace" : "inherit",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                {
                  l: "Graph",
                  c: C.blue,
                  d: "Neo4j — org charts, relationships, project hierarchy",
                },
                {
                  l: "Vectors",
                  c: C.violet,
                  d: "Pinecone — semantic search over docs and history",
                },
                {
                  l: "Vault",
                  c: C.amber,
                  d: "AES-256-GCM encrypted files with per-user keys",
                },
                {
                  l: "Secrets",
                  c: C.crimson,
                  d: "HashiCorp Vault — zero-knowledge credential management",
                },
              ].map(({ l, c, d }) => (
                <div
                  key={l}
                  style={{
                    background: C.bg,
                    borderRadius: 8,
                    padding: "12px 14px",
                    border: `1px solid ${c}28`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: c,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textDim,
                      lineHeight: 1.6,
                    }}
                  >
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
