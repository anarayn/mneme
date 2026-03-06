import { C } from "../constants";
import { Tag } from "../components/Tag";
import { SectionHeader } from "../components/SectionHeader";
import { SERVICES } from "../data/flow";

interface ServicesTabProps {
  animIn: boolean;
}

export function ServicesTab({ animIn }: ServicesTabProps) {
  return (
    <div className="fade">
      <SectionHeader
        title="Services"
        sub="10 deployable units — full service inventory"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 28,
        }}
      >
        {SERVICES.map((svc, i) => (
          <div
            key={svc.name}
            style={{
              background: C.surface,
              border: `1px solid ${C.border2}`,
              borderRadius: 9,
              padding: "14px 20px",
              display: "grid",
              gridTemplateColumns: "220px 90px 220px 120px 1fr",
              alignItems: "center",
              gap: 16,
              opacity: animIn ? 1 : 0,
              transform: animIn ? "none" : "translateX(-8px)",
              transition: `all 0.5s ease ${i * 0.05}s`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: C.gold,
              }}
            >
              {svc.name}
            </span>
            <Tag
              label={svc.lang}
              color={
                svc.lang.startsWith("Go")
                  ? C.blue
                  : svc.lang.startsWith("Rust")
                  ? C.rose
                  : svc.lang.startsWith("Type")
                  ? C.teal
                  : C.amber
              }
            />
            <span
              style={{
                fontSize: 10,
                color: C.textMid,
                fontFamily: "monospace",
              }}
            >
              {svc.runtime}
            </span>
            <span style={{ fontSize: 9, color: C.textDim }}>{svc.inst}</span>
            <span
              style={{
                fontSize: 11,
                color: C.textDim,
                fontStyle: "italic",
              }}
            >
              {svc.purpose}
            </span>
          </div>
        ))}
      </div>

      {/* Repo structure */}
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
          Monorepo Structure
        </div>
        <pre
          style={{
            fontSize: "10.5px",
            lineHeight: 1.9,
            color: C.textMid,
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          {`mneme/
├── apps/
│   └── web/                     # React — Architecture visualization
├── services/
│   ├── edge/                    # TypeScript — Cloudflare Workers
│   ├── gateway/                 # Go — WebSocket session router + VM lifecycle
│   ├── agent/                   # Python — AgentBrain + all memory layers
│   │   ├── mneme/
│   │   │   ├── core/            # brain.py, orchestrator
│   │   │   ├── memory/          # working, episodic, semantic(facade), graph, prospective, relational
│   │   │   ├── roles/           # RoleDNA registry + all 5 role configs
│   │   │   ├── vault/           # DocumentVault, SecretsVault, SecretValue
│   │   │   ├── tools/           # ToolExecutor + all tool implementations
│   │   │   └── llm/             # LLMClient, cost tracker, prompt cache
│   ├── tokenizer/               # Rust — gRPC: token count, context compress, crypto
│   ├── graph-worker/            # Python — Kafka: infer + update Neo4j graph
│   ├── indexer/                 # Python — Kafka: embed + index to Pinecone
│   ├── doc-processor/           # Python — Kafka: chunk PDFs/images (Modal for GPU)
│   ├── scheduler/               # Go — prospective memory trigger evaluator
│   ├── vault-agent/             # Go — HashiCorp Vault sidecar (K8s DaemonSet)
│   └── notifier/                # Go — proactive outbound messages
├── libs/
│   ├── mneme-proto/             # Protobuf (gRPC contracts between services)
│   ├── mneme-types/             # Shared Python types (Episode, Task, Signal, etc.)
│   └── mneme-test/              # Integration test harness
├── infra/
│   ├── terraform/               # All cloud resources (Neo4j, Pinecone, KMS, Vault, Kafka)
│   ├── k8s/                     # Helm charts: gateway, scheduler, vault-agent
│   └── fly/                     # Fly.io app configs (agent, tokenizer)
└── docs/
    ├── HLD.md  LLD.md  ADRs/    # Architecture Decision Records`}
        </pre>
      </div>

      {/* Scaling */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: "18px 24px",
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
          Scaling Milestones
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
                {["Users", "Sessions/day", "Est. cost/day", "Key infra change"].map(
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
              {[
                [
                  "0–10K",
                  "<1K",
                  "~$50",
                  "Single region. Apache AGE (Postgres graph). Pinecone starter. Redis Cloud free. Vault Cloud free tier.",
                ],
                [
                  "10–100K",
                  "<10K",
                  "~$500",
                  "Neo4j AuraDB (migrate from AGE). Redis Cluster. Pinecone Standard. PG read replicas. Vault Pro.",
                ],
                [
                  "100–1M",
                  "<100K",
                  "~$5K",
                  "Multi-region. Kafka managed (Confluent). Prompt caching critical. Graph worker pool. Doc processor Modal.",
                ],
                [
                  "1M+",
                  "1M+",
                  "~$50K",
                  "Dedicated embed GPU cluster. Fine-tuned models. Tiered episodic (hot/cold → S3). Custom HNSW index.",
                ],
              ].map(([u, s, c, inf], i) => (
                <tr
                  key={u}
                  style={{ background: i % 2 === 0 ? "#080810" : C.surface }}
                >
                  <td style={{ padding: "9px 14px", color: C.gold }}>{u}</td>
                  <td style={{ padding: "9px 14px", color: C.textMid }}>{s}</td>
                  <td style={{ padding: "9px 14px", color: C.teal }}>{c}</td>
                  <td
                    style={{
                      padding: "9px 14px",
                      color: C.textDim,
                      fontStyle: "italic",
                      fontFamily: "inherit",
                      fontSize: 10,
                    }}
                  >
                    {inf}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
