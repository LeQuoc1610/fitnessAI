'use client'

import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

function parseContent(text: string) {

  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--accent)', fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const lines = message.content.split('\n')

  return (
    <div
      className={isLatest ? 'animate-fade-slide' : ''}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 16,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(145deg, #B8FF3C, #7ACC00)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 900,
            color: '#080808',
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          FT
        </div>
      )}

      <div
        style={{
          maxWidth: '74%',
          background: isUser ? 'var(--surface-2)' : 'var(--surface)',
          border: `1px solid ${isUser ? 'var(--border-2)' : 'var(--border)'}`,
          borderRadius: isUser ? '14px 3px 14px 14px' : '3px 14px 14px 14px',
          padding: '11px 15px',
          fontSize: 13.5,
          lineHeight: 1.75,
          color: isUser ? '#C0C0C0' : 'var(--text-1)',
        }}
      >
        {/* Content — render line by line */}
        {lines.map((line, idx) => {
          const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
          if (numberedMatch) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: idx < lines.length - 1 ? 5 : 0,
                }}
              >
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 5,
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(184,255,60,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {numberedMatch[1]}
                </span>
                <span>{parseContent(numberedMatch[2])}</span>
              </div>
            )
          }

          if (line.trim() === '') {
            return <div key={idx} style={{ height: 6 }} />
          }

          return (
            <div key={idx} style={{ marginBottom: idx < lines.length - 1 ? 2 : 0 }}>
              {parseContent(line)}
            </div>
          )
        })}

        {/* Timestamp */}
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-3)',
            marginTop: 8,
            textAlign: 'right',
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--surface-3)',
            border: '1px solid var(--border-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            marginTop: 2,
          }}
        >
          U
        </div>
      )}
    </div>
  )
}
