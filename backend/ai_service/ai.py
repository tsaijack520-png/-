"""耳边 AI 调用封装 — 支持 Anthropic 直连 / AWS Bedrock 双 provider

通过 env 切换:
- AI_PROVIDER=anthropic (默认): 用 ANTHROPIC_API_KEY 直连官方 API
- AI_PROVIDER=bedrock: 用 AWS_ACCESS_KEY_ID/SECRET/REGION 走 AWS Bedrock
- AI_PROVIDER 未设置时, 存在 AWS_ACCESS_KEY_ID 自动走 bedrock

无 key / 调用失败时, fallback 到通用占位回复, 保证 UI 不中断。
"""
from __future__ import annotations

import os
import random
from typing import Iterable

import anthropic
from dotenv import load_dotenv

load_dotenv()


BASE_SYSTEM = """你是耳边 App 内的 AI 陪伴角色。

风格:
- 中文为主, 回应克制在 3-5 句, 温柔不腻, 不说教
- 先倾听用户情绪, 再给出轻量陪伴回应
- 用"你"而不是"您"; 不要套"我理解你的感受"这种话

边界:
- 留在角色里, 不要声称自己是 AI 或模型
- 不提供医疗诊断、法律结论或高风险专业指令
- 如果用户表达自伤/自杀/紧急危险倾向, 鼓励拨打 400-161-9995 或当地紧急援助
"""

GENERIC_FALLBACK = [
    "我在呢, 你继续说, 我会认真听。",
    "收到了, 我陪你慢慢聊, 不着急。",
    "我看到你发来的话了, 现在我陪着你。",
    "别急, 先把今天放下, 我在。",
    "嗯, 我在听。你想从哪一句开始都行。",
]


class AIReplyError(Exception):
    """AI 引擎调用错误 — message 不直接暴露给前端"""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def build_system_prompt(role: dict) -> str:
    """按前端传来的 role info 动态拼 system prompt"""
    name = (role.get("name") or "").strip()
    subtitle = (role.get("subtitle") or "").strip()
    scene = (role.get("scene") or "").strip()
    relationship = (role.get("relationship") or "").strip()
    intro = (role.get("intro") or "").strip()

    blocks = [BASE_SYSTEM]
    if name:
        header = f"当前你扮演的角色叫【{name}】"
        if subtitle:
            header += f" · {subtitle}"
        blocks.append(header + "。")
    if relationship:
        blocks.append(f"关系设定: {relationship}")
    if scene:
        blocks.append(f"场景: {scene}")
    if intro:
        blocks.append(f"角色简介: {intro}")
    return "\n\n".join(blocks)


def build_fallback_reply(role: dict | None = None) -> str:
    return random.choice(GENERIC_FALLBACK)


# ═══════════════════════════════════════════════════════════
# Provider & 客户端
# ═══════════════════════════════════════════════════════════

_client_cache = None


def _resolve_provider() -> str:
    explicit = os.getenv("AI_PROVIDER", "").strip().lower()
    if explicit in ("bedrock", "anthropic"):
        return explicit
    return "bedrock" if os.getenv("AWS_ACCESS_KEY_ID", "").strip() else "anthropic"


def _get_client():
    global _client_cache
    if _client_cache is not None:
        return _client_cache

    provider = _resolve_provider()
    if provider == "bedrock":
        ak = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
        sk = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
        region = os.getenv("AWS_REGION", "ap-southeast-1").strip()
        if not ak or not sk:
            raise AIReplyError("missing_aws_credentials", "AWS credentials missing")
        _client_cache = anthropic.AnthropicBedrock(
            aws_access_key=ak,
            aws_secret_key=sk,
            aws_region=region,
        )
        return _client_cache

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com").strip()
    if not api_key:
        raise AIReplyError("missing_api_key", "ANTHROPIC_API_KEY missing")
    _client_cache = anthropic.Anthropic(api_key=api_key, base_url=base_url)
    return _client_cache


def _get_model() -> str:
    if _resolve_provider() == "bedrock":
        return os.getenv("BEDROCK_MODEL") or os.getenv(
            "ANTHROPIC_MODEL",
            "apac.anthropic.claude-haiku-4-5-20251001-v1:0",
        )
    return os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def _max_tokens() -> int:
    try:
        return int(os.getenv("ANTHROPIC_MAX_TOKENS", "512"))
    except ValueError:
        return 512


def _trim(history: list[dict], n: int | None = None) -> list[dict]:
    limit = n or int(os.getenv("HISTORY_LIMIT", "20"))
    return history if len(history) <= limit else history[-limit:]


# ═══════════════════════════════════════════════════════════
# 非流式 + 流式
# ═══════════════════════════════════════════════════════════

def generate_reply(history: list[dict], role: dict) -> str:
    client = _get_client()
    try:
        resp = client.messages.create(
            model=_get_model(),
            max_tokens=_max_tokens(),
            system=build_system_prompt(role),
            messages=_trim(history),
        )
    except Exception as exc:
        raise AIReplyError("engine_request_failed", f"{type(exc).__name__}") from exc

    texts = [
        b.text
        for b in resp.content
        if getattr(b, "type", None) == "text" and getattr(b, "text", "").strip()
    ]
    reply = "\n".join(texts).strip()
    if not reply:
        raise AIReplyError("empty_reply", "engine returned empty")
    return reply


def stream_reply(history: list[dict], role: dict) -> Iterable[str]:
    try:
        client = _get_client()
    except AIReplyError:
        yield build_fallback_reply(role)
        return

    try:
        with client.messages.stream(
            model=_get_model(),
            max_tokens=_max_tokens(),
            system=build_system_prompt(role),
            messages=_trim(history),
        ) as stream:
            for text in stream.text_stream:
                if text:
                    yield text
    except Exception:
        yield build_fallback_reply(role)
