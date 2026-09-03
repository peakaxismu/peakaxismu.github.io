'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="site-header">
      <div className="navbar">
        <Link href="/" className="logo">
          PEAK <span>AXIS</span>
        </Link>
        <nav>
          <ul>
            <li>
              <Link href="/" className={pathname === '/' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/hikes" className={pathname === '/hikes' ? 'active' : ''}>
                Hikes
              </Link>
            </li>
            <li>
              <Link href="/expeditions/piton-de-la-fournaise" className={pathname?.startsWith('/expeditions') ? 'active' : ''}>
                Expeditions
              </Link>
            </li>
            <li>
              <Link href="/enquire" className={pathname === '/enquire' ? 'active' : ''}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <Link href="/enquire" className="nav-cta">
          Plan an Adventure
        </Link>
      </div>
    </header>
  )
}
