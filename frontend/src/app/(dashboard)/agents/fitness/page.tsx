'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { MemoryPanel } from '@/components/memory/MemoryPanel'
import { MemoryToggle } from '@/components/ui/MemoryToggle'
import { useFitnessChat } from '@/hooks/useFitnessChat'
import { useMemory } from '@/hooks/useMemory'
import { useUser } from '@/hooks/useUser'
import { useCheckin } from '@/hooks/useCheckin'

export default function FitnessPage() {
  const [showMemory, setShowMemory] = useState(true)
  const router = useRouter()
  const { user, loading: userLoading } = useUser()

  if (userLoading) return <LoadingScreen />
  if (!user) { router.push('/login'); return null }

  return (
    <FitnessChat
      userId={user.id}
      showMemory={showMemory}
      setShowMemory={setShowMemory}
    />
  )
}

function FitnessChat({
  userId,
  showMemory,
  setShowMemory,
}: {
  userId: string
  showMemory: boolean
  setShowMemory: (v: boolean) => void
}) {
  const { memory, isLoading: memoryLoading, updateMemory, resetMemory } = useMemory(userId)
  const { checkedToday, checkInCount, streakDays, checkIn } = useCheckin(userId)

  const { messages, isLoading: chatLoading, error, sendMessage } = useFitnessChat({
    userId,
    onMemoryUpdate: updateMemory,
    checkedToday: checkedToday ?? true,
  })

  const handleCheckin = async () => {
    try {
      await checkIn({ didWorkout: true })
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err) || 'Check-in failed (unknown error)'
      console.error('Check-in failed:', msg)
      alert('❌ ' + msg)
    }
  }

  const headerActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={handleCheckin}
        title="Check-in"
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
          fontSize: 12,
        }}
      >
        ✓
      </button>

      <MemoryToggle
        isOpen={showMemory}
        onToggle={() => setShowMemory(!showMemory)}
      />
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <ChatWindow
        messages={messages}
        isLoading={chatLoading}
        error={error}
        onSend={sendMessage}
        extraHeaderAction={headerActions}
      />
      {showMemory && (
        <MemoryPanel
          memory={memory}
          checkInCount={checkInCount}
          streakDays={streakDays}
          isLoading={memoryLoading}
          onUpdate={updateMemory}
          onReset={resetMemory}
        />
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090909' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(145deg, #B8FF3C, #7ACC00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 14, fontWeight: 900, color: '#080808' }}>FT</div>
        <div style={{ fontSize: 13, color: '#444' }}>Đang tải...</div>
      </div>
    </div>
  )
}
