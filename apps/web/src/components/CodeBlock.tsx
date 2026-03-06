import { C } from "../constants";

function hl(code: string): string {
  return code
    .replace(/class\s+\w+/g, (m) => `<span style="color:${C.violet}">${m}</span>`)
    .replace(
      /def\s+\w+|func\s+\w+|fn\s+\w+|pub\s+fn\s+\w+|async\s+fn\s+\w+/g,
      (m) => `<span style="color:${C.teal}">${m}</span>`
    )
    .replace(/("""[\s\S]*?""")/g, (m) => `<span style="color:#4A6A3A">${m}</span>`)
    .replace(/\/\/[^\n]*/g, (m) => `<span style="color:#3A4A30">${m}</span>`)
    .replace(/#[^\n]*/g, (m) => `<span style="color:#3A4A30">${m}</span>`)
    .replace(
      /\b(self|return|if|else|elif|await|async|for|in|let|mut|impl|struct|pub|use|match)\b/g,
      (m) => `<span style="color:${C.rose}">${m}</span>`
    )
    .replace(
      /\b(True|False|None|true|false|null)\b/g,
      (m) => `<span style="color:${C.amber}">${m}</span>`
    )
    .replace(/"([^"\\]|\\.)*"/g, (m) => `<span style="color:#7A8A60">${m}</span>`)
    .replace(/'([^'\\]|\\.)*'/g, (m) => `<span style="color:#7A8A60">${m}</span>`)
    .replace(
      /\b(\d+\.\d+|\d+)\b/g,
      (m) => `<span style="color:${C.teal}">${m}</span>`
    );
}

interface CodeBlockProps {
  code: string;
  file?: string;
  lang?: string;
}

export function CodeBlock({ code, file, lang }: CodeBlockProps) {
  return (
    <div
      style={{
        background: "#040405",
        borderRadius: 8,
        border: `1px solid ${C.border2}`,
        padding: "14px 18px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 5,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
          <div
            key={c}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        {file && (
          <span
            style={{
              fontSize: 9,
              color: "#303038",
              marginLeft: 6,
              fontFamily: "monospace",
            }}
          >
            {file}
          </span>
        )}
        {lang && (
          <span
            style={{
              fontSize: 8,
              background: C.border2,
              color: C.textDim,
              padding: "1px 6px",
              borderRadius: 3,
              marginLeft: "auto",
            }}
          >
            {lang}
          </span>
        )}
      </div>
      <pre
        style={{
          fontSize: "10px",
          lineHeight: 1.75,
          color: "#6A7F96",
          margin: 0,
          whiteSpace: "pre-wrap",
          fontFamily: "'Courier New',monospace",
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: hl(code) }} />
      </pre>
    </div>
  );
}
