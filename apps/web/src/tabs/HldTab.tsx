import { useState } from "react";
import { C } from "../constants";
import { Tag } from "../components/Tag";
import { SectionHeader } from "../components/SectionHeader";
import { HLD_LAYERS } from "../data/hld";

export function HldTab() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="fade">
      <SectionHeader
        title="High-Level Design"
        sub="10 architectural layers — click to expand"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 24,
        }}
      >
        {HLD_LAYERS.map((layer, i) => {
          const isActive = active === i;
          return (
            <div key={layer.id}>
              <div
                onClick={() => setActive(isActive ? null : i)}
                style={{
                  background: isActive ? "#0D0D12" : C.surface,
                  border: `1px solid ${isActive ? layer.color : C.border}`,
                  borderLeft: `4px solid ${layer.color}`,
                  borderRadius: 8,
                  padding: "14px 20px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "180px 1fr auto auto auto",
                  alignItems: "center",
                  gap: 16,
                  transition: "all 0.22s ease",
                  boxShadow: isActive ? `0 0 16px ${layer.color}15` : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: isActive ? layer.color : C.text,
                      fontWeight: 600,
                    }}
                  >
                    {layer.label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: C.textDim,
                      fontStyle: "italic",
                      marginTop: 1,
                    }}
                  >
                    {layer.sub}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {layer.tech.map((t) => (
                    <Tag key={t} label={t} color={layer.color} />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: layer.color,
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {layer.latency}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: C.textDim,
                    whiteSpace: "nowrap",
                    maxWidth: 130,
                    textAlign: "right",
                    fontStyle: "italic",
                  }}
                >
                  {layer.scale}
                </span>
                <span style={{ fontSize: 11, color: C.textDim }}>
                  {isActive ? "▲" : "▼"}
                </span>
              </div>
              {isActive && (
                <div
                  style={{
                    background: "#080810",
                    border: `1px solid ${layer.color}25`,
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    padding: "18px 24px",
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
                    <p
                      style={{
                        fontSize: 12,
                        color: C.textMid,
                        lineHeight: 1.8,
                        margin: 0,
                      }}
                    >
                      {layer.responsibility}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {layer.components.map((c) => (
                        <div
                          key={c}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <div
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: layer.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 11, color: C.textMid }}>
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
