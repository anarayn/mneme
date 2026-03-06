interface TagProps {
  label: string;
  color: string;
}

export function Tag({ label, color }: TagProps) {
  return (
    <span
      style={{
        fontSize: 9,
        background: `${color}18`,
        color,
        padding: "2px 7px",
        borderRadius: 4,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
