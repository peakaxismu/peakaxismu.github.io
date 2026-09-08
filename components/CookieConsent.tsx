'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('peak_axis_cookie_consent')
  })

  const handleAccept = () => {
    localStorage.setItem('peak_axis_cookie_consent', 'accepted')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '520px',
        background: 'var(--ink)',
        color: 'var(--warm-white)',
        padding: '20px 24px',
        borderRadius: '2px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
        We use only essential functional cookies for site operation and admin sessions. We do not use non-essential tracking or advertising cookies. Read our{' '}
        <Link
          href="/cookie-policy"
          style={{ color: '#E8D9B8', textDecoration: 'underline', fontWeight: 600 }}
        >
          Cookie Policy
        </Link>{' '}
        for details.
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            background: 'var(--ember)',
            color: 'var(--warm-white)',
            border: 'none',
            padding: '8px 18px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
