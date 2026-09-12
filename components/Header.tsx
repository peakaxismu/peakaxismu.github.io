'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/hikes', label: 'Hikes' },
  { href: '/waterfalls', label: 'Waterfalls' },
  { href: '/expeditions/piton-de-la-fournaise', label: 'Expeditions' },
  { href: '/guides', label: 'Guides' },
  { href: '/journal', label: 'Journal' },
  { href: '/enquire', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith('/admin')) return null

  const isLinkActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    if (href.startsWith('/expeditions')) return pathname.startsWith('/expeditions')
    return pathname === href
  }

  return (
    <header className="site-header">
      <div className="navbar">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          PEAK <span>AXIS</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isLinkActive(link.href) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <Link href="/enquire" className="nav-cta">
            Plan an Adventure
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile Navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isLinkActive(link.href) ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/enquire" className="mobile-nav-cta" onClick={() => setOpen(false)}>
            Plan an Adventure →
          </Link>
        </nav>
      )}
    </header>
  )
}
