class AiGcmError(Exception):
    """Base exception for AI-GCM SDK errors."""

class BudgetExceededError(AiGcmError):
    """Raised when a team or user budget has been exceeded (HTTP 402)."""

class PolicyBlockedError(AiGcmError):
    """Raised when a governance policy blocks the request (HTTP 403)."""
