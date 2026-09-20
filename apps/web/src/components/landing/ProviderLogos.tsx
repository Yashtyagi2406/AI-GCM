'use client'

import React from 'react'

export function OpenAILogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      aria-label="OpenAI Logo"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4021-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.407 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6644zm-12.641 4.135l-2.02-1.164a.0804.0804 0 0 1-.038-.057V6.0765a4.504 4.504 0 0 1 7.371-3.4537l-.142.0805L6.1983 5.4615a.7948.7948 0 0 0-.3928.6813v6.7369zm1.2587-2.1293l2.946-1.7 2.946 1.7v3.4l-2.946 1.7-2.946-1.7z" />
    </svg>
  )
}

export function AnthropicLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      aria-label="Anthropic Logo"
    >
      <path d="M13.827 3.5h3.69L24 20.5h-3.69l-1.845-4.417H9.535L7.69 20.5H4l6.483-17h3.344zm2.46 9.833L14.442 8.78 12.597 13.333h3.69zM3.483 20.5H0L2.836 13h3.483l-2.836 7.5z" />
    </svg>
  )
}

export function GoogleGeminiLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      aria-label="Google Gemini Logo"
    >
      <path 
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" 
        fill="url(#gemini-grad-unique)" 
      />
      <defs>
        <linearGradient id="gemini-grad-unique" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1BA1E3" />
          <stop offset="0.5" stopColor="#5470FF" />
          <stop offset="1" stopColor="#9B51E0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AzureOpenAILogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      aria-label="Azure OpenAI Logo"
    >
      <path d="M5.4 18.2L12 3.6L16.4 13.2L7.8 18.2H5.4Z" fill="#0089D6" />
      <path d="M12.6 13.2L16.4 13.2L20.6 18.2H10.2L12.6 13.2Z" fill="#005BA1" />
      <path d="M7.8 18.2L12 3.6L13.8 7.4L10.2 15.2L7.8 18.2Z" fill="#0078D4" />
    </svg>
  )
}

export function AWSBedrockLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      aria-label="AWS Bedrock Logo"
    >
      <path 
        d="M12 2.5L3.5 7.4V17.2L12 22.1L20.5 17.2V7.4L12 2.5Z" 
        stroke="#FF9900" 
        strokeWidth="1.8" 
        strokeLinejoin="round" 
        fill="#FF9900" 
        fillOpacity="0.15" 
      />
      <path d="M12 22V12.3" stroke="#FF9900" strokeWidth="1.8" />
      <path d="M20.5 7.4L12 12.3L3.5 7.4" stroke="#FF9900" strokeWidth="1.8" />
      <circle cx="12" cy="12.3" r="2.5" fill="#FF9900" />
    </svg>
  )
}

export function OllamaLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      aria-label="Ollama Logo"
    >
      <path d="M12 2C10.5 2 9.5 3 9.5 4.5V8C9.5 8.5 9.2 9 8.7 9H7C5.3 9 4 10.3 4 12V15C4 16.7 5.3 18 7 18H8V21C8 21.6 8.4 22 9 22H11C11.6 22 12 21.6 12 21V18H14V21C14 21.6 14.4 22 15 22H17C17.6 22 18 21.6 18 21V18H19C20.7 18 22 16.7 22 15V12C22 10.3 20.7 9 19 9H16.5V4.5C16.5 3 15.5 2 14 2H12ZM11.5 5.5C11.5 5.2 11.7 5 12 5C12.3 5 12.5 5.2 12.5 5.5V7H11.5V5.5ZM13.5 5.5C13.5 5.2 13.7 5 14 5C14.3 5 14.5 5.2 14.5 5.5V7H13.5V5.5ZM8 12C8.6 12 9 12.4 9 13C9 13.6 8.6 14 8 14C7.4 14 7 13.6 7 13C7 12.4 7.4 12 8 12ZM16 12C16.6 12 17 12.4 17 13C17 13.6 16.6 14 16 14C15.4 14 15 13.6 15 13C15 12.4 15.4 12 16 12Z" />
    </svg>
  )
}

export function VLLMLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      aria-label="vLLM Logo"
    >
      <path d="M4 4L12 20L20 4H15.5L12 13.5L8.5 4H4Z" fill="#38BDF8" />
      <path d="M8.5 4L12 13.5L15.5 4" stroke="#818CF8" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function LocalAILogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      aria-label="LocalAI Logo"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" fill="#10B981" />
      <path d="M12 1V4M12 20V23M1 12H4M20 12H23M6 1V4M18 1V4M6 20V23M18 20V23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
