'use client'

import { useState, useEffect } from 'react'
import type { UserMemory, WorkoutDay } from '@/types'
import { useUser } from '@/hooks/useUser'
import type { User } from '@supabase/supabase-js'

interface MemoryPanelProps {
  memory: UserMemory | null
  checkInCount?: number
  streakDays?: number
  isLoading: boolean
  onUpdate: (updates: Partial<UserMemory>) => Promise<void>
  onReset: () => Promise<void>
}

type Tab = 'profile' | 'plan'

const GOAL_LABELS: Record<string, string> = {
  fat_loss: 'Giảm mỡ',
  muscle_gain: 'Tăng cơ',
  endurance: 'Sức bền',
  general: 'Tổng thể',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Người mới',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

export function MemoryPanel({ memory, checkInCount, streakDays, isLoading, onUpdate, onReset }: MemoryPanelProps) {
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('profile')
  const [confirmReset, setConfirmReset] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(memory?.name ?? '')

  useEffect(() => {
    if (!editingName) {
      setNameInput(memory?.name ?? '')
    }
  }, [memory?.name, editingName])

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdate({ name: nameInput.trim() })
    }
    setEditingName(false)
  }

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    await onReset()
    setConfirmReset(false)
  }

  const stats = [
    { label: 'Check-ins', value: checkInCount ?? memory?.check_in_count ?? 0 },
    { label: 'Streak', value: `${streakDays ?? memory?.streak_days ?? 0}d` },
  ]

  const profileRows = [
    {
      label: 'Mục tiêu',
      value: memory?.goal ? GOAL_LABELS[memory.goal] : null,
    },
    {
      label: 'Cấp độ',
      value: memory?.level ? LEVEL_LABELS[memory.level] : null,
    },
    {
      label: 'Lịch tập',
      value: memory?.schedule
        ? `${memory.schedule.sessions_per_week} buổi/tuần · ${memory.schedule.duration_min}p`
        : null,
    },
    {
      label: 'Cân nặng',
      value: memory?.body_stats?.weight_kg ? `${memory.body_stats.weight_kg} kg` : null,
    },
    {
      label: 'Chiều cao',
      value: memory?.body_stats?.height_cm ? `${memory.body_stats.height_cm} cm` : null,
    },
  ]

  const UPCOMING = [
    { label: 'Meal Tracking' },
    { label: 'Recovery' },
    { label: 'Wearables' },
    { label: 'Challenges' },
  ]

  return (
    <div
      style={{
        width: 260,
        background: '#0C0C0C',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {(['profile', 'plan'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '11px 0',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: tab === t ? 'var(--accent)' : 'var(--text-3)',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            {t === 'profile' ? 'Hồ sơ' : 'Kế hoạch'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {isLoading ? (
          <MemorySkeleton />
        ) : tab === 'profile' ? (
          <ProfileTab
            memory={memory}
            user={user}
            stats={stats}
            profileRows={profileRows}
            editingName={editingName}
            nameInput={nameInput}
            setEditingName={setEditingName}
            setNameInput={setNameInput}
            handleNameSubmit={handleNameSubmit}
          />
        ) : (
          <PlanTab memory={memory} upcoming={UPCOMING} />
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '9px 0',
            borderRadius: 8,
            border: `1px solid ${confirmReset ? 'rgba(255,77,77,0.3)' : 'var(--border-2)'}`,
            color: confirmReset ? '#FF7575' : 'var(--text-3)',
            fontSize: 12,
            letterSpacing: 0.5,
            transition: 'all 0.15s',
          }}
        >
          {confirmReset ? '⚠ Nhấn lần nữa để xác nhận' : '↺ Reset bộ nhớ'}
        </button>
      </div>
    </div>
  )
}


interface ProfileTabProps {
  memory: UserMemory | null
  user: User | null
  stats: { label: string; value: string | number }[]
  profileRows: { label: string; value: string | null }[]
  editingName: boolean
  nameInput: string
  setEditingName: (v: boolean) => void
  setNameInput: (v: string) => void
  handleNameSubmit: () => void
}

function ProfileTab({
  memory,
  user,
  stats,
  profileRows,
  editingName,
  nameInput,
  setEditingName,
  setNameInput,
  handleNameSubmit,
}: ProfileTabProps) {
  const authAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const authDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Avatar card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 14,
          textAlign: 'center',
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--surface-3)',
            border: '2px solid rgba(184,255,60,0.2)',
            margin: '0 auto 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--accent)',
            overflow: 'hidden',
          }}
        >
          {authAvatarUrl ? (
            <img
              src={authAvatarUrl}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>
              {memory?.name
                ? memory.name[0].toUpperCase()
                : authDisplayName
                  ? authDisplayName[0].toUpperCase()
                  : '?'}
            </span>
          )}
        </div>

        {/* Name — editable */}
        {editingName ? (
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-2)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 13,
              color: 'var(--text-1)',
              textAlign: 'center',
              width: '100%',
              outline: 'none',
            }}
            placeholder="Nhập tên..."
          />
        ) : (
          <div
            onClick={() => { setNameInput(memory?.name ?? ''); setEditingName(true) }}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: memory?.name || authDisplayName ? 'var(--text-1)' : 'var(--text-3)',
              cursor: 'pointer',
              padding: '2px 0',
            }}
            title="Click để chỉnh sửa"
          >
            {memory?.name ?? authDisplayName ?? 'Chưa có tên'}
          </div>
        )}


        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 0',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory rows */}
      <Section label="Bộ nhớ">
        {profileRows.map((row) => (
          <MemoryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </Section>

      {/* Weaknesses */}
      <Section label="Điểm yếu">
        {memory?.weaknesses && memory.weaknesses.length > 0 ? (
          memory.weaknesses.map((w, i) => (
            <div
              key={i}
              style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(255,77,77,0.18)',
                borderRadius: 7,
                padding: '7px 10px',
                fontSize: 12,
                color: '#FF7575',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 10 }}>●</span>
              {w}
            </div>
          ))
        ) : (
          <EmptyState text="Chưa phát hiện điểm yếu" />
        )}
      </Section>

      {/* Motivations */}
      <Section label="Động lực">
        {memory?.motivations && memory.motivations.length > 0 ? (
          memory.motivations.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid rgba(184,255,60,0.15)',
                borderRadius: 7,
                padding: '7px 10px',
                fontSize: 12,
                color: 'var(--accent)',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 10 }}>◆</span>
              {m}
            </div>
          ))
        ) : (
          <EmptyState text="Chưa ghi nhận động lực" />
        )}
      </Section>
    </div>
  )
}

