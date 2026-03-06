import { C } from "../constants";

export const DATAFLOW = [
  { from: "User", to: "Cloudflare Worker", label: "WS connect + JWT", ms: "<5ms", color: C.teal },
  { from: "Cloudflare Worker", to: "Session Gateway (Go)", label: "Auth passed, routed", ms: "<10ms", color: C.blue },
  { from: "Session Gateway", to: "Fly VM (Python)", label: "Wake/launch Firecracker VM", ms: "<10ms warm / 300ms cold", color: C.gold },
  { from: "Fly VM", to: "Redis", label: "Working memory + triggers", ms: "<2ms", color: C.rose },
  { from: "Fly VM", to: "Neo4j", label: "Graph context (who is this person?)", ms: "<20ms", color: C.blue },
  { from: "Fly VM", to: "Pinecone", label: "Episodic + doc semantic recall", ms: "<50ms", color: C.violet },
  { from: "Fly VM", to: "PostgreSQL", label: "Structured facts + deadlines", ms: "<10ms", color: C.green },
  { from: "Fly VM", to: "Vault (if tool needs cred)", label: "Secret fetch → tool → API", ms: "<20ms", color: C.crimson },
  { from: "Fly VM", to: "Anthropic API", label: "LLM stream (sys prompt cached)", ms: "100–400ms", color: C.amber },
  { from: "Fly VM", to: "Kafka", label: "Async: episode + graph + doc index", ms: "non-blocking", color: C.slate },
  { from: "Kafka", to: "Graph Worker", label: "Infer relationships from turn", ms: "seconds", color: C.green },
  { from: "Kafka", to: "Episode Indexer", label: "Embed + store in Pinecone", ms: "seconds", color: C.violet },
  { from: "Kafka", to: "Doc Chunker", label: "Chunk + index new documents", ms: "seconds–minutes", color: C.amber },
];

export const SERVICES = [
  { name: "mneme-edge", lang: "TypeScript", runtime: "Cloudflare Workers", inst: "Global PoPs", purpose: "Auth, routing, rate limiting" },
  { name: "mneme-gateway", lang: "Go 1.22", runtime: "Kubernetes (GKE)", inst: "3–20 pods", purpose: "WebSocket session routing + VM lifecycle" },
  { name: "mneme-agent", lang: "Python 3.12", runtime: "Fly Machines (Firecracker)", inst: "1 per active session", purpose: "Core AgentBrain + all memory coordination" },
  { name: "mneme-tokenizer", lang: "Rust 1.78", runtime: "Fly sidecar / gRPC", inst: "1 per agent pod", purpose: "Token counting, context compression, crypto helpers" },
  { name: "mneme-graph-worker", lang: "Python 3.12", runtime: "Cloud Run (scale-to-zero)", inst: "0–50", purpose: "Infer graph structure from observed interactions" },
  { name: "mneme-indexer", lang: "Python 3.12", runtime: "Cloud Run", inst: "0–100", purpose: "Async episode + document chunk indexing → Pinecone" },
  { name: "mneme-doc-processor", lang: "Python 3.12", runtime: "Modal (GPU for vision)", inst: "0–20", purpose: "PDF/image processing, chunking, OCR" },
  { name: "mneme-scheduler", lang: "Go 1.22", runtime: "Kubernetes (HA pair)", inst: "2", purpose: "Prospective memory trigger evaluation" },
  { name: "mneme-vault-agent", lang: "Go 1.22", runtime: "Kubernetes DaemonSet", inst: "1 per node", purpose: "HashiCorp Vault sidecar — token renewal, secret injection" },
  { name: "mneme-notifier", lang: "Go 1.22", runtime: "Cloud Run", inst: "0–50", purpose: "Proactive outbound messages (prospective memory fires)" },
];
