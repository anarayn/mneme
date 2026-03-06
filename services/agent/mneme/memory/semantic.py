"""
SemanticMemory — facade over Neo4j (graph) + Pinecone (vectors) + PostgreSQL (facts).
AgentBrain calls this without caring which DB answers.
"""

from __future__ import annotations

import asyncio
from typing import Any


class SemanticMemory:
    """
    Routes queries to the right storage layer based on query type.
    Query classification done by QueryRouter (fast Haiku call, cached).
    """

    def __init__(self, dna: Any, user_id: str) -> None:
        self.user_id = user_id
        # TODO: initialize Neo4jClient, PineconeClient, PostgresPool, QueryRouter, VoyageClient
        self._graph = None
        self._vectors = None
        self._pg = None
        self._router = None
        self._voyage = None

    async def lookup(self, signal: Any) -> Any:
        """
        Parallel lookup across all three stores.
        QueryRouter classifies which stores to hit.
        """
        # TODO: implement
        return {}

    async def hybrid_doc_search(self, query: str, filters: dict) -> list:
        """
        Step 1: Graph → entity IDs matching structural filter
        Step 2: Pinecone → semantic search filtered by those IDs
        """
        # TODO: implement
        return []

    async def update_from_observation(self, interaction: Any) -> None:
        """
        Infer and update graph structure from observed behavior.
        Called by async worker after each turn — not in hot path.
        """
        # TODO: implement
        pass
