'use client'

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
      </div>
    </footer>
  )
}
