import { C } from "../constants";

export const LLD_MODULES = [
  {
    id: "brain",
    label: "AgentBrain",
    layer: "Orchestration",
    color: C.gold,
    file: "mneme/core/brain.py",
    purpose: "9-step processing loop — coordinates all memory layers",
    interfaces: [
      "process(input) → AsyncIterator[str]",
      "switch_role(role)",
      "get_state() → SessionState",
    ],
    code: `class AgentBrain:
    def __init__(self, user_id: str, role: str, session_id: str):
        dna = ROLE_REGISTRY[role]
        self.user_id, self.session_id = user_id, session_id
        # Memory layers
        self.sensory     = SensoryBuffer(dna)
        self.working     = WorkingMemory(dna, session_id)
        self.episodic    = EpisodicMemory(dna, user_id)
        self.semantic    = SemanticMemory(dna, user_id)   # facade: graph+vec+pg
        self.procedural  = ProceduralMemory(dna.routines)
        self.prospective = ProspectiveMemory(dna, user_id)
        self.relational  = RelationalMemory(dna, user_id)
        self.extensions  = [ext(self) for ext in dna.extensions]
        # Infrastructure
        self.llm      = LLMClient(dna)
        self.tools    = ToolExecutor(DocumentVault(user_id),
                                     SecretsVault(user_id))
        self.tracer   = LangfuseTracer(session_id)
        self.emitter  = KafkaEmitter()

    async def process(self, raw: RawInput) -> AsyncIterator[str]:
        span   = self.tracer.start_span("process")
        signal = self.sensory.ingest(raw)

        # Extension pre-processing (circuit breaker, privilege check)
        for ext in self.extensions:
            signal = await ext.pre_process(signal)

        # Parallel memory hydration
        fired, social, knowledge, history = await asyncio.gather(
            self.prospective.check(signal),
            self.relational.read_situation(signal),
            self.semantic.lookup(signal),         # graph + vec + pg
            self.episodic.recall_similar(signal.content, k=5),
        )

        task = self.working.set_focus(Task(
            signal=signal, social=social,
            knowledge=knowledge, history=history, intentions=fired
        ))

        routine = self.procedural.match(signal)
        if routine:
            async for chunk in self._wrap(routine.execute(task)):
                yield chunk
        else:
            async for chunk in self.llm.stream(task, self.tools.schemas()):
                yield chunk
                if chunk.tool_calls:
                    results = await self.tools.execute_parallel(
                        chunk.tool_calls, self.session_id
                    )
                    task.add_tool_results(results)

        # Non-blocking post-processing
        self.emitter.emit("mneme.session.turns", task.to_event())
        span.finish()`,
  },
  {
    id: "semantic_facade",
    label: "SemanticMemory (facade)",
    layer: "Memory Plane",
    color: C.violet,
    file: "mneme/memory/semantic.py",
    purpose:
      "Routes queries to graph, vectors, or postgres based on query type",
    interfaces: [
      "lookup(signal) → KnowledgeContext",
      "update(entity, observation)",
      "query_graph(cypher) → list",
      "search_docs(query, filters) → list",
    ],
    code: `class SemanticMemory:
    """
    Facade over Neo4j (graph) + Pinecone (vectors) + PostgreSQL (facts).
    AgentBrain calls this — doesn't care which DB answers.
    """
    def __init__(self, dna: RoleDNA, user_id: str):
        self.user_id  = user_id
        self.graph    = Neo4jClient(user_id)
        self.vectors  = PineconeClient(user_id)
        self.pg       = PostgresPool()
        self.router   = QueryRouter()        # classifies query type
        self.voyage   = VoyageClient()

    async def lookup(self, signal: Signal) -> KnowledgeContext:
        """Parallel lookup across all three stores."""
        q_type = await self.router.classify(signal.content)

        tasks = []
        if q_type in ("STRUCTURAL","HYBRID","ANY"):
            tasks.append(self._graph_lookup(signal))
        if q_type in ("SEMANTIC","HYBRID","ANY"):
            tasks.append(self._vector_lookup(signal))
        if q_type in ("FACTUAL","DEADLINE","ANY"):
            tasks.append(self._pg_lookup(signal))

        results = await asyncio.gather(*tasks)
        return KnowledgeContext.merge(results)

    async def hybrid_doc_search(self, query: str,
                                 filters: dict) -> list[Document]:
        """
        Step 1: Graph → entity IDs matching structural filter
        Step 2: Pinecone → semantic search filtered by those IDs
        """
        entity_ids = await self.graph.resolve_entities(filters)

        return await self.vectors.query(
            vector=await self.voyage.embed(query),
            filter={
                "project_id": {"$in": [e.id for e in entity_ids
                                       if e.type=="project"]},
                "person_id":  {"$in": [e.id for e in entity_ids
                                       if e.type=="person"]},
            },
            namespace=f"user_{self.user_id}:documents",
            top_k=10
        )

    async def update_from_observation(self, interaction: Interaction):
        """
        Infer and update graph structure from observed behavior.
        Called by async worker after each turn.
        """
        inferences = await self._infer_relationships(interaction)
        for inf in inferences:
            if inf.confidence > 0.7:
                await self.graph.merge_edge(inf)`,
  },
  {
    id: "query_router",
    label: "QueryRouter",
    layer: "Memory Plane",
    color: C.cyan,
    file: "mneme/memory/router.py",
    purpose: "Classifies queries to route to correct storage layer",
    interfaces: [
      "classify(query) → QueryType",
      "explain(query) → str",
    ],
    code: `class QueryRouter:
    """
    Fast Haiku call to classify which DB(s) to hit.
    Called before every semantic.lookup() — must be <50ms.
    Results cached per session for repeated patterns.
    """
    QUERY_TYPES = {
        "STRUCTURAL":  "org chart, team membership, who reports to whom",
        "SEMANTIC":    "find similar documents, what did we discuss about X",
        "FACTUAL":     "deadlines, scheduled dates, contact info",
        "HYBRID":      "docs on Project X owned by Sarah's team",
        "RELATIONSHIP":"trust level, history between two people",
    }

    async def classify(self, query: str) -> QueryType:
        # Check cache first (same query pattern = same route)
        cache_key = f"qroute:{hash(query[:60])}"
        cached = await self.redis.get(cache_key)
        if cached: return QueryType(cached)

        result = await self.haiku.classify(
            system=f"""Classify this query into ONE of:
                       {list(self.QUERY_TYPES.keys())}
                       Return only the type name.""",
            user=query,
            max_tokens=10
        )
        qt = QueryType(result.strip())
        await self.redis.setex(cache_key, 3600, qt.value)
        return qt`,
  },
  {
    id: "graph_updater",
    label: "GraphInferenceWorker",
    layer: "Async Workers",
    color: C.green,
    file: "mneme/workers/graph_updater.py",
    purpose:
      "Infers org structure + relationships from observed interactions",
    interfaces: [
      "consume() — Kafka loop",
      "infer_relationships(interaction)",
      "merge_graph_update(inference)",
    ],
    code: `class GraphInferenceWorker:
    """
    Kafka consumer — processes session.turns events.
    Infers graph structure from agent observations.
    User NEVER manually inputs org chart — MNEME builds it.

    Signals that indicate hierarchy:
    - Approval patterns: "Sarah approved X" → Sarah > X
    - CC patterns: always CC'd Sarah → reporting signal
    - Ownership language: "my team", "my direct"
    - Meeting roles: organizer vs attendee consistently
    - Document ownership: who assigned what to whom
    """
    async def infer_relationships(self,
                                   interaction: Interaction) -> list[Inference]:
        inferences = []

        # Pattern: approval direction
        if approval := self._detect_approval(interaction):
            inferences.append(Inference(
                type="REPORTS_TO",
                from_entity=approval.subordinate,
                to_entity=approval.approver,
                confidence=0.75,
                evidence=approval.text_evidence
            ))

        # Pattern: "X's team" ownership language
        for match in self._detect_team_ownership(interaction):
            inferences.append(Inference(
                type="MANAGES_TEAM",
                from_entity=match.manager,
                to_entity=match.team_name,
                confidence=0.65,
                evidence=match.text_evidence
            ))

        # Merge into Neo4j — strengthen existing or create new
        for inf in inferences:
            if inf.confidence > 0.6:
                await self.neo4j.run("""
                    MERGE (a:Person {name: $from_name})
                    MERGE (b:Person {name: $to_name})
                    MERGE (a)-[r:REPORTS_TO]->(b)
                    ON CREATE SET r.confidence = $conf,
                                  r.evidence   = [$ev]
                    ON MATCH SET  r.confidence =
                                    min(0.99, r.confidence + 0.05),
                                  r.evidence   = r.evidence + [$ev]
                """, from_name=inf.from_entity, to_name=inf.to_entity,
                     conf=inf.confidence, ev=inf.evidence)
        return inferences`,
  },
];
