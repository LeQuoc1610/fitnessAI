'use client'

import { useRef, useState, useCallback, KeyboardEvent } from 'react'

interface InputBarProps {
  onSend: (message: string) => void
  isLoading: boolean
}

const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 7H12M12 7L7 2M12 7L7 12"
      stroke={active ? '#080808' : '#3A3A3A'}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MicIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4.5" y="1" width="5" height="8" rx="2.5" stroke={active ? 'var(--accent)' : '#444'} strokeWidth="1.2" />
    <path d="M2 7C2 10 5 12 7 12C9 12 12 10 12 7" stroke={active ? 'var(--accent)' : '#444'} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="12" x2="7" y2="13.5" stroke={active ? 'var(--accent)' : '#444'} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

export function InputBar({ onSend, isLoading }: InputBarProps) {
  const [value, setValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = value.trim().length > 0 && !isLoading

  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [canSend, value, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px'
  }

  const toggleVoice = () => {
    setIsRecording((v) => !v)
  }

  return (
    <div
      style={{
        padding: '12px 20px 18px',
        borderTop: '1px solid var(--border)',
        background: '#0B0B0B',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          background: 'var(--surface)',
          border: `1px solid ${canSend ? 'var(--border-2)' : 'var(--border)'}`,
          borderRadius: 13,
          padding: '8px 8px 8px 15px',
          alignItems: 'flex-end',
          transition: 'border-color 0.15s',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn tin với Fitness..."
          rows={1}
          style={{
            flex: 1,
            minHeight: 24,
            maxHeight: 130,
            overflow: 'hidden',
            padding: '4px 0',
          }}
        />
        <button
          onClick={toggleVoice}
          title="Gọi thoại"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: isRecording ? 'var(--accent-dim)' : 'var(--surface-2)',
            border: `1px solid ${isRecording ? 'rgba(184,255,60,0.25)' : 'var(--border-2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          <MicIcon active={isRecording} />
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: canSend ? 'var(--accent)' : 'var(--surface-2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s, transform 0.1s',
            transform: canSend ? 'scale(1)' : 'scale(0.95)',
          }}
          onMouseDown={(e) => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)' }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          <SendIcon active={canSend} />
        </button>
      </div>

      <p
        style={{
          fontSize: 10,
          color: 'var(--text-3)',
          textAlign: 'center',
          marginTop: 9,
          letterSpacing: 0.8,
        }}
      >
        HEALTHY · FITNESS AGENT · MVP
      </p>
    </div>
  )
}
