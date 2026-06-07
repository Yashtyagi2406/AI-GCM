/**
 * AI-GCM JavaScript/TypeScript SDK
 * Drop-in replacement for Anthropic and OpenAI SDKs.
 * All requests are automatically tracked, governed, and attributed.
 */

export interface AiGcmConfig {
  apiToken: string           // Your AI-GCM user token (not provider API key)
  baseUrl?: string           // AI-GCM proxy URL (default: https://proxy.ai-gcm.io)
  projectId?: string         // Optional project attribution
  teamId?: string            // Optional team override
}

export class AiGcmClient {
  private config: Required<AiGcmConfig>

  constructor(config: AiGcmConfig) {
    this.config = {
      baseUrl: 'https://proxy.ai-gcm.io',
      projectId: '',
      teamId: '',
      ...config,
    }
  }

  /** Anthropic-compatible messages endpoint */
  get anthropic() {
    return {
      messages: {
        create: (body: AnthropicMessagesBody) =>
          this.request('/proxy/v1/anthropic/v1/messages', body),
      },
    }
  }

  /** OpenAI-compatible chat completions endpoint */
  get openai() {
    return {
      chat: {
        completions: {
          create: (body: OpenAiChatBody) =>
            this.request('/proxy/v1/openai/v1/chat/completions', body),
        },
      },
    }
  }

  private async request(path: string, body: unknown) {
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiToken}`,
        ...(this.config.projectId ? { 'X-AIGCM-Project': this.config.projectId } : {}),
        ...(this.config.teamId    ? { 'X-AIGCM-Team-ID': this.config.teamId }    : {}),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`AI-GCM proxy error ${res.status}: ${JSON.stringify(err)}`)
    }

    // Expose cost metadata from response headers
    const cost    = res.headers.get('X-AIGCM-Cost-USD')
    const tokensIn  = res.headers.get('X-AIGCM-Tokens-In')
    const tokensOut = res.headers.get('X-AIGCM-Tokens-Out')
    const remaining = res.headers.get('X-AIGCM-Budget-Remaining')

    const data = await res.json()
    return { ...data, _aigcm: { cost, tokensIn, tokensOut, budgetRemaining: remaining } }
  }
}

// Types
interface AnthropicMessagesBody {
  model: string
  max_tokens: number
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  system?: string
  stream?: boolean
}

interface OpenAiChatBody {
  model: string
  messages: Array<{ role: string; content: string }>
  max_tokens?: number
  stream?: boolean
}
