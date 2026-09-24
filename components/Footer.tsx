'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-content">
          <p className="footer-brand">Peak Axis — Hikes · Expeditions · Team Building · Activities</p>

          <div className="social-links" aria-label="Social Media Links">
            <a href="https://www.instagram.com/peak.axis" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon-btn" title="Instagram: @peak.axis">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>

            <a href="https://www.tiktok.com/@peak.axis" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-icon-btn" title="TikTok: @peak.axis">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-svg"><path d="M9 3v11a4 4 0 1 1-3-3"></path><path d="M9 3c1 4 3 6 7 6V5c-2 0-4-1-5-2"></path></svg>
            </a>
          </div>
        </div>

        <nav aria-label="Legal Navigation" className="legal-nav">
          <ul>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
            <li><Link href="/refund-policy">Refund Policy</Link></li>
            <li><Link href="/cookie-policy">Cookie Policy</Link></li>
          </ul>
        </nav>
      </div>

      <style>{`
        .site-footer { padding: 48px 0 36px; background: #ede7da; border-top: 1px solid rgba(33, 31, 29, 0.14); }
        .footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
        .footer-brand { font-size: 14.5px; font-weight: 600; color: #211f1d; }
        .social-links { display: flex; gap: 14px; align-items: center; }
        .social-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid #211f1d; color: #211f1d; transition: all 0.2s ease; }
        .social-icon-btn:hover { background: #211f1d; color: #fffaf2; transform: translateY(-2px); }
        .social-svg { width: 18px; height: 18px; }
        .legal-nav { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(33, 31, 29, 0.1); }
        .legal-nav ul { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; font-size: 13px; }
        .legal-nav a { color: #5A564F; text-decoration: underline; transition: color 0.18s ease; }
        .legal-nav a:hover { color: #c1440e; }
        @media (max-width: 640px) { .footer-content { flex-direction: column; align-items: center; text-align: center; } }
      `}</style>
    </footer>
  )
}
