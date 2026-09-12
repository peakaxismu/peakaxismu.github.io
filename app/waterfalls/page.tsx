import Link from 'next/link'

export const metadata = {
  title: 'Waterfall Hikes — Peak Axis',
  description: "Guided waterfall hikes through Mauritius' gorges and forest trails — swim spots, cliffside views, and routes most visitors never find.",
}

const WATERFALL_HIKES = [
  {
    id: 'wf-1',
    name: '[Waterfall Hike Name — e.g. Tamarind Falls]',
    location: '[Region]',
    duration: '3 hrs',
    price: 'From Rs [XXXX] pp',
    status: 'ON DEMAND',
    shortLine: 'A half-day trek to seven linked cascades, with a swim stop at the base pool.',
    refQuery: 'Tamarind Falls / Waterfall Hike 1',
  },
  {
    id: 'wf-2',
    name: '[Waterfall Hike Name]',
    location: '[Region]',
    duration: '2.5 hrs',
    price: 'From Rs [XXXX] pp',
    status: 'ON DEMAND',
    shortLine: 'A shorter forest walk ending at a single-drop waterfall, good for families and first-timers.',
    refQuery: 'Waterfall Hike 2',
  },
  {
    id: 'wf-3',
    name: '[Waterfall Hike Name]',
    location: '[Region]',
    duration: '4 hrs',
    price: 'From Rs [XXXX] pp',
    status: 'ON DEMAND',
    shortLine: 'The longer route — multiple cascades, a ridge viewpoint, and a swim at the final pool.',
    refQuery: 'Waterfall Hike 3',
  },
]

