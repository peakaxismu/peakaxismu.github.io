'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ash)', display: 'flex', flexDirection: 'column' }}>
      {/* Admin Top Navbar */}
      <header style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--sand-line)', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/admin" style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '22px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              PEAK <span style={{ color: 'var(--ember)' }}>AXIS</span> <span style={{ fontSize: '14px', color: 'var(--teal)', fontWeight: 700 }}>ADMIN</span>
            </Link>
            <nav style={{ display: 'flex', gap: '20px' }}>
              <Link href="/admin" style={{ fontSize: '14px', fontWeight: 600, color: pathname === '/admin' ? 'var(--ember)' : 'var(--ink)' }}>
                Dashboard
              </Link>
              <Link href="/admin/enquiries" style={{ fontSize: '14px', fontWeight: 600, color: pathname?.startsWith('/admin/enquiries') ? 'var(--ember)' : 'var(--ink)' }}>
                Enquiries
              </Link>
              <Link href="/admin/hikes" style={{ fontSize: '14px', fontWeight: 600, color: pathname?.startsWith('/admin/hikes') ? 'var(--ember)' : 'var(--ink)' }}>
                Hikes
              </Link>
              <Link href="/admin/expeditions" style={{ fontSize: '14px', fontWeight: 600, color: pathname?.startsWith('/admin/expeditions') ? 'var(--ember)' : 'var(--ink)' }}>
                Expeditions
              </Link>
              <Link href="/admin/team-building" style={{ fontSize: '14px', fontWeight: 600, color: pathname?.startsWith('/admin/team-building') ? 'var(--ember)' : 'var(--ink)' }}>
                Team &amp; Activities
              </Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" target="_blank" style={{ fontSize: '13px', textDecoration: 'underline', color: '#5a564f' }}>
              View Live Site ↗
            </Link>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: '1px solid var(--ink)', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Body */}
      <main style={{ flex: 1, padding: '40px 32px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  )
}
