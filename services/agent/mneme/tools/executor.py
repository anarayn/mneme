"""mneme.tools.executor — stub."""
from __future__ import annotations
from typing import Any

class ToolExecutor:
    def __init__(self, doc_vault: Any, secrets_vault: Any) -> None:
        self._doc_vault = doc_vault
        self._secrets_vault = secrets_vault

    def schemas(self) -> list:
        return []

    async def execute_parallel(self, tool_calls: list, session_id: str) -> list:
        return []
