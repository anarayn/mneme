import { useEffect, useState } from "react";
import { C } from "../constants";
import { SectionHeader } from "../components/SectionHeader";
import { DATAFLOW } from "../data/flow";

export function FlowTab() {
  const [flowStep, setFlowStep] = useState(-1);

  useEffect(() => {
    setFlowStep(-1);
    let i = 0;
    const t = setInterval(() => {
      setFlowStep(i++);
      if (i >= DATAFLOW.length) clearInterval(t);
    }, 260);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade">
      <SectionHeader
        title="Data Flow"
        sub="One user message → response, with graph + vault + secrets"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 28,
        }}
      >
        {DATAFLOW.map((step, i) => (
          <div
            key={i}
            style={{
              background: i <= flowStep ? "#0C0C12" : C.surface,
              border: `1px solid ${i <= flowStep ? step.color : C.border}`,
              borderRadius: 7,
              padding: "12px 18px",
              display: "grid",
              gridTemplateColumns: "28px 1fr 1fr auto",
              alignItems: "center",
              gap: 16,
              opacity: i <= flowStep ? 1 : 0.3,
              transform: i <= flowStep ? "none" : "translateX(-6px)",
              transition: `all 0.4s ease ${i * 0.04}s`,
              boxShadow:
                i === flowStep ? `0 0 14px ${step.color}30` : "none",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: i <= flowStep ? step.color : C.border2,
                color: i <= flowStep ? C.bg : C.textDim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: i <= flowStep ? C.text : C.textDim,
                  fontWeight: 600,
                }}
              >
                {step.from}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: step.color,
                  opacity: 0.6,
                }}
              >
                →
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: i <= flowStep ? step.color : C.textDim,
                  fontWeight: 600,
                }}
              >
                {step.to}
              </span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                fontStyle: "italic",
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: i <= flowStep ? step.color : C.textDim,
                background:
                  i <= flowStep ? `${step.color}12` : "transparent",
                padding: "2px 7px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {step.ms}
            </div>
          </div>
        ))}
      </div>

      {/* Latency budget */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: "20px 26px",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: C.goldDim,
            marginBottom: 16,
          }}
        >
          P50 Latency Budget — Warm Session
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: 10,
          }}
        >
          {[
            { l: "Edge routing", ms: "<5ms", pct: 1, c: C.teal },
            { l: "Session gateway", ms: "<10ms", pct: 2, c: C.blue },
            { l: "Graph lookup (Neo4j)", ms: "~20ms", pct: 4, c: C.blue },
            { l: "Vector recall (Pinecone)", ms: "~50ms", pct: 11, c: C.violet },
            { l: "Redis + Postgres", ms: "~12ms", pct: 3, c: C.rose },
            { l: "Vault fetch (if needed)", ms: "~20ms", pct: 4, c: C.crimson },
            { l: "LLM API (sys cached)", ms: "~330ms", pct: 74, c: C.gold },
            { l: "Async post (non-blocking)", ms: "0ms", pct: 0, c: C.green },
          ].map((item) => (
            <div
              key={item.l}
              style={{
                background: C.bg,
                borderRadius: 8,
                padding: "12px 14px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{ fontSize: 10, color: C.textMid, marginBottom: 7 }}
              >
                {item.l}
              </div>
              <div
                style={{
                  height: 4,
                  background: C.border2,
                  borderRadius: 2,
                  marginBottom: 7,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${item.pct}%`,
                    background: item.c,
                    borderRadius: 2,
                    minWidth: item.pct > 0 ? 3 : 0,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: item.c,
                  fontFamily: "monospace",
                }}
              >
                {item.ms}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${C.border}`,
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 11, color: C.textDim }}>
            Total wall time to first token (warm)
          </span>
          <span
            style={{
              fontSize: 15,
              color: C.gold,
              fontFamily: "monospace",
            }}
          >
            ~250ms p50 · ~480ms p99
          </span>
        </div>
      </div>
    </div>
  );
}
