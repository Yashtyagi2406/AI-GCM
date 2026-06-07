import httpx
from typing import Any, Dict, List, Optional
from .exceptions import AiGcmError, BudgetExceededError, PolicyBlockedError


class AiGcmClient:
    """
    AI-GCM client — routes AI API calls through the governance proxy.
    """

    def __init__(
        self,
        api_token: str,
        base_url: str = "https://proxy.ai-gcm.io",
        project_id: Optional[str] = None,
        team_id: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self._token = api_token
        self._base_url = base_url.rstrip("/")
        self._project_id = project_id
        self._team_id = team_id
        self._http = httpx.Client(timeout=timeout)

    @property
    def anthropic(self) -> "_AnthropicProxy":
        return _AnthropicProxy(self)

    @property
    def openai(self) -> "_OpenAiProxy":
        return _OpenAiProxy(self)

    def _request(self, path: str, body: Dict[str, Any]) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json",
        }
        if self._project_id:
            headers["X-AIGCM-Project"] = self._project_id
        if self._team_id:
            headers["X-AIGCM-Team-ID"] = self._team_id

        resp = self._http.post(f"{self._base_url}{path}", json=body, headers=headers)

        if resp.status_code == 402:
            raise BudgetExceededError("Budget limit exceeded for this team or user.")
        if resp.status_code == 403:
            raise PolicyBlockedError(resp.json().get("error", "Request blocked by governance policy."))
        if not resp.is_success:
            raise AiGcmError(f"Proxy error {resp.status_code}: {resp.text}")

        data = resp.json()
        data["_aigcm"] = {
            "cost":             resp.headers.get("X-AIGCM-Cost-USD"),
            "tokens_in":        resp.headers.get("X-AIGCM-Tokens-In"),
            "tokens_out":       resp.headers.get("X-AIGCM-Tokens-Out"),
            "budget_remaining": resp.headers.get("X-AIGCM-Budget-Remaining"),
            "request_id":       resp.headers.get("X-AIGCM-Request-ID"),
        }
        return data

    def close(self):
        self._http.close()

    def __enter__(self): return self
    def __exit__(self, *_): self.close()


class _AnthropicProxy:
    def __init__(self, client: AiGcmClient): self._client = client

    class _Messages:
        def __init__(self, client: AiGcmClient): self._client = client

        def create(self, model: str, max_tokens: int, messages: List[Dict],
                   system: Optional[str] = None, **kwargs) -> Dict[str, Any]:
            body = {"model": model, "max_tokens": max_tokens, "messages": messages, **kwargs}
            if system:
                body["system"] = system
            return self._client._request("/proxy/v1/anthropic/v1/messages", body)

    @property
    def messages(self): return self._Messages(self._client)


class _OpenAiProxy:
    def __init__(self, client: AiGcmClient): self._client = client

    class _ChatCompletions:
        def __init__(self, client: AiGcmClient): self._client = client

        def create(self, model: str, messages: List[Dict], **kwargs) -> Dict[str, Any]:
            return self._client._request(
                "/proxy/v1/openai/v1/chat/completions",
                {"model": model, "messages": messages, **kwargs}
            )

    class _Chat:
        def __init__(self, client: AiGcmClient): self._client = client
        @property
        def completions(self): return _OpenAiProxy._ChatCompletions(self._client)

    @property
    def chat(self): return self._Chat(self._client)
