import { C } from "../constants";

interface SectionHeaderProps {
  title: string;
  sub?: string;
}

export function SectionHeader({ title, sub }: SectionHeaderProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: C.goldDim,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
