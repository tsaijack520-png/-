"""耳边 AI 陪聊后端 — 独立 FastAPI 微服务

只负责把前端的 role info + 历史消息转给 Claude, 返回 reply。
无 auth、无持久化; 会话历史由前端本地保存后每次带过来。
"""
from __future__ import annotations

import logging
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ai import AIReplyError, build_fallback_reply, generate_reply, stream_reply

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("erbian-ai")

app = FastAPI(title="Erbian AI", version="0.1.0")

cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class RoleInfo(BaseModel):
    name: str = ""
    subtitle: str = ""
    scene: str = ""
    relationship: str = ""
    intro: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    role: RoleInfo = Field(default_factory=RoleInfo)


def _provider_flag() -> tuple[bool, str]:
    has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY", "").strip())
    has_aws = bool(os.getenv("AWS_ACCESS_KEY_ID", "").strip())
    provider = os.getenv("AI_PROVIDER", "").strip().lower() or (
        "bedrock" if has_aws else "anthropic"
    )
    configured = (provider == "bedrock" and has_aws) or (
        provider == "anthropic" and has_anthropic
    )
    return configured, provider


@app.get("/health")
def health():
    configured, provider = _provider_flag()
    return {
        "status": "ok",
        "service": "erbian-ai",
        "provider": provider,
        "ai_configured": configured,
    }


@app.post("/chat")
def chat(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.messages]
    role_dict = req.role.model_dump()
    try:
        reply = generate_reply(history, role_dict)
    except AIReplyError as exc:
        logger.warning("ai call fallback: %s", exc.code)
        reply = build_fallback_reply(role_dict)
    return {"reply": reply}


@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.messages]
    role_dict = req.role.model_dump()

    def gen():
        for chunk in stream_reply(history, role_dict):
            yield chunk

    return StreamingResponse(gen(), media_type="text/plain; charset=utf-8")
