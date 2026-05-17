'use client'

interface MemoryToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export function MemoryToggle({ isOpen, onToggle }: MemoryToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={isOpen ? 'Ẩn bộ nhớ' : 'Xem bộ nhớ'}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9,
        background: isOpen ? 'var(--accent-dim)' : 'var(--surface-2)',
        border: `1px solid ${isOpen ? 'rgba(184,255,60,0.25)' : 'var(--border-2)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isOpen ? 'var(--accent)' : 'var(--text-2)',
        transition: 'all 0.15s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8"   y="1.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1.5" y="8"   width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8"   y="8"   width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  )
}
