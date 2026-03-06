export const GRAPH_QUERIES = [
  {
    title: "Who's on Project Atlas?",
    type: "STRUCTURAL",
    q: `MATCH (p:Person)-[:WORKS_ON]->(proj:Project {name:"Atlas"})
RETURN p.name, p.role, p.communication_style
ORDER BY p.role`,
    result: "Exact list. 100% recall. No hallucination possible.",
  },
  {
    title: "Decision chain to CEO",
    type: "TRAVERSAL",
    q: `MATCH path = shortestPath(
  (me:Person {id:$user_id})-[:REPORTS_TO*]->(ceo:Person {title:"CEO"})
)
RETURN [n IN nodes(path) | n.name] AS chain`,
    result: "Org hierarchy path in one query regardless of depth.",
  },
  {
    title: "Find docs on Atlas owned by Raj's reports",
    type: "HYBRID",
    q: `// Step 1: Graph → get person IDs
MATCH (raj:Person {name:"Raj"})<-[:REPORTS_TO*1..2]-(report:Person)
      -[:OWNS]->(doc:Document)-[:BELONGS_TO]->(proj:Project {name:"Atlas"})
RETURN doc.id AS doc_id, report.name AS owner

// Step 2: Pinecone → semantic search filtered by those doc IDs
// → graph-aware semantic search`,
    result:
      "Hybrid query: graph gives structure, vectors give semantic relevance.",
  },
  {
    title: "Who bridges Engineering ↔ Legal?",
    type: "PATH",
    q: `MATCH (eng:Person)-[:MEMBER_OF]->(:Team {name:"Engineering"}),
      (leg:Person)-[:MEMBER_OF]->(:Team {name:"Legal"}),
      path = shortestPath((eng)-[:HAS_RELATIONSHIP*..4]-(leg))
WHERE length(path) <= 3
RETURN path`,
    result: "Cross-team connectors — impossible with vectors alone.",
  },
  {
    title: "Infer org structure from behavior",
    type: "INFERENCE",
    q: `// MNEME observes: "Sarah approved Raj's request"
// → infers Sarah is above Raj

MERGE (sarah:Person {name:"Sarah"})
MERGE (raj:Person {name:"Raj"})
MERGE (raj)-[r:REPORTS_TO]->(sarah)
ON CREATE SET r.confidence = 0.7, r.inferred_from = "approval_pattern"
ON MATCH SET  r.confidence = r.confidence + 0.1  // strengthen with each signal`,
    result:
      "Graph builds itself from observed behavior. No manual input needed.",
  },
];
