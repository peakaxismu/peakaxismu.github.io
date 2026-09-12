import Link from 'next/link'

export const metadata = {
  title: 'The Adventure Journal — Peak Axis',
  description: 'Trail notes, gear tips, and stories from Mauritius and La Réunion.',
}

const SUGGESTED_POSTS = [
  {
    id: 'post-1',
    title: 'Piton de la Fournaise vs Piton des Neiges: Which One Should You Hike First?',
    category: 'EXPEDITIONS & VOLCANOES',
    summary: 'A side-by-side breakdown of Réunion’s two famous peaks — comparing trail elevation, technical difficulty, scenery, and preparation required.',
  },
  {
    id: 'post-2',
    title: "A Guide to Mauritius' Best Waterfall Hikes",
    category: 'TRAIL GUIDES',
    summary: 'From Tamarind Falls to hidden gorge cascades — everything you need to know about navigating riverbeds, swim spots, and forest trails safely.',
  },
  {
    id: 'post-3',
    title: 'What to Pack for a Multi-Day Réunion Expedition',
    category: 'GEAR & LOGISTICS',
    summary: 'Essential gear lists for high altitude volcanic terrain, temperature drops, overnight gîte stays, and technical mountain packing.',
  },
  {
    id: 'post-4',
    title: 'Best Time of Year to Hike in Mauritius and La Réunion',
    category: 'WEATHER & SEASONS',
    summary: 'Understanding microclimates, rain windows, wind conditions, and seasonal trail conditions across both islands.',
  },
]

export default function JournalPage() {
  return (
    <div id="view-journal" className="journal-page">
      <section className="journal-hero">
        <div className="wrap">
          <span className="kicker">PEAK AXIS FIELD NOTES</span>
          <h1>The Adventure Journal</h1>
          <p className="hero-sub">
            Trail notes, gear tips, and stories from Mauritius and La Réunion.
          </p>
        </div>
      </section>

      <section className="journal-list-section">
        <div className="wrap">
          <div className="posts-grid">
            {SUGGESTED_POSTS.map((post) => (
              <article key={post.id} className="post-card">
                <div className="card-visual">
                  <svg viewBox="0 0 100 100" fill="none" className="visual-svg">
                    <rect width="100" height="100" fill="#1F4B4C" />
                    <path d="M10 80 L35 40 L55 65 L75 35 L90 80 Z" fill="#C9B790" opacity="0.4" />
                    <circle cx="75" cy="25" r="8" fill="#C1440E" opacity="0.8" />
                  </svg>
                  <span className="post-cat">{post.category}</span>
                </div>

                <div className="post-content">
                  <h2>{post.title}</h2>
                  <p>{post.summary}</p>
                  <div className="post-meta">
                    <span className="coming-soon-badge">ARTICLE COMING SOON</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="journal-cta-box">
            <h3>Want trail updates in your inbox?</h3>
            <p>We publish mountain guides and seasonal weather updates before every departure season.</p>
            <Link href="/enquire" className="btn-primary">Get in touch →</Link>
          </div>
        </div>
      </section>

      <style>{`
        .journal-page { background: #f5f1e8; color: #211f1d; min-height: 80vh; padding-bottom: 80px; }
        .journal-hero { padding: 72px 0 52px; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .kicker { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; display: block; margin-bottom: 16px; }
        .journal-hero h1 { font-family: var(--font-display), sans-serif; font-size: clamp(48px, 7.5vw, 86px); line-height: 0.88; text-transform: uppercase; max-width: 850px; }
        .hero-sub { margin-top: 24px; font-size: 19px; line-height: 1.6; color: #45413b; max-width: 680px; }

        .journal-list-section { padding: 64px 0; }
        .posts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
        .post-card { background: #fffaf2; border: 1px solid rgba(33, 31, 29, 0.14); display: flex; flex-direction: column; overflow: hidden; }

        .card-visual { width: 100%; aspect-ratio: 16/9; background: #1f4b4c; position: relative; }
        .visual-svg { width: 100%; height: 100%; display: block; }
        .post-cat { position: absolute; bottom: 12px; left: 14px; background: rgba(33, 31, 29, 0.85); color: #fffaf2; font-size: 11px; font-weight: 800; padding: 4px 10px; letter-spacing: 0.08em; text-transform: uppercase; }

        .post-content { padding: 28px 24px; display: flex; flex-direction: column; flex: 1; }
        .post-content h2 { font-family: var(--font-display), sans-serif; font-size: 26px; text-transform: uppercase; line-height: 1.1; margin-bottom: 12px; }
        .post-content p { font-size: 15px; color: #514c45; line-height: 1.6; margin-bottom: 20px; }

        .post-meta { margin-top: auto; border-top: 1px solid rgba(33, 31, 29, 0.1); padding-top: 14px; }
        .coming-soon-badge { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #c1440e; background: rgba(193, 68, 14, 0.08); padding: 4px 10px; border: 1px dashed #c1440e; }

        .journal-cta-box { margin-top: 60px; background: #211f1d; color: #fffaf2; padding: 44px 40px; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .journal-cta-box h3 { font-family: var(--font-display), sans-serif; font-size: 34px; text-transform: uppercase; color: #fffaf2; margin: 0; }
        .journal-cta-box p { color: #c9c5bc; font-size: 16px; max-width: 620px; margin: 0; }

        @media (max-width: 900px) {
          .posts-grid { grid-template-columns: 1fr; }
          .journal-cta-box { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
