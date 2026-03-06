"""
AgentBrain — 9-step processing loop.
Coordinates all 8 memory layers + tool execution + LLM streaming.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator

from mneme.memory.working import WorkingMemory
from mneme.memory.episodic import EpisodicMemory
from mneme.memory.semantic import SemanticMemory
from mneme.memory.procedural import ProceduralMemory
from mneme.memory.prospective import ProspectiveMemory
from mneme.memory.relational import RelationalMemory
from mneme.memory.sensory import SensoryBuffer
from mneme.roles.registry import ROLE_REGISTRY
from mneme.llm.client import LLMClient
from mneme.tools.executor import ToolExecutor
from mneme.vault.document_vault import DocumentVault
from mneme.vault.secrets_vault import SecretsVault


class AgentBrain:
    """
    One instance per Fly Machines microVM. Lifecycle = user session.

    Memory layers (8):
        1. Sensory    — raw input normalization
        2. Working    — active task + context window
        3. Episodic   — personal history (Pinecone)
        4. Semantic   — knowledge facade (Neo4j + Pinecone + PG)
        5. Procedural — routines & habits (Redis hot cache)
        6. Prospective — future intentions & triggers
        7. Relational  — people graph awareness
        8. Extension   — role-specific plugins (lawyer privilege, etc.)
    """

    def __init__(self, user_id: str, role: str, session_id: str) -> None:
        dna = ROLE_REGISTRY[role]
        self.user_id = user_id
        self.session_id = session_id

        # Memory layers
        self.sensory = SensoryBuffer(dna)
        self.working = WorkingMemory(dna, session_id)
        self.episodic = EpisodicMemory(dna, user_id)
        self.semantic = SemanticMemory(dna, user_id)
        self.procedural = ProceduralMemory(dna.routines)
        self.prospective = ProspectiveMemory(dna, user_id)
        self.relational = RelationalMemory(dna, user_id)
        self.extensions = [ext(self) for ext in dna.extensions]

        # Infrastructure
        self.llm = LLMClient(dna)
        self.tools = ToolExecutor(
            doc_vault=DocumentVault(user_id),
            secrets_vault=SecretsVault(user_id),
        )

    async def process(self, raw_input: dict) -> AsyncIterator[str]:
        """
        Main processing loop. Streams response chunks.

        Steps:
            1. Sensory ingest & normalization
            2. Extension pre-processing (privilege check, circuit breaker)
            3. Parallel memory hydration (prospective, relational, semantic, episodic)
            4. Working memory focus — assemble Task context
            5. Procedural match — try routine first
            6. LLM stream with tool loop
            7. Non-blocking post-processing via Kafka
        """
        signal = self.sensory.ingest(raw_input)

        for ext in self.extensions:
            signal = await ext.pre_process(signal)

        fired, social, knowledge, history = await asyncio.gather(
            self.prospective.check(signal),
            self.relational.read_situation(signal),
            self.semantic.lookup(signal),
            self.episodic.recall_similar(signal.content, k=5),
        )

        task = self.working.set_focus(
            signal=signal,
            social=social,
            knowledge=knowledge,
            history=history,
            intentions=fired,
        )

        routine = self.procedural.match(signal)
        if routine:
            async for chunk in routine.execute(task):
                yield chunk
        else:
            async for chunk in self.llm.stream(task, self.tools.schemas()):
                yield chunk
                if chunk.tool_calls:
                    results = await self.tools.execute_parallel(
                        chunk.tool_calls, self.session_id
                    )
                    task.add_tool_results(results)

        # Non-blocking: emit session turn event for async workers
        await self._emit_turn_event(task)

    async def _emit_turn_event(self, task: object) -> None:
        """Fire-and-forget. Never blocks the response stream."""
        # TODO: emit to Kafka topic mneme.session.turns
        pass

    async def switch_role(self, new_role: str) -> None:
        """Hot-swap role DNA without losing working memory."""
        dna = ROLE_REGISTRY[new_role]
        self.llm = LLMClient(dna)
        self.extensions = [ext(self) for ext in dna.extensions]
