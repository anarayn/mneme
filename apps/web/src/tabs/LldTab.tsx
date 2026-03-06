import { useState } from "react";
import { C } from "../constants";
import { Tag } from "../components/Tag";
import { CodeBlock } from "../components/CodeBlock";
import { SectionHeader } from "../components/SectionHeader";
import { LLD_MODULES } from "../data/lld";

export function LldTab() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="fade">
      <SectionHeader
        title="Low-Level Design"
        sub="Core module specifications — click to expand"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LLD_MODULES.map((mod, i) => {
          const isA = active === i;
          return (
            <div key={mod.id}>
              <div
                onClick={() => setActive(isA ? null : i)}
                style={{
                  background: isA ? "#0D0D12" : C.surface,
                  border: `1px solid ${isA ? mod.color : C.border2}`,
                  borderRadius: 10,
                  padding: "14px 20px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.22s ease",
                  boxShadow: isA ? `0 0 20px ${mod.color}14` : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: mod.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isA ? mod.color : C.text,
                        fontWeight: 600,
                      }}
                    >
                      {mod.label}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: C.textDim,
                        fontFamily: "monospace",
                        marginTop: 1,
                      }}
                    >
                      {mod.file}
                    </div>
                  </div>
                  <Tag label={mod.layer} color={mod.color} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textDim,
                      fontStyle: "italic",
                      maxWidth: 240,
                      textAlign: "right",
                    }}
                  >
                    {mod.purpose}
                  </div>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {isA ? "▲" : "▼"}
                  </span>
                </div>
              </div>
              {isA && (
                <div
                  style={{
                    background: "#080810",
                    border: `1px solid ${mod.color}20`,
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "22px 26px",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "260px 1fr",
                      gap: 24,
                    }}
                  >
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
                        Interfaces
                      </div>
                      {mod.interfaces.map((iface) => (
                        <div
                          key={iface}
                          style={{
                            fontSize: 9,
                            fontFamily: "monospace",
                            color: C.teal,
                            background: `${C.teal}0A`,
                            padding: "4px 8px",
                            borderRadius: 4,
                            marginBottom: 4,
                          }}
                        >
                          {iface}
                        </div>
                      ))}
                    </div>
                    <CodeBlock code={mod.code} file={mod.file} lang="Python" />
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
