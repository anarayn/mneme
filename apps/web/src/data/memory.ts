import { C } from "../constants";

export const MEMORY_STORES = [
  {
    id: "redis",
    label: "Redis 7",
    color: C.rose,
    icon: "⚡",
    owns: [
      "Working memory",
      "Procedural routines (hot cache)",
      "Session state",
      "Prospective trigger cache",
      "VM session registry",
    ],
    why: "Sub-millisecond reads. Session-scoped TTL. Survives pod restart. Sorted sets for open-loop priority queue.",
    schema: `# Key schema
mneme:wm:{session_id}:focus      → JSON (current Task)
mneme:wm:{session_id}:chunks     → JSON list (active chunks)
mneme:wm:{session_id}:loops      → ZSET score=due_timestamp
mneme:vm:{user_id}               → JSON (Fly machine metadata)
mneme:triggers:{user_id}         → HASH (event pattern → action)
mneme:proc:{role}:{routine_name} → JSON (routine definition)`,
    latency: "<2ms",
    when: "Every agent turn",
  },
  {
    id: "pinecone",
    label: "Pinecone",
    color: C.violet,
    icon: "🔮",
    owns: [
      "Episodic memory (personal history)",
      "Document chunk embeddings",
      "Message/email history",
      "Semantic search index",
    ],
    why: "Dedicated ANN index. Namespace per user = strict isolation. Metadata filters enable graph-joined semantic search. 1024-dim voyage-3 embeddings.",
    schema: `# Namespace strategy
user_{id}:episodes   → episodic memories (emotion-weighted)
user_{id}:documents  → document chunks (with doc_id, project_id FKs)
user_{id}:messages   → communication history

# Each vector metadata includes graph FKs for hybrid queries:
{
  "document_id": "doc_abc",   # FK → PostgreSQL document
  "project_id":  "proj_xyz",  # FK → Neo4j project node
  "person_id":   "p_raj",     # FK → Neo4j person node
  "chunk_index": 3,
  "importance":  0.85,
  "privilege":   "none"       # lawyer role: attorney_client | none
}`,
    latency: "<50ms",
    when: "Before each LLM call (parallel with other lookups)",
  },
  {
    id: "neo4j",
    label: "Neo4j AuraDB",
    color: C.blue,
    icon: "🕸",
    owns: [
      "Company org chart",
      "Person relationships",
      "Project membership",
      "Document ownership graph",
      "Team hierarchy",
      "Initiative → Project → Milestone tree",
    ],
    why: "Graph traversal is O(relationship depth) not O(table size). Joins that would be 8-table SQL are single MATCH queries. Infers structure from observed behavior.",
    schema: `// Node labels
(:Company), (:Department), (:Team)
(:Person {name, role, comm_style, sensitivities[]})
(:Project {name, status, priority})
(:Document {id, title, type, storage_ref})
(:Initiative), (:Milestone {due_date, status})
(:Credential {id, type, vault_path})  // reference only — no secret

// Typed edges
(:Person)-[:REPORTS_TO]->(:Person)
(:Person)-[:MEMBER_OF]->(:Team)
(:Person)-[:WORKS_ON {role,since}]->(:Project)
(:Person)-[:OWNS]->(:Document)
(:Document)-[:BELONGS_TO]->(:Project)
(:Project)-[:UNDER]->(:Initiative)
(:Project)-[:DEPENDS_ON]->(:Project)
(:Person)-[:HAS_RELATIONSHIP {type,strength}]->(:Person)
(:Person)-[:HAS_ACCESS_TO]->(:Credential)  // permission edge`,
    latency: "<20ms",
    when: "Structural queries: org lookups, path traversal, project membership",
  },
  {
    id: "postgres",
    label: "PostgreSQL 16",
    color: C.green,
    icon: "🐘",
    owns: [
      "Structured person facts",
      "Document metadata",
      "Project milestones + deadlines",
      "Prospective intent store",
      "Semantic fact updates (Bayesian)",
      "Document access log",
      "Secret reference table",
    ],
    why: "Structured queryable facts with time. Deadline tracking needs range queries (WHERE due_date < NOW() + 7 days). ACID for audit logs. pgvector for lightweight similarity on structured data.",
    schema: `-- Core tables
mneme.person_facts     (user_id, person_id→graph, fact_key, fact_value, confidence, updated_at)
mneme.documents        (id, user_id, graph_node_id, title, type, project_id, storage_ref, summary)
mneme.doc_versions     (doc_id, version, storage_ref, changed_by, changed_at, diff_summary)
mneme.project_milestones (id, project_id→graph, name, due_date, owner_id→graph, status)
mneme.prospective_intents (id, user_id, type, pattern, action_json, due_at, criticality, fired)
mneme.secret_refs      (id, user_id, label, vault_path, type, last_accessed, created_at)
mneme.doc_access_log   (doc_id, user_id, action, agent_tool, timestamp, session_id)
mneme.secret_access_log(secret_ref_id, user_id, action, timestamp, session_id, purpose)`,
    latency: "<10ms",
    when: "Deadline queries, structured fact lookups, audit trail writes",
  },
  {
    id: "kafka",
    label: "Apache Kafka",
    color: C.amber,
    icon: "📨",
    owns: [
      "Session turn events",
      "Episode store queue",
      "Graph update queue",
      "Document index queue",
      "Prospective trigger bus",
      "Secret rotation events",
    ],
    why: "Decouples agent loop from all async work. Agent fires events, returns response immediately. Workers consume at their own pace. Full replay for debugging.",
    schema: `# Topic schema
mneme.session.turns          → {user_id, input, output, session_id, timestamp}
mneme.memory.episode.store   → {user_id, episode, namespace, importance}
mneme.graph.updates          → {user_id, entity_type, operation, data}
mneme.documents.index        → {user_id, doc_id, storage_ref, project_id}
mneme.prospective.triggers   → {user_id, event, matched_intents[]}
mneme.secrets.rotation       → {user_id, secret_ref_id, rotation_due}`,
    latency: "non-blocking",
    when: "Post-response always — never in hot path",
  },
];