export default function WaterfallsPage() {
  return (
    <div id="view-waterfalls" className="waterfalls-page">
      <section className="hero-section">
        <div className="wrap">
          <div className="kicker">MAURITIUS · GUIDED WATERFALL TREKS</div>
          <h1>Chase water where the mountains break.</h1>
          <p className="hero-subtitle">
            Guided waterfall hikes through Mauritius&apos; gorges and forest trails — swim spots, cliffside views, and routes most visitors never find.
          </p>
        </div>
      </section>

      <section className="intro-section">
        <div className="wrap">
          <div className="intro-box">
            <h2>Off the road, into the gorges.</h2>
            <p>
              Mauritius hides some of its best scenery behind a wall of forest. Our waterfall hikes take you off the road and down into the gorges — past cascades, natural pools, and viewpoints that don&apos;t show up on a map. Most routes are half-day, suitable for reasonably fit hikers, no technical climbing required.
            </p>
          </div>
        </div>
      </section>

      <section className="cards-section">
        <div className="wrap">
          <div className="section-head">
            <h2>Available Waterfall Routes</h2>
            <p>All waterfall hikes operate on-demand for private groups or scheduled request dates.</p>
          </div>

          <div className="cards-grid">
            {WATERFALL_HIKES.map((hike) => (
              <article key={hike.id} className="hike-card">
                <div className="card-top">
                  <span className="status-badge">{hike.status}</span>
                  <span className="location-tag placeholder-badge">{hike.location}</span>
                </div>
                <h3 className="card-title placeholder-text-highlight">{hike.name}</h3>
                <p className="card-desc">{hike.shortLine}</p>

                <div className="card-details">
                  <div className="detail-item">
                    <span className="lbl">Duration</span>
                    <strong className="val">{hike.duration}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="lbl">Price</span>
                    <strong className="val placeholder-text-highlight">{hike.price}</strong>
                  </div>
                </div>

                <div className="card-cta">
                  <Link
                    href={`/enquire?interest=private_hike&ref=${encodeURIComponent(hike.name)}`}
                    className="btn-primary card-btn"
                  >
                    Book this route →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="cta-dual-box">
            <div className="dual-info">
              <h3>Looking for scheduled group dates or custom routes?</h3>
              <p>Join an upcoming scheduled group hike or customize a private waterfall adventure for your group.</p>
            </div>
            <div className="dual-actions">
              <Link href="/hikes" className="btn-secondary">
                View all scheduled hikes
              </Link>
              <Link href="/enquire?interest=private_hike&ref=Custom%20Waterfall%20Hike" className="btn-primary">
                Book a private hike
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .waterfalls-page { background: #f5f1e8; color: #211f1d; min-height: 80vh; padding-bottom: 80px; }
        .hero-section { padding: 72px 0 52px; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .kicker { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; margin-bottom: 16px; }
        .hero-section h1 { font-family: var(--font-display), sans-serif; font-size: clamp(48px, 7.5vw, 88px); line-height: 0.88; text-transform: uppercase; max-width: 900px; }
        .hero-subtitle { margin-top: 24px; font-size: 19px; line-height: 1.6; color: #45413b; max-width: 680px; }

        .intro-section { padding: 56px 0; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .intro-box h2 { font-family: var(--font-display), sans-serif; font-size: clamp(32px, 4.5vw, 48px); text-transform: uppercase; margin-bottom: 16px; }
        .intro-box p { font-size: 17.5px; line-height: 1.7; color: #3d3a36; max-width: 820px; }

        .cards-section { padding: 64px 0 20px; }
        .section-head { margin-bottom: 40px; }
        .section-head h2 { font-family: var(--font-display), sans-serif; font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; }
        .section-head p { margin-top: 10px; color: #514c45; font-size: 16px; }

        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hike-card { background: #fffaf2; border: 1px solid rgba(33, 31, 29, 0.14); padding: 30px 26px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
        .card-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 18px; }
        .status-badge { background: #1f4b4c; color: #fffaf2; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; text-transform: uppercase; }
        .location-tag { font-size: 12px; font-weight: 700; color: #6b665e; }
        .placeholder-badge { background: rgba(193, 68, 14, 0.08); border: 1px dashed #c1440e; color: #c1440e; padding: 2px 8px; font-family: monospace; }
        .placeholder-text-highlight { color: #c1440e; font-style: italic; }

        .card-title { font-family: var(--font-display), sans-serif; font-size: 28px; line-height: 1.05; text-transform: uppercase; margin-bottom: 14px; min-height: 58px; }
        .card-desc { font-size: 14.5px; color: #514c45; line-height: 1.6; margin-bottom: 24px; }

        .card-details { display: flex; justify-content: space-between; border-top: 1px solid rgba(33, 31, 29, 0.1); border-bottom: 1px solid rgba(33, 31, 29, 0.1); padding: 14px 0; margin-bottom: 24px; }
        .detail-item { display: flex; flex-direction: column; }
        .detail-item .lbl { font-size: 11px; font-weight: 700; color: #6b665e; text-transform: uppercase; letter-spacing: 0.06em; }
        .detail-item .val { font-size: 14.5px; font-weight: 700; color: #211f1d; margin-top: 2px; }

        .card-cta { margin-top: auto; }
        .card-btn { display: block; text-align: center; width: 100%; padding: 12px 18px; font-size: 14px; font-weight: 700; background: #c1440e; color: #fffaf2; }
        .card-btn:hover { background: #a3390b; }

        .cta-dual-box { margin-top: 56px; background: #211f1d; color: #fffaf2; padding: 42px 40px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap; }
        .dual-info h3 { font-family: var(--font-display), sans-serif; font-size: 32px; text-transform: uppercase; margin-bottom: 10px; color: #fffaf2; }
        .dual-info p { color: #c9c5bc; font-size: 15.5px; max-width: 520px; }
        .dual-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-secondary { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border: 1.5px solid #fffaf2; color: #fffaf2; font-size: 14px; font-weight: 700; }
        .btn-secondary:hover { background: #fffaf2; color: #211f1d; }

        @media (max-width: 960px) {
          .cards-grid { grid-template-columns: 1fr; }
          .card-title { min-height: 0; }
          .cta-dual-box { flex-direction: column; align-items: flex-start; padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
