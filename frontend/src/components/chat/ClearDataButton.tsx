'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/utils/api'

interface ClearDataButtonProps {
  agentId?: string
  onClear?: () => void
}

export function ClearDataButton({ agentId = 'fitness', onClear }: ClearDataButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [clearMode, setClearMode] = useState<'chat' | 'all'>('chat')
  const [message, setMessage] = useState<string | null>(null)

  async function handleClear() {
    setIsClearing(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const chatRes = await fetch(`${API_BASE}/chat?agentId=${agentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!chatRes.ok) {
        setMessage('Lỗi khi xóa dữ liệu.')
        setIsClearing(false)
        return
      }

      if (clearMode === 'all') {
        const memoryRes = await fetch(`${API_BASE}/memory`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agentId }),
        })

        if (!memoryRes.ok) {
          setMessage('Đã xóa chat, lỗi khi xóa thông tin cá nhân.')
          setIsClearing(false)
          return
        }
      }

      setMessage(clearMode === 'all' ? 'Đã xóa toàn bộ dữ liệu!' : 'Đã xóa lịch sử chat!')
      onClear?.()
      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
        window.location.reload()
      }, 1500)
    } catch {
      setMessage('Lỗi kết nối.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <>
      <button
        title="Xóa dữ liệu"
        onClick={() => setIsOpen(true)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-2)',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,77,77,0.15)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#FF7575'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
        }}
      >
        <TrashIcon />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !isClearing && setIsOpen(false)}
        >
          <div
            style={{
              background: '#141414',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '24px 28px',
              maxWidth: 360,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#F0F0F0' }}>
              Xóa dữ liệu
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${clearMode === 'chat' ? '#B8FF3C' : 'var(--border)'}`,
                  background: clearMode === 'chat' ? 'rgba(184,255,60,0.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="clearMode"
                  checked={clearMode === 'chat'}
                  onChange={() => setClearMode('chat')}
                  style={{ accentColor: '#B8FF3C' }}
                />
                <div>
                  <div style={{ fontSize: 13, color: '#F0F0F0', fontWeight: 500 }}>
                    Chỉ xóa lịch sử chat
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                    Giữ lại thông tin cá nhân, mục tiêu, check-in
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${clearMode === 'all' ? '#FF4D4D' : 'var(--border)'}`,
                  background: clearMode === 'all' ? 'rgba(255,77,77,0.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="clearMode"
                  checked={clearMode === 'all'}
                  onChange={() => setClearMode('all')}
                  style={{ accentColor: '#FF4D4D' }}
                />
                <div>
                  <div style={{ fontSize: 13, color: '#F0F0F0', fontWeight: 500 }}>
                    Xóa toàn bộ
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                    Chat + thông tin cá nhân + check-in
                  </div>
                </div>
              </label>
            </div>

            {message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: message.includes('Lỗi') ? 'rgba(255,77,77,0.1)' : 'rgba(184,255,60,0.1)',
                  color: message.includes('Lỗi') ? '#FF7575' : '#B8FF3C',
                  fontSize: 13,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isClearing}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleClear}
                disabled={isClearing}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: isClearing ? '#333' : clearMode === 'all' ? '#FF4D4D' : '#B8FF3C',
                  color: clearMode === 'all' ? '#fff' : '#080808',
                  fontSize: 13,
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                }}
              >
                {isClearing ? 'Đang xóa...' : clearMode === 'all' ? 'Xóa toàn bộ' : 'Xóa chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M5.5 3.5V2.5C5.5 1.95 5.95 1.5 6.5 1.5H8.5C9.05 1.5 9.5 1.95 9.5 2.5V3.5M2 3.5H13M3 3.5V12.5C3 13.05 3.45 13.5 4 13.5H11C11.55 13.5 12 13.05 12 12.5V3.5M6 6.5V10.5M9 6.5V10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