function PlanTab({
  memory,
  upcoming,
}: {
  memory: UserMemory | null
  upcoming: { label: string }[]
}) {
  const daysList: WorkoutDay[] = memory?.current_plan?.weeks?.flatMap((w) => w.days) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Section label="Kế hoạch hiện tại">
        {memory?.current_plan ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
              {memory.current_plan.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Pill>{memory.current_plan.duration_weeks} tuần</Pill>
              <Pill>{memory.current_plan.sessions_per_week} buổi/tuần</Pill>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {daysList.slice(0, 3).map((day, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>{day.day}</span>
                  <span style={{ color: 'var(--accent)', fontSize: 11 }}>{day.focus}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState text={'Chưa có kế hoạch\nChat với Fitness để tạo kế hoạch cá nhân'} />
        )}
      </Section>

      <Section label="Sắp ra mắt">
        {upcoming.map((f) => (
          <div
            key={f.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: 0.4,
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{f.label}</span>
            <span
              style={{
                fontSize: 9,
                background: 'var(--surface-3)',
                border: '1px solid var(--border-2)',
                borderRadius: 4,
                padding: '2px 7px',
                color: 'var(--text-3)',
                letterSpacing: 0.5,
              }}
            >
              SOON
            </span>
          </div>
        ))}
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--text-3)',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function MemoryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '9px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: value ? 'var(--accent)' : 'var(--text-3)',
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--border)',
        borderRadius: 8,
        padding: '14px 12px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-3)',
        lineHeight: 1.6,
        whiteSpace: 'pre-line',
      }}
    >
      {text}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'var(--accent-dim)',
        border: '1px solid rgba(184,255,60,0.15)',
        borderRadius: 6,
        padding: '3px 9px',
        fontSize: 11,
        color: 'var(--accent)',
      }}
    >
      {children}
    </span>
  )
}

function MemorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[80, 60, 60, 60, 60].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? 120 : 36,
            borderRadius: 8,
            background: 'var(--surface)',
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  )
}
