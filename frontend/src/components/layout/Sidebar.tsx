'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/hooks/useUser'

const NAV_AGENTS = [
  { id: 'fitness',   initials: 'FT', name: 'Fitness',   href: '/agents/fitness',  active: true  },
  { id: 'nutrition', initials: 'NT', name: 'Nutrition',  href: '/agents/nutrition', active: true  },
  { id: 'sleep',     initials: 'SL', name: 'Sleep',      href: '/agents/sleep',     active: false },
  { id: 'mental',    initials: 'MN', name: 'Mental',     href: '/agents/mental',    active: false },
  { id: 'recovery',  initials: 'RC', name: 'Recovery',   href: '/agents/recovery',  active: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const userMetadata = user?.user_metadata
  const displayName = userMetadata?.full_name || userMetadata?.name || user?.email?.split('@')[0] || ''
  const emailDisplay = user?.email || ''
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture || null
  const avatarLetter = displayName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        width: 62,
        background: '#0C0C0C',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 0',
        gap: 5,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 900, color: '#080808', letterSpacing: -1 }}>H</span>
        </div>
      </Link>

      {NAV_AGENTS.map((agent) => {
        const isCurrentPage = pathname?.includes(agent.id)
        const isAvailable = agent.active
        return (
          <div key={agent.id} style={{ position: 'relative' }}>
            {isAvailable ? (
              <Link href={agent.href} style={{ textDecoration: 'none' }} title={agent.name}>
                <NavItem initials={agent.initials} isActive={!!isCurrentPage} isAvailable />
              </Link>
            ) : (
              <div title={`${agent.name} — Sắp ra mắt`} style={{ cursor: 'not-allowed' }}>
                <NavItem initials={agent.initials} isActive={false} isAvailable={false} />
              </div>
            )}
          </div>
        )
      })}

      <div style={{ flex: 1 }} />

      <button
        title="Cài đặt"
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--surface-2)', border: '1px solid var(--border-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-3)', marginBottom: 4, cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 1.5V3M7 11V12.5M1.5 7H3M11 7H12.5M3.1 3.1L4.1 4.1M9.9 9.9L10.9 10.9M10.9 3.1L9.9 4.1M4.1 9.9L3.1 10.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: menuOpen ? 'rgba(184,255,60,0.15)' : 'var(--surface-3)',
            border: `1px solid ${menuOpen ? 'rgba(184,255,60,0.4)' : 'var(--border-2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            color: menuOpen ? '#B8FF3C' : 'var(--text-2)',
            cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none',
          }}
          title="Tài khoản"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : avatarLetter ? (
            <span style={{ fontSize: 12, fontWeight: 700 }}>{avatarLetter}</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 12.5c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute', bottom: 0, left: 44,
              width: 220, background: '#141414',
              border: '1px solid #242424', borderRadius: 12, padding: 6,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100,
            }}
          >
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E1E1E', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: avatarUrl ? 'transparent' : 'rgba(184,255,60,0.15)',
                    border: `1px solid ${avatarUrl ? 'rgba(255,255,255,0.2)' : 'rgba(184,255,60,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#B8FF3C', flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} style={{ width: 32, height: 32, objectFit: 'cover' }} />
                  ) : avatarLetter ? (
                    <span>{avatarLetter}</span>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1.5 12.5c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#D0D0D0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName || emailDisplay}
                  </div>
                  {emailDisplay && (
                    <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>Healthy Member</div>
                  )}
                </div>
              </div>
            </div>

            <MenuItem
              icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" /><path d="M1 11.5c0-2.21 2.462-4 5.5-4s5.5 1.79 5.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
              label="Hồ sơ"
              onClick={() => setMenuOpen(false)}
            />
            <MenuItem
              icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6.5 1.5V3M6.5 10V11.5M1.5 6.5H3M10 6.5H11.5M2.8 2.8L3.8 3.8M9.2 9.2L10.2 10.2M10.2 2.8L9.2 3.8M3.8 9.2L2.8 10.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
              label="Cài đặt"
              onClick={() => setMenuOpen(false)}
            />

            <div style={{ height: 1, background: '#1E1E1E', margin: '4px 0' }} />

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: '100%', padding: '8px 12px',
                background: 'transparent', border: 'none', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                color: loggingOut ? '#555' : '#FF6B6B',
                fontSize: 13, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = 'rgba(255,107,107,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {loggingOut ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M5 11.5H2.5A1 1 0 0 1 1.5 10.5V2.5A1 1 0 0 1 2.5 1.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M8.5 9.5L11.5 6.5L8.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11.5 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
              {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '8px 12px', background: 'transparent',
        border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center',
        gap: 10, cursor: 'pointer', color: '#888', fontSize: 13,
        fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#C0C0C0' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
    >
      {icon}
      {label}
    </button>
  )
}

function NavItem({ initials, isActive, isAvailable }: { initials: string; isActive: boolean; isAvailable: boolean }) {
  return (
    <div
      style={{
        width: 42, height: 42, borderRadius: 10,
        background: isActive ? 'var(--accent-dim)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(184,255,60,0.2)' : 'transparent'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', opacity: isAvailable ? 1 : 0.25,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? 'var(--accent)' : '#383838', letterSpacing: 0.5 }}>
        {initials}
      </span>
      {isActive && <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)', marginTop: 3 }} />}
    </div>
  )
}