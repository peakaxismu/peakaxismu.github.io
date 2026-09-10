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
      <style jsx>{`
        .admin-shell { min-height: 100vh; background: var(--ash); color: var(--ink); }
        .admin-header { position: sticky; top: 0; z-index: 60; background: rgba(250,248,243,.97); border-bottom: 1px solid var(--sand-line); backdrop-filter: blur(10px); }
        .admin-header-inner { max-width: 1180px; min-height: 72px; margin: 0 auto; padding: 12px 32px; display: flex; align-items: center; gap: 28px; }
        .admin-brand { flex: 0 0 auto; font-family: 'Big Shoulders Display', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; }
        .admin-brand span { color: var(--ember); }
        .admin-brand small { margin-left: 5px; color: var(--teal); font: 700 11px Inter, sans-serif; letter-spacing: .04em; }
        .admin-nav { display: flex; align-items: center; gap: 18px; flex: 1; }
        .admin-nav a { position: relative; padding: 10px 0; font-size: 13.5px; font-weight: 600; white-space: nowrap; color: var(--ink); }
        .admin-nav a:hover, .admin-nav a.active { color: var(--ember); }
        .admin-nav a.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 3px; height: 2px; background: var(--ember); }
        .admin-actions { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
        .admin-actions a { font-size: 12.5px; color: #5a564f; text-decoration: underline; white-space: nowrap; }
        .admin-actions button { border: 1px solid var(--ink); background: transparent; padding: 7px 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .admin-actions button:hover { background: var(--ink); color: var(--warm-white); }
        .admin-menu-button { display: none; margin-left: auto; width: 42px; height: 42px; border: 1px solid var(--ink); background: transparent; font-size: 22px; cursor: pointer; }
        .admin-main { padding: 40px 32px 64px; }
        .admin-content { max-width: 1180px; margin: 0 auto; min-width: 0; }
        @media (max-width: 1050px) {
          .admin-header-inner { gap: 18px; }
          .admin-nav { gap: 12px; }
          .admin-nav a { font-size: 12.5px; }
        }
        @media (max-width: 850px) {
          .admin-header-inner { padding: 12px 20px; flex-wrap: wrap; }
          .admin-menu-button { display: block; }
          .admin-nav { display: none; width: 100%; order: 4; flex-direction: column; align-items: stretch; gap: 0; padding: 8px 0 4px; border-top: 1px solid var(--sand-line); }
          .admin-nav.open { display: flex; }
          .admin-nav a { padding: 13px 4px; border-bottom: 1px solid var(--sand-line); }
          .admin-nav a.active::after { display: none; }
          .admin-actions { margin-left: auto; }
          .admin-actions a { display: none; }
          .admin-main { padding: 28px 20px 48px; }
        }
        @media (max-width: 520px) {
          .admin-brand { font-size: 19px; }
          .admin-brand small { font-size: 9px; }
          .admin-actions button { padding: 7px 10px; }
        }
      `}</style>

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
