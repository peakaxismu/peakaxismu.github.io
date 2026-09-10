'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot() {
  return typeof window !== 'undefined' ? window.localStorage.getItem('peak_axis_cookie_consent') : 'accepted'
}

function getServerSnapshot() {
  return 'accepted'
}

export default function CookieConsent() {
  const pathname = usePathname()
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const showBanner = !consent

  const handleAccept = () => {
    window.localStorage.setItem('peak_axis_cookie_consent', 'accepted')
    window.dispatchEvent(new Event('storage'))
  }

  if (pathname?.startsWith('/admin') || !showBanner) return null

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
