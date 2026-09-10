'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/hikes', label: 'Hikes' },
  { href: '/admin/expeditions', label: 'Expeditions' },
  { href: '/admin/team-building', label: 'Team & Activities' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) => href === '/admin' ? pathname === href : pathname.startsWith(href)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-brand" onClick={() => setMenuOpen(false)}>
            PEAK <span>AXIS</span> <small>ADMIN</small>
          </Link>

          <button
            type="button"
            className="admin-menu-button"
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
            aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '×' : '☰'}
          </button>

          <nav id="admin-navigation" className={`admin-nav ${menuOpen ? 'open' : ''}`} aria-label="Admin navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? 'active' : ''}
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="admin-actions">
            <Link href="/" target="_blank" rel="noreferrer">View Live Site ↗</Link>
            <button type="button" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
