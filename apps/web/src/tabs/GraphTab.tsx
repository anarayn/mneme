import { useState } from "react";
import { C } from "../constants";
import { Tag } from "../components/Tag";
import { CodeBlock } from "../components/CodeBlock";
import { SectionHeader } from "../components/SectionHeader";
import { GRAPH_QUERIES } from "../data/graph";

export function GraphTab() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="fade">
      <SectionHeader
        title="Graph & Hierarchy"
        sub="Neo4j — org charts, project trees, relationship graphs"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            title: "Why graph, not SQL?",
            body: "A 5-level org chart traversal is an 8-table JOIN in SQL. In Neo4j it's one MATCH query regardless of depth. Relationship types (REPORTS_TO, WORKS_ON, HAS_RELATIONSHIP) are first-class — not foreign keys in a junction table.",
          },
          {
            title: "Self-building graph",
            body: "MNEME infers the org structure from observed behavior. Approval patterns, CC chains, ownership language, meeting roles. User never inputs the org chart manually — it emerges from interactions with progressively increasing confidence.",
          },
          {
            title: "Graph-aware vector search",
            body: "Pinecone metadata filters accept graph entity IDs. 'Find documents on Project Atlas owned by Sarah's team' = graph traversal to get person IDs → Pinecone filter. Semantic search that knows about structure.",
          },
          {
            title: "Start with Apache AGE",
            body: "For early stage: Apache AGE is a Postgres extension that adds Cypher query support. Zero new infrastructure — graph on your existing Postgres. Queries are identical to Neo4j. Migrate to AuraDB at 100K+ users.",
          },
        ].map(({ title, body }) => (
          <div
            key={title}
            style={{
              background: C.surface,
              border: `1px solid ${C.border2}`,
              borderRadius: 10,
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.blue,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {title}
            </div>
            <div
              style={{ fontSize: 12, color: C.textDim, lineHeight: 1.75 }}
            >
              {body}
            </div>
          </div>
        ))}
      </div>

      {/* Cypher queries */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.goldDim,
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          Example Cypher Queries — click to expand
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GRAPH_QUERIES.map((gq, i) => {
            const isA = active === i;
            return (
              <div key={i}>
                <div
                  onClick={() => setActive(isA ? null : i)}
                  style={{
                    background: isA ? "#0D0D12" : C.surface,
                    border: `1px solid ${isA ? C.blue : C.border2}`,
                    borderRadius: 8,
                    padding: "12px 18px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Tag label={gq.type} color={C.blue} />
                    <span style={{ fontSize: 12, color: isA ? C.blue : C.text }}>
                      {gq.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {isA ? "▲" : "▼"}
                  </span>
                </div>
                {isA && (
                  <div
                    style={{
                      background: "#080810",
                      border: `1px solid ${C.blue}22`,
                      borderTop: "none",
                      borderRadius: "0 0 8px 8px",
                      padding: "16px 20px",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                      }}
                    >
                      <CodeBlock code={gq.q} lang="Cypher" />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              color: C.textDim,
                              marginBottom: 8,
                            }}
                          >
                            Result
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              color: C.teal,
                              lineHeight: 1.7,
                              fontStyle: "italic",
                            }}
                          >
                            {gq.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node schema */}
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
          Graph Schema — Node Labels & Edge Types
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                marginBottom: 10,
                letterSpacing: "0.1em",
              }}
            >
              Node Labels
            </div>
            {[
              { n: "Person", c: C.gold, attrs: "name, role, title, comm_style, sensitivities[]" },
              { n: "Project", c: C.teal, attrs: "name, status, priority, start_date, end_date" },
              { n: "Document", c: C.violet, attrs: "id, title, type, storage_ref (→ vault)" },
              { n: "Team", c: C.blue, attrs: "name, department_id" },
              { n: "Company", c: C.amber, attrs: "name, domain, industry" },
              { n: "Initiative", c: C.green, attrs: "name, quarter, goal" },
              { n: "Credential", c: C.crimson, attrs: "id, label, type, vault_path (reference only)" },
            ].map(({ n, c, attrs }) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 7,
                  alignItems: "baseline",
                }}
              >
                <Tag label={`:${n}`} color={c} />
                <span style={{ fontSize: 10, color: C.textDim }}>{attrs}</span>
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                marginBottom: 10,
                letterSpacing: "0.1em",
              }}
            >
              Edge Types
            </div>
            {[
              ["REPORTS_TO", "Person → Person", "confidence, inferred_from"],
              ["WORKS_ON", "Person → Project", "role, since"],
              ["MEMBER_OF", "Person → Team", "—"],
              ["OWNS", "Person → Document", "—"],
              ["BELONGS_TO", "Document → Project", "—"],
              ["DEPENDS_ON", "Project → Project", "type"],
              ["HAS_RELATIONSHIP", "Person ↔ Person", "type, strength, context"],
              ["HAS_ACCESS_TO", "Person → Credential", "granted_at, scope"],
            ].map(([edge, path, props]) => (
              <div
                key={edge}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 7,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <Tag label={`[:${edge}]`} color={C.blue} />
                <span style={{ fontSize: 10, color: C.textMid }}>{path}</span>
                {props !== "—" && (
                  <span
                    style={{
                      fontSize: 9,
                      color: C.textDim,
                      fontStyle: "italic",
                    }}
                  >
                    {props}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
