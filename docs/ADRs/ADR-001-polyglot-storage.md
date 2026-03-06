# ADR-001: Polyglot Storage Strategy

**Status:** Accepted
**Date:** 2024-10-01

## Context

MNEME requires multiple types of memory: working state, semantic search, structured facts, graph relationships, and async event streaming. No single database handles all these access patterns optimally.

## Decision

Use 5 specialized storage primitives, each chosen for its access pattern:

| Store | Layer | Why |
|-------|-------|-----|
| Redis 7 | Working + Procedural | Sub-ms reads, TTL, sorted sets for priority queue |
| Pinecone | Episodic + Document | Dedicated ANN index, namespace isolation |
| Neo4j AuraDB | Graph + Hierarchy | O(depth) traversal, relationship-first model |
| PostgreSQL 16 | Facts + Metadata + Audit | ACID, range queries, structured facts |
| Apache Kafka | Event bus | Decouples agent loop from async workers |

## Consequences

**Positive:**
- Each primitive optimally suited to its access pattern
- Agent loop latency dominated by LLM (~330ms), not DB (~50ms total)
- Kafka decoupling means graph/index failures never affect live sessions

**Negative:**
- Operational complexity: 5 systems to monitor, back up, scale
- Consistency across stores is eventual (acceptable for memory)
- Higher infra cost at small scale

## Migration Path

Start small with Apache AGE (graph on Postgres), Redis Cloud free, Pinecone starter.
Migrate to Neo4j AuraDB at 10K+ users when graph query volume justifies it.
