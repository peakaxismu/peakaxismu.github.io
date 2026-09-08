'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer>
      <div className="wrap">
        <p>Peak Axis — Hikes · Expeditions · Team Building · Activities</p>
        <nav aria-label="Legal Navigation" style={{ marginTop: '12px' }}>
          <ul style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0, fontSize: '13px' }}>
            <li>
              <Link href="/privacy-policy" style={{ color: '#5A564F', textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" style={{ color: '#5A564F', textDecoration: 'underline' }}>
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" style={{ color: '#5A564F', textDecoration: 'underline' }}>
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" style={{ color: '#5A564F', textDecoration: 'underline' }}>
                Cookie Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
