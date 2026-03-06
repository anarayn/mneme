"""Core shared types across all MNEME Python services."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class RawInput:
    """Unprocessed user input before sensory normalization."""
    content: str
    session_id: str
    user_id: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    attachments: list[dict] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass
class Signal:
    """Normalized input after sensory processing."""
    content: str
    session_id: str
    user_id: str
    signal_type: str  # "query" | "command" | "conversation" | "document"
    intent: str | None = None
    entities: list[dict] = field(default_factory=list)
    priority: float = 0.5
    timestamp: datetime = field(default_factory=datetime.utcnow)
    raw: RawInput | None = None


@dataclass
class Episode:
    """A stored episodic memory — a past interaction or event."""
    id: str
    user_id: str
    content: str
    summary: str
    embedding: list[float] = field(default_factory=list)
    importance: float = 0.5
    emotion: str | None = None
    entities: list[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    namespace: str = ""


@dataclass
class ToolResult:
    """Result of a tool execution."""
    tool_call_id: str
    tool_name: str
    success: bool
    data: Any = None
    error: str | None = None
    execution_ms: int = 0


@dataclass
class Task:
    """Active working memory focus — what the agent is currently working on."""
    signal: Signal
    social: Any = None          # RelationalContext
    knowledge: Any = None       # KnowledgeContext (from SemanticMemory)
    history: list[Episode] = field(default_factory=list)
    intentions: list[Any] = field(default_factory=list)  # fired prospective intents
    tool_results: list[ToolResult] = field(default_factory=list)
    turn_id: str = ""

    def add_tool_results(self, results: list[ToolResult]) -> None:
        self.tool_results.extend(results)

    def to_event(self) -> dict:
        """Serialize to Kafka event payload."""
        return {
            "user_id": self.signal.user_id,
            "session_id": self.signal.session_id,
            "turn_id": self.turn_id,
            "input": self.signal.content,
            "timestamp": self.signal.timestamp.isoformat(),
        }
