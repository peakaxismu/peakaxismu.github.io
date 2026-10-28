'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const dashboardLink = { href: '/admin', label: 'Dashboard' }
const navigationGroups = [
  {
    label: 'Operations',
    links: [
      { href: '/admin/enquiries', label: 'Enquiries' },
      { href: '/admin/customers', label: 'Customers' },
      { href: '/admin/bookings', label: 'Bookings' },
      { href: '/admin/tasks', label: 'Tasks' },
      { href: '/admin/ai-assistant', label: 'AI Review' },
    ],
  },
  {
    label: 'Experiences',
    links: [
      { href: '/admin/hikes', label: 'Hikes' },
      { href: '/admin/hikes/conditions', label: 'Trail conditions' },
      { href: '/admin/waterfalls', label: 'Waterfalls' },
      { href: '/admin/expeditions', label: 'Expeditions' },
      { href: '/admin/team-building', label: 'Team & Activities' },
    ],
  },
  {
    label: 'Website',
    links: [
      { href: '/admin/journal', label: 'Journal' },
      { href: '/admin/site-content', label: 'Site content' },
      { href: '/admin/marketing-links', label: 'Marketing links' },
    ],
  },
]
const allLinks = [dashboardLink, ...navigationGroups.flatMap(group => group.links)]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === href
    if (pathname === href) return true
    if (!pathname.startsWith(href + '/')) return false
    const hasMoreSpecificMatch = allLinks.some(link =>
      link.href !== href &&
      link.href.startsWith(href + '/') &&
      (pathname === link.href || pathname.startsWith(link.href + '/'))
    )
    return !hasMoreSpecificMatch
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-shell">
      <style jsx>{`
        .admin-shell{min-height:100vh;background:var(--ash);color:var(--ink)}
        .admin-header{position:sticky;top:0;z-index:60;background:rgba(250,248,243,.97);border-bottom:1px solid var(--sand-line);backdrop-filter:blur(10px)}
        .admin-header-inner{max-width:1340px;min-height:72px;margin:0 auto;padding:12px 28px;display:flex;align-items:center;gap:18px}
        .admin-brand{flex:0 0 auto;font-family:'Big Shoulders Display',sans-serif;font-size:22px;font-weight:900;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;text-decoration:none;color:var(--ink)}
        .admin-brand span{color:var(--ember)}.admin-brand small{margin-left:5px;color:var(--teal);font:750 10px Inter,sans-serif;letter-spacing:.06em}
        .admin-nav{display:flex;align-items:center;gap:4px;flex:1;min-width:0}
        .admin-nav>a,.admin-nav-group>summary{position:relative;display:flex;align-items:center;gap:7px;padding:10px 11px;border-radius:3px;font-size:12.5px;font-weight:700;white-space:nowrap;color:#514c45;text-decoration:none;cursor:pointer;list-style:none}
        .admin-nav-group>summary::-webkit-details-marker{display:none}
        .admin-nav-group>summary:after{content:'⌄';color:#8a8175;font-size:12px;transform:translateY(-1px)}
        .admin-nav>a:hover,.admin-nav-group>summary:hover{background:#f1eadf;color:var(--ember)}
        .admin-nav>a.active,.admin-nav-group>summary.active{background:#f3e8dc;color:var(--ember)}
        .admin-nav-group{position:relative;flex:0 0 auto}
        .admin-nav-submenu{position:absolute;top:calc(100% + 4px);left:0;z-index:80;min-width:195px;padding:6px;background:var(--warm-white);border:1px solid var(--sand-line);border-radius:4px;box-shadow:0 12px 30px rgba(35,29,22,.13);display:grid;gap:2px}
        .admin-nav-submenu a{display:block;padding:10px 11px;border-radius:3px;color:var(--ink);font-size:12.5px;font-weight:600;text-decoration:none;white-space:nowrap}
        .admin-nav-submenu a:hover,.admin-nav-submenu a.active{background:#f3e8dc;color:var(--ember)}
        .admin-actions{display:flex;align-items:center;gap:10px;margin-left:auto;flex:0 0 auto}
        .admin-actions a{font-size:12px;color:#5a564f;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
        .admin-actions button{border:1px solid var(--ink);border-radius:3px;background:transparent;padding:8px 11px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer}
        .admin-actions button:hover{background:var(--ink);color:#fffaf2}
        .admin-menu-button{display:none;margin-left:auto;width:42px;height:42px;border:1px solid var(--ink);border-radius:3px;background:transparent;font-size:21px;cursor:pointer}
        .admin-main{padding:36px 32px 64px}.admin-content{max-width:1180px;margin:0 auto;min-width:0}
        @media(max-width:1080px){
          .admin-header-inner{padding:12px 20px;flex-wrap:wrap;gap:14px}
          .admin-menu-button{display:block}
          .admin-actions{margin-left:0}
          .admin-nav{display:none;width:100%;order:4;flex:0 0 100%;flex-direction:column;align-items:stretch;gap:0;padding:8px 0 4px;border-top:1px solid var(--sand-line)}
          .admin-nav.open{display:flex}
          .admin-nav>a,.admin-nav-group>summary{padding:13px 7px;border-bottom:1px solid #e9e1d5;border-radius:0;font-size:13px}
          .admin-nav>a.active,.admin-nav-group>summary.active{background:transparent}
          .admin-nav-group{width:100%;border-bottom:1px solid #e9e1d5}
          .admin-nav-group>summary{border-bottom:0}
          .admin-nav-submenu{position:static;min-width:0;padding:3px 0 8px;background:transparent;border:0;border-radius:0;box-shadow:none}
          .admin-nav-submenu a{padding:11px 18px;white-space:normal}
          .admin-actions{margin-left:auto}
          .admin-main{padding:28px 20px 48px}
        }
        @media(max-width:520px){
          .admin-header-inner{padding:10px 14px;gap:10px}
          .admin-brand{font-size:19px}.admin-brand small{font-size:9px}
          .admin-actions{gap:7px}.admin-actions button{padding:7px 9px;font-size:11px}
          .admin-main{padding:24px 14px 40px}
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
            onClick={() => setMenuOpen(value => !value)}
          >
            {menuOpen ? '×' : '☰'}
          </button>

          <nav id="admin-navigation" className={`admin-nav ${menuOpen ? 'open' : ''}`} aria-label="Admin navigation">
            <Link href={dashboardLink.href} className={isActive(dashboardLink.href) ? 'active' : ''} aria-current={isActive(dashboardLink.href) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
              {dashboardLink.label}
            </Link>
            {navigationGroups.map(group => {
              const groupActive = group.links.some(link => isActive(link.href))
              return (
                <details key={group.label} className="admin-nav-group">
                  <summary className={groupActive ? 'active' : ''} aria-label={group.label + ' navigation'}>
                    {group.label}
                  </summary>
                  <div className="admin-nav-submenu">
                    {group.links.map(link => (
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
                  </div>
                </details>
              )
            })}
          </nav>

          <div className="admin-actions">
            <Link href="/" target="_blank" rel="noreferrer">View live site ↗</Link>
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
