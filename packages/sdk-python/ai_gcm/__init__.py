"""
AI-GCM Python SDK
Drop-in replacement for Anthropic and OpenAI Python clients.
All requests automatically tracked, governed, and attributed.

Usage:
    from ai_gcm import AiGcmClient

    client = AiGcmClient(api_token="your-token", project_id="my-project")

    # Anthropic-compatible
    response = client.anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response["content"][0]["text"])
    print(f"Cost: ${response['_aigcm']['cost']}")
"""

from .client import AiGcmClient
from .exceptions import AiGcmError, BudgetExceededError, PolicyBlockedError

__all__ = ["AiGcmClient", "AiGcmError", "BudgetExceededError", "PolicyBlockedError"]
__version__ = "1.0.0"
