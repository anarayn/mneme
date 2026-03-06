export const C = {
  bg: "#060608",
  surface: "#0B0B0E",
  border: "#14141A",
  border2: "#1C1C24",
  gold: "#C9A84C",
  goldDim: "#7A6530",
  goldGlow: "rgba(201,168,76,0.12)",
  text: "#E2DDD4",
  textDim: "#5C5850",
  textMid: "#8A8580",
  blue: "#4A7FA5",
  teal: "#4A9A8A",
  rose: "#A55A6A",
  violet: "#7A5AA5",
  amber: "#A5804A",
  green: "#5A8A5A",
  crimson: "#8A3A4A",
  cyan: "#3A8A9A",
  slate: "#6A7A8A",
};

export const TABS = [
  { id: "name", label: "MNEME" },
  { id: "hld", label: "HLD" },
  { id: "memory", label: "Memory Plane" },
  { id: "graph", label: "Graph & Hierarchy" },
  { id: "vault", label: "Document Vault" },
  { id: "secrets", label: "Secrets & Auth" },
  { id: "lld", label: "LLD Modules" },
  { id: "flow", label: "Data Flow" },
  { id: "services", label: "Services" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
