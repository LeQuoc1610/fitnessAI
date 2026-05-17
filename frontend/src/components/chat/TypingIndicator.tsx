'use client'

export function TypingIndicator() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}
    >
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
        }}
      >
        FT
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '3px 14px 14px 14px',
          padding: '13px 18px',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}
