import Link from 'next/link'

export const metadata = {
  title: 'Our Mountain Guides — Peak Axis',
  description: 'Meet the certified mountain guides and directors leading Peak Axis hikes in Mauritius and La Réunion.',
}

const GUIDES = [
  {
    id: 'g-1',
    name: '[Guide Name]',
    role: '[Certified Mountain Guide / Co-Founder]',
    bio: '[1-2 sentences — background, specialty terrain, years guiding across Mauritius ridge paths and volcanic routes.]',
  },
  {
    id: 'g-2',
    name: '[Guide Name]',
    role: '[Lead Expedition Guide]',
    bio: '[1-2 sentences — background, wilderness first responder licensing, high altitude caldera specialist.]',
  },
  {
    id: 'g-3',
    name: '[Guide Name]',
    role: '[Waterfall & Canyon Specialist]',
    bio: '[1-2 sentences — background, gorge navigation expert, emergency protocol lead.]',
  },
]

export default function GuidesPage() {
  return (
    <div id="view-guides" className="guides-page">
      <section className="guides-hero">
        <div className="wrap">
          <span className="kicker">PEAK AXIS MOUNTAIN LEADERSHIP</span>
          <h1>The people who lead the way</h1>
          <p className="hero-intro">
            Peak Axis is run by people who know these mountains personally — not a call centre. Here&apos;s who you&apos;ll actually meet on the trail.
          </p>
        </div>
      </section>

      <section className="guides-list-section">
        <div className="wrap">
          <div className="guides-grid">
            {GUIDES.map((guide) => (
              <article key={guide.id} className="guide-card">
                <div className="guide-avatar">
                  <svg viewBox="0 0 100 100" fill="none" className="avatar-svg">
                    <rect width="100" height="100" fill="#1F4B4C" />
                    <circle cx="50" cy="40" r="22" fill="#C9B790" opacity="0.6" />
                    <path d="M15 90 C20 65, 80 65, 85 90 Z" fill="#C9B790" opacity="0.6" />
                  </svg>
                  <span className="badge-placeholder">PHOTO SLOT</span>
                </div>

                <div className="guide-info">
                  <span className="guide-role placeholder-text">{guide.role}</span>
                  <h2 className="guide-name placeholder-text">{guide.name}</h2>
                  <p className="guide-bio placeholder-text">{guide.bio}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="guides-cta-box">
            <h3>Have questions for our lead guides?</h3>
            <p>Tell us about your fitness level, experience, or planned trail route and we will match you with the right guide.</p>
            <Link href="/enquire" className="btn-primary">Get in touch with a guide →</Link>
          </div>
        </div>
      </section>

      <style>{`
        .guides-page { background: #f5f1e8; color: #211f1d; min-height: 80vh; padding-bottom: 80px; }
        .guides-hero { padding: 72px 0 52px; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .kicker { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; display: block; margin-bottom: 16px; }
        .guides-hero h1 { font-family: var(--font-display), sans-serif; font-size: clamp(48px, 7.5vw, 86px); line-height: 0.88; text-transform: uppercase; max-width: 850px; }
        .hero-intro { margin-top: 24px; font-size: 19px; line-height: 1.6; color: #45413b; max-width: 680px; }

        .guides-list-section { padding: 64px 0; }
        .guides-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .guide-card { background: #fffaf2; border: 1px solid rgba(33, 31, 29, 0.14); padding: 32px 28px; display: flex; flex-direction: column; }

        .guide-avatar { width: 100%; aspect-ratio: 4/3; background: #1f4b4c; position: relative; margin-bottom: 24px; overflow: hidden; }
        .avatar-svg { width: 100%; height: 100%; display: block; }
        .badge-placeholder { position: absolute; bottom: 12px; right: 12px; background: rgba(193, 68, 14, 0.85); color: #fffaf2; font-size: 10px; font-weight: 800; padding: 4px 8px; letter-spacing: 0.08em; text-transform: uppercase; }

        .guide-role { font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #c1440e; display: block; margin-bottom: 6px; }
        .guide-name { font-family: var(--font-display), sans-serif; font-size: 30px; text-transform: uppercase; line-height: 1; margin-bottom: 14px; }
        .guide-bio { font-size: 15px; color: #514c45; line-height: 1.6; }

        .placeholder-text { color: #c1440e; font-style: italic; }

        .guides-cta-box { margin-top: 60px; background: #211f1d; color: #fffaf2; padding: 44px 40px; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .guides-cta-box h3 { font-family: var(--font-display), sans-serif; font-size: 34px; text-transform: uppercase; color: #fffaf2; margin: 0; }
        .guides-cta-box p { color: #c9c5bc; font-size: 16px; max-width: 620px; margin: 0; }

        @media (max-width: 900px) {
          .guides-grid { grid-template-columns: 1fr; }
          .guides-cta-box { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
