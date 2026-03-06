import { useEffect, useState } from "react";
import { C, TABS, type TabId } from "./constants";
import { NameTab } from "./tabs/NameTab";
import { HldTab } from "./tabs/HldTab";
import { MemoryTab } from "./tabs/MemoryTab";
import { GraphTab } from "./tabs/GraphTab";
import { VaultTab } from "./tabs/VaultTab";
import { SecretsTab } from "./tabs/SecretsTab";
import { LldTab } from "./tabs/LldTab";
import { FlowTab } from "./tabs/FlowTab";
import { ServicesTab } from "./tabs/ServicesTab";

export default function Mneme() {
  const [tab, setTab] = useState<TabId>("name");
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 80);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily:
          "'Palatino Linotype','Book Antiqua',Palatino,serif",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeIn 0.35s ease; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `radial-gradient(ellipse 70% 35% at 50% 0%,${C.goldGlow} 0%,transparent 70%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 20px 80px",
        }}
      >
        {/* Masthead */}
        <div
          style={{
            textAlign: "center",
            padding: "52px 0 40px",
            opacity: animIn ? 1 : 0,
            transform: animIn ? "none" : "translateY(-16px)",
            transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: C.goldDim,
              marginBottom: 16,
            }}
          >
            Project Architecture · v2
          </div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: "clamp(48px,9vw,88px)",
                fontWeight: 400,
                letterSpacing: "0.15em",
                color: C.gold,
                textShadow: `0 0 60px ${C.goldGlow},0 0 120px ${C.goldGlow}`,
                lineHeight: 1,
              }}
            >
              MNEME
            </div>
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -24,
                fontSize: 24,
                color: C.goldDim,
                fontStyle: "italic",
                opacity: 0.55,
              }}
            >
              Μνήμη
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.textMid,
              fontStyle: "italic",
              letterSpacing: "0.04em",
              marginBottom: 6,
            }}
          >
            Memory that knows its role.
          </div>
          <div
            style={{ fontSize: 11, color: C.textDim, marginBottom: 20 }}
          >
            Graph · Vectors · Vault · Secrets — fully integrated
          </div>
          <div
            style={{
              width: 44,
              height: 1,
              background: `linear-gradient(to right,transparent,${C.gold},transparent)`,
              margin: "0 auto",
            }}
          />
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: 28,
            justifyContent: "center",
            flexWrap: "wrap",
            opacity: animIn ? 1 : 0,
            transition: "opacity 0.8s 0.3s",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.06em",
                background: tab === t.id ? C.gold : C.surface,
                color: tab === t.id ? C.bg : C.textDim,
                border: `1px solid ${tab === t.id ? C.gold : C.border2}`,
                fontWeight: tab === t.id ? 700 : 400,
                transition: "all 0.2s ease",
                boxShadow:
                  tab === t.id ? `0 0 18px ${C.goldGlow}` : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "name" && <NameTab />}
        {tab === "hld" && <HldTab />}
        {tab === "memory" && <MemoryTab />}
        {tab === "graph" && <GraphTab />}
        {tab === "vault" && <VaultTab />}
        {tab === "secrets" && <SecretsTab />}
        {tab === "lld" && <LldTab />}
        {tab === "flow" && <FlowTab />}
        {tab === "services" && <ServicesTab animIn={animIn} />}
      </div>
    </div>
  );
}
