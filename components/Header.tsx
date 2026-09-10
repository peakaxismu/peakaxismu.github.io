'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/hikes', label: 'Hikes' },
  { href: '/expeditions/piton-de-la-fournaise', label: 'Expeditions' },
  { href: '/enquire', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith('/admin')) return null

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
                  className={pathname === link.href || (link.href.startsWith('/expeditions') && pathname?.startsWith('/expeditions')) ? 'active' : ''}
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
              className={pathname === link.href || (link.href.startsWith('/expeditions') && pathname?.startsWith('/expeditions')) ? 'active' : ''}
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
