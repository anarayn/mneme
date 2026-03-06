"""
GraphInferenceWorker — Kafka consumer.
Infers org structure and relationships from session turn events.
User never manually inputs org chart — MNEME builds it from observation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class Inference:
    type: str           # e.g. REPORTS_TO, MANAGES_TEAM
    from_entity: str
    to_entity: str
    confidence: float
    evidence: str


class GraphInferenceWorker:
    """
    Consumes mneme.session.turns, infers graph edges, merges into Neo4j.

    Signals that indicate hierarchy:
        - Approval patterns: "Sarah approved X's request" → Sarah > X
        - CC chains: always CC'd on Sarah's emails → reporting signal
        - Ownership language: "my team", "my direct report"
        - Meeting roles: organizer vs consistent attendee
        - Document ownership: who assigned what to whom
    """

    def __init__(self, neo4j_client: Any = None, kafka_consumer: Any = None) -> None:
        self._neo4j = neo4j_client
        self._consumer = kafka_consumer

    async def consume(self) -> None:
        """Main Kafka consumer loop. Runs forever."""
        # TODO: implement Kafka consume loop
        pass

    async def infer_relationships(self, interaction: dict) -> list[Inference]:
        """Extract relationship signals from a session turn."""
        inferences: list[Inference] = []

        if approval := self._detect_approval(interaction):
            inferences.append(
                Inference(
                    type="REPORTS_TO",
                    from_entity=approval["subordinate"],
                    to_entity=approval["approver"],
                    confidence=0.75,
                    evidence=approval["text"],
                )
            )

        for match in self._detect_team_ownership(interaction):
            inferences.append(
                Inference(
                    type="MANAGES_TEAM",
                    from_entity=match["manager"],
                    to_entity=match["team"],
                    confidence=0.65,
                    evidence=match["text"],
                )
            )

        for inf in inferences:
            if inf.confidence > 0.6:
                await self._merge_graph_update(inf)

        return inferences

    async def _merge_graph_update(self, inf: Inference) -> None:
        if not self._neo4j:
            return
        await self._neo4j.run(
            """
            MERGE (a:Person {name: $from_name})
            MERGE (b:Person {name: $to_name})
            MERGE (a)-[r:REPORTS_TO]->(b)
            ON CREATE SET r.confidence = $conf, r.evidence = [$ev]
            ON MATCH SET  r.confidence = min(0.99, r.confidence + 0.05),
                          r.evidence   = r.evidence + [$ev]
            """,
            from_name=inf.from_entity,
            to_name=inf.to_entity,
            conf=inf.confidence,
            ev=inf.evidence,
        )

    def _detect_approval(self, interaction: dict) -> dict | None:
        # TODO: NLP-based approval pattern detection
        return None

    def _detect_team_ownership(self, interaction: dict) -> list[dict]:
        # TODO: NLP-based team ownership language detection
        return []
