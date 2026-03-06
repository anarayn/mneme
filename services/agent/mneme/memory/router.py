"""
QueryRouter — classifies queries to route to the correct storage layer.
Fast Haiku call, results cached per session.
"""

from __future__ import annotations

from enum import Enum
from typing import Any


class QueryType(str, Enum):
    STRUCTURAL = "STRUCTURAL"    # org chart, team membership
    SEMANTIC = "SEMANTIC"        # find similar docs
    FACTUAL = "FACTUAL"          # deadlines, dates, contact info
    HYBRID = "HYBRID"            # docs on Project X owned by Sarah's team
    RELATIONSHIP = "RELATIONSHIP"  # trust level, history between people
    EPISODIC = "EPISODIC"        # have I dealt with this before?
    DEADLINE = "DEADLINE"        # statute of limitations, due dates
    ANY = "ANY"                  # fallback — query all


QUERY_TYPE_DESCRIPTIONS = {
    QueryType.STRUCTURAL: "org chart, team membership, who reports to whom",
    QueryType.SEMANTIC: "find similar documents, what did we discuss about X",
    QueryType.FACTUAL: "deadlines, scheduled dates, contact info",
    QueryType.HYBRID: "docs on Project X owned by Sarah's team",
    QueryType.RELATIONSHIP: "trust level, history between two people",
    QueryType.EPISODIC: "have I dealt with this before",
    QueryType.DEADLINE: "statute of limitations, due dates",
}


class QueryRouter:
    """
    Fast Haiku call to classify which DB(s) to hit.
    Must complete in <50ms — results cached for 1h per query pattern.
    """

    def __init__(self, redis_client: Any = None, haiku_client: Any = None) -> None:
        self._redis = redis_client
        self._haiku = haiku_client

    async def classify(self, query: str) -> QueryType:
        """Classify query → route to correct DB(s)."""
        cache_key = f"qroute:{hash(query[:60])}"

        if self._redis:
            cached = await self._redis.get(cache_key)
            if cached:
                return QueryType(cached)

        if self._haiku:
            types = list(QUERY_TYPE_DESCRIPTIONS.keys())
            result = await self._haiku.classify(
                system=f"Classify into ONE of: {[t.value for t in types]}. Return only the type name.",
                user=query,
                max_tokens=10,
            )
            qt = QueryType(result.strip())
        else:
            qt = QueryType.ANY

        if self._redis:
            await self._redis.setex(cache_key, 3600, qt.value)

        return qt
