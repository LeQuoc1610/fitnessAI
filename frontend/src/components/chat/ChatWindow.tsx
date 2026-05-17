'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { InputBar } from './InputBar'
import { ClearDataButton } from './ClearDataButton'
import type { Message } from '@/types'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  error: string | null
  onSend: (message: string) => void
  extraHeaderAction?: React.ReactNode
  agentId?: string
}

const AGENT_HEADER = {
  initials: 'FT',
  name: 'Fitness',
  subtitle: 'AI Huấn luyện viên · Healthy',
}

export function ChatWindow({ messages, isLoading, error, onSend, extraHeaderAction, agentId = 'fitness' }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: '#0B0B0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(145deg, #B8FF3C, #7ACC00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#080808',
                letterSpacing: 0.5,
              }}
            >
              {AGENT_HEADER.initials}
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#F0F0F0',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              {AGENT_HEADER.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="status-dot" />
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
                {AGENT_HEADER.subtitle}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <ClearDataButton agentId={agentId} />
          {extraHeaderAction}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px 8px',
        }}
      >
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isLatest={idx === messages.length - 1}
          />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'var(--danger-dim)',
              border: '1px solid rgba(255,77,77,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12,
              color: '#FF7575',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <InputBar onSend={onSend} isLoading={isLoading} />
    </div>
  )
}

