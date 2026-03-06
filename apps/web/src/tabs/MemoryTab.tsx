import { useState } from "react";
import { C } from "../constants";
import { Tag } from "../components/Tag";
import { CodeBlock } from "../components/CodeBlock";
import { SectionHeader } from "../components/SectionHeader";
import { MEMORY_STORES } from "../data/memory";

export function MemoryTab() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="fade">
      <SectionHeader
        title="Memory Plane"
        sub="5 storage primitives — each chosen for its access pattern"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {MEMORY_STORES.map((store, i) => {
          const isActive = active === i;
          return (
            <div key={store.id}>
              <div
                onClick={() => setActive(isActive ? null : i)}
                style={{
                  background: isActive ? "#0D0D12" : C.surface,
                  border: `1px solid ${isActive ? store.color : C.border2}`,
                  borderRadius: 10,
                  padding: "16px 22px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 80px 120px auto",
                  alignItems: "center",
                  gap: 16,
                  transition: "all 0.22s ease",
                  boxShadow: isActive
                    ? `0 0 20px ${store.color}18`
                    : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{store.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: isActive ? store.color : C.text,
                      fontWeight: 600,
                    }}
                  >
                    {store.label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {store.owns.slice(0, 3).map((o) => (
                    <Tag key={o} label={o} color={store.color} />
                  ))}
                  {store.owns.length > 3 && (
                    <Tag
                      label={`+${store.owns.length - 3} more`}
                      color={C.textDim}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    color: store.color,
                  }}
                >
                  {store.latency}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: C.textDim,
                    fontStyle: "italic",
                  }}
                >
                  {store.when}
                </span>
                <span style={{ fontSize: 11, color: C.textDim }}>
                  {isActive ? "▲" : "▼"}
                </span>
              </div>
              {isActive && (
                <div
                  style={{
                    background: "#080810",
                    border: `1px solid ${store.color}22`,
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "20px 24px",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 24,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: C.textDim,
                          marginBottom: 8,
                        }}
                      >
                        Why this store
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: C.textMid,
                          lineHeight: 1.8,
                          marginBottom: 12,
                        }}
                      >
                        {store.why}
                      </p>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: C.textDim,
                          marginBottom: 8,
                        }}
                      >
                        Owns
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {store.owns.map((o) => (
                          <div
                            key={o}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: store.color,
                              }}
                            />
                            <span style={{ fontSize: 11, color: C.textDim }}>
                              {o}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <CodeBlock
                      code={store.schema}
                      file="schema"
                      lang="Schema"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision matrix */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: "20px 24px",
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
          Query Routing Decision Matrix
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 10,
              fontFamily: "monospace",
            }}
          >
            <thead>
              <tr>
                {[
                  "Query type",
                  "Example",
                  "Primary DB",
                  "Secondary",
                  "Latency target",
                ].map((h) => (
                  <td
                    key={h}
                    style={{
                      padding: "8px 12px",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: C.textDim,
                      borderBottom: `1px solid ${C.border2}`,
                    }}
                  >
                    {h}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["STRUCTURAL", "Who's on Project Atlas?", "Neo4j", "—", "<20ms"],
                ["SEMANTIC", "Find docs like this email", "Pinecone", "—", "<50ms"],
                ["FACTUAL", "What's due this week?", "PostgreSQL", "—", "<10ms"],
                ["HYBRID", "Docs by Sarah's team on Atlas", "Neo4j → Pinecone", "—", "<70ms"],
                ["EPISODIC", "Have I dealt with this before?", "Pinecone (episodes)", "—", "<50ms"],
                ["RELATIONAL", "What's my trust level with Raj?", "Neo4j", "PostgreSQL", "<25ms"],
                ["DEADLINE", "Statute of limitations?", "PostgreSQL", "Prospective", "<10ms"],
              ].map(([qt, ex, db1, db2, lat], i) => (
                <tr
                  key={qt}
                  style={{ background: i % 2 === 0 ? "#080810" : C.surface }}
                >
                  <td style={{ padding: "8px 12px", color: C.blue }}>{qt}</td>
                  <td
                    style={{
                      padding: "8px 12px",
                      color: C.textDim,
                      fontStyle: "italic",
                      fontFamily: "inherit",
                    }}
                  >
                    {ex}
                  </td>
                  <td style={{ padding: "8px 12px", color: C.gold }}>{db1}</td>
                  <td style={{ padding: "8px 12px", color: C.textDim }}>{db2}</td>
                  <td style={{ padding: "8px 12px", color: C.teal }}>{lat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
