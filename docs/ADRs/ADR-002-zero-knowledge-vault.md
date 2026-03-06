# ADR-002: Zero-Knowledge Secrets Architecture

**Status:** Accepted
**Date:** 2024-10-01

## Context

Users need MNEME to manage their passwords, API keys, and credentials so the agent can act on their behalf. The agent must be able to use these credentials without them ever appearing in LLM context, logs, or any storage other than HashiCorp Vault.

## Decision

**Core principle:** LLM context window NEVER contains secret values.

**Flow:**
```
LLM decides to call tool → Tool executor fetches secret → Tool uses secret → Tool returns redacted result to LLM
```

**Implementation:**
1. All secrets stored in HashiCorp Vault, namespaced per user
2. Agent requests secrets by human-readable label (not path)
3. Vault validates graph permission edge before returning value
4. `SecretValue` wrapper class prevents accidental serialization
5. Full audit log: every secret access recorded with session ID + purpose

## Consequences

**Positive:**
- LLM can never leak credentials (not in context window)
- Fine-grained access control via graph permission edges
- Complete audit trail for compliance
- Single source of truth for all credentials

**Negative:**
- Additional latency per tool call (~20ms Vault fetch)
- Vault becomes a critical dependency (mitigated by HA deployment)
- User onboarding more complex (explicit grant required per credential)
