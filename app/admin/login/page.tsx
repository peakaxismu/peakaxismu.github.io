'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ash)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', width: '100%', maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '26px', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '8px' }}>
          PEAK <span style={{ color: 'var(--ember)' }}>AXIS</span> ADMIN
        </div>
        <p style={{ fontSize: '14px', color: '#5a564f', marginBottom: '28px' }}>
          Sign in to manage hikes, expeditions, and enquiries.
        </p>

        {errorMsg && (
          <div style={{ background: '#C1440E', color: '#FAF8F3', padding: '10px 14px', fontSize: '13.5px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a564f', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@peakaxis.mu"
              style={{ width: '100%', padding: '11px 14px', background: '#FFF', border: '1px solid var(--sand-line)', fontFamily: 'Inter', fontSize: '14.5px', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a564f', marginBottom: '6px' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', background: '#FFF', border: '1px solid var(--sand-line)', fontFamily: 'Inter', fontSize: '14.5px', color: 'var(--ink)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px', background: 'var(--ember)', color: 'var(--warm-white)', border: 'none', padding: '12px 20px', fontFamily: 'Inter', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign in to Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
