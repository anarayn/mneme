# ADR-003: Self-Building Org Graph via Behavioral Inference

**Status:** Accepted
**Date:** 2024-10-01

## Context

Understanding org hierarchy and relationships is critical for context-aware assistance. Manual org chart input is burdensome and quickly becomes stale. We need a way to build and maintain this graph without user effort.

## Decision

MNEME infers organizational structure from observed behavior:

**Signals used:**
- Approval patterns: "Sarah approved Raj's request" → Raj REPORTS_TO Sarah
- CC patterns: consistently CC'd on Sarah's emails → reporting signal
- Ownership language: "my team", "my direct report"
- Meeting roles: consistent organizer vs attendee
- Document ownership: who assigns work to whom

**Implementation:**
- `GraphInferenceWorker` consumes `mneme.session.turns` Kafka topic
- Each inference gets a confidence score (0.6–0.99)
- Edges strengthened with each corroborating signal (`confidence += 0.05`)
- `ON CREATE` / `ON MATCH` Cypher merge prevents duplicate edges

## Consequences

**Positive:**
- Zero user effort — graph builds itself
- Continuously updated as relationships evolve
- Confidence scores enable graceful handling of uncertainty

**Negative:**
- Early interactions have low confidence — may give wrong context initially
- Approval/CC patterns can be misleading in some orgs
- Privacy consideration: graph inference runs only on user's own data
