'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Kiểm tra email để xác nhận tài khoản!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email hoặc mật khẩu không đúng')
      else router.push('/agents/fitness')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid email profile',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090909',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#B8FF3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: '#080808', letterSpacing: -1 }}>
              H
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#F0F0F0', letterSpacing: -0.5 }}>
            Healthy
          </div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
            {isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục'}
          </div>
        </div>

        <div
          style={{
            background: '#111',
            border: '1px solid #1E1E1E',
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: '#161616',
                border: '1px solid #282828',
                borderRadius: 9,
                padding: '11px 14px',
                fontSize: 14,
                color: '#F0F0F0',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#161616',
                border: '1px solid #282828',
                borderRadius: 9,
                padding: '11px 14px',
                fontSize: 14,
                color: '#F0F0F0',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(255,77,77,0.08)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                color: '#FF7575',
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              style={{
                background: 'rgba(184,255,60,0.08)',
                border: '1px solid rgba(184,255,60,0.2)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                color: '#B8FF3C',
                marginBottom: 14,
              }}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '12px 0',
              background: loading || !email || !password ? '#1A1A1A' : '#B8FF3C',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              color: loading || !email || !password ? '#333' : '#080808',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              letterSpacing: 0.3,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Đang xử lý...' : isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '18px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
            <span style={{ fontSize: 12, color: '#444' }}>hoặc</span>
            <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{
              width: '100%',
              padding: '11px 0',
              background: 'transparent',
              border: '1px solid #282828',
              borderRadius: 10,
              fontSize: 13,
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.borderColor = '#383838'
              t.style.color = '#B0B0B0'
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.borderColor = '#282828'
              t.style.color = '#888'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-7.18-2.52H.96v2.06A8 8 0 0 0 8 16z" fill="#34A853"/>
              <path d="M3.54 9.54A4.8 4.8 0 0 1 3.29 8c0-.54.09-1.06.25-1.54V4.4H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.6l2.58-2.06z" fill="#FBBC05"/>
              <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 0 0 .96 4.4l2.58 2.06C4.17 4.83 5.9 3.18 8 3.18z" fill="#EA4335"/>
            </svg>
            Tiếp tục với Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#444' }}>
          {isSignUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <button
            onClick={() => { setIsSignUp((v) => !v); setError(null); setMessage(null) }}
            style={{ color: '#B8FF3C', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
          >
            {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </p>
      </div>
    </div>
  )
}
