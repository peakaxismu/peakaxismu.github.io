import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HomeClientPillars from '@/components/HomeClientPillars'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  const { data: hikesData } = await supabase
    .from('hikes')
    .select('id, name, difficulty, date, duration, location, price, spots_remaining')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  const { data: expData } = await supabase
    .from('expeditions')
    .select('id, slug, name, destination, duration_days, price_from, next_departure, description')
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: teamData } = await supabase
    .from('team_building_packages')
    .select('id, name, type, description')
    .eq('status', 'published')

  const hikes = hikesData || []
  const expedition = expData || null
  const teamBuilding = teamData || []

  const reviews = [
    {
      id: 'rev-1',
      quote: '"[Quote — e.g. An incredible experience crossing the ridge line with guides who knew every step of the terrain.]"',
      name: '[Name]',
      hikeName: '[Hike name]',
    },
    {
      id: 'rev-2',
      quote: '"[Quote — e.g. Zero fluff, precise briefings, and a amazing group atmosphere from start to summit.]"',
      name: '[Name]',
      hikeName: '[Hike name]',
    },
    {
      id: 'rev-3',
      quote: '"[Quote — e.g. Swimming in the gorge pools after a 3-hour hike was the highlight of our Mauritius trip.]"',
      name: '[Name]',
      hikeName: '[Hike name]',
    },
  ]

  return (
    <div id="view-home">
      <section className="hero">
        <svg className="contour-svg" viewBox="0 0 600 500" fill="none" aria-hidden="true">
          <path d="M50 400 C150 350, 200 480, 350 420 C500 360, 480 200, 580 150" stroke="#C9B790" strokeWidth="1" opacity="0.4" />
          <path d="M20 320 C120 270, 180 390, 310 330 C440 270, 420 120, 550 80" stroke="#C9B790" strokeWidth="1" opacity="0.5" />
          <path d="M80 450 C180 400, 220 500, 380 450 C520 400, 510 250, 590 200" stroke="#C1440E" strokeWidth="1.2" opacity="0.35" />
          <path d="M100 250 C170 210, 240 290, 340 230 C440 170, 410 60, 520 20" stroke="#C9B790" strokeWidth="1" opacity="0.4" />
          <path d="M150 180 C210 150, 280 210, 360 160 C440 110, 430 30, 490 10" stroke="#1F4B4C" strokeWidth="1.2" opacity="0.3" />
        </svg>

        <div className="wrap">
          <div className="hero-inner">
            <h1>
              Adventure <span className="em">without</span>
              <br />
              borders.
            </h1>
            <p className="hero-sub">
              Mauritius ridge trails, active volcano treks in La Réunion, and team expeditions built around real terrain.
            </p>
            <div className="hero-ctas">
              <Link href="/hikes" className="btn-primary">View upcoming hikes</Link>
              <Link href="/expeditions/piton-de-la-fournaise" className="btn-ghost">Featured expedition</Link>
            </div>
            <div className="elev-marks">
              <div className="elev-mark"><div className="num">828m</div><div className="lbl">Highest peak (Mauritius)</div></div>
              <div className="elev-mark"><div className="num">2,632m</div><div className="lbl">Volcano rim (Réunion)</div></div>
              <div className="elev-mark"><div className="num">01</div><div className="lbl">Single point of contact</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro">
        <div className="wrap"><div className="intro-inner">
          <h2>From island trails to island volcanoes.</h2>
          <p>Peak Axis operates between Mauritius and La Réunion. We run weekly group hikes, multi-day crater treks, and corporate team days — designed for people who want terrain, not tourist walk-throughs.</p>
        </div></div>
      </section>

      <HomeClientPillars hikes={hikes} expedition={expedition} teamBuilding={teamBuilding} />

      {expedition && (
        <section className="feat-band">
          <div className="wrap"><div className="band-inner">
            <div className="b-left">
              <span className="eyebrow">FEATURED EXPEDITION · LA RÉUNION</span>
              <h2>{expedition.name}</h2>
              <p>A 3-day trek across the Plaine des Sables and into the active Enclos Fouqué caldera. Small group, certified guide, full mountain logistics included.</p>
              <div className="b-stats">
                <div><span className="val">2,632m</span><span className="lbl">Summit elev.</span></div>
                <div><span className="val">{expedition.duration_days} Days</span><span className="lbl">Duration</span></div>
                <div><span className="val">{expedition.next_departure || 'On request'}</span><span className="lbl">Next departure</span></div>
              </div>
            </div>
            <div className="b-right">
              <div className="price-tag">From {expedition.price_from}</div>
              <Link href={`/expeditions/${expedition.slug}`} className="btn-ember">View itinerary &amp; details</Link>
            </div>
          </div></div>
        </section>
      )}

      {/* Testimonials Strip */}
      <section className="testimonials-strip">
        <div className="wrap">
          <div className="strip-head">
            <span className="kicker">TESTIMONIALS</span>
            <h2>What our hikers say</h2>
            <p className="strip-sub">Real feedback from recent hikes and expeditions across Mauritius and Réunion.</p>
          </div>

          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="quote-mark">&ldquo;</div>
                <p className="quote-body placeholder-text">{rev.quote}</p>
                <div className="review-meta">
                  <strong className="author placeholder-text">{rev.name}</strong>
                  <span className="hike-tag placeholder-text">{rev.hikeName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning Section with 4 Why Us Tiles */}
      <section className="positioning">
        <div className="wrap"><div className="pos-inner">
          <h2>You&apos;re not just here for a hike.<br />You&apos;re here to go <span className="em">further</span>.</h2>
          <div className="pos-grid pos-grid-4">
            <div className="pos-card"><div className="num">01</div><h3>Small, fixed groups</h3><p>We cap numbers so every group moves cleanly, stays safe, and leaves minimal trace on the mountain.</p></div>
            <div className="pos-card"><div className="num">02</div><h3>Real mountain leadership</h3><p>Guides who know the weather windows, the unmarked ridge paths, and how to pace a group over hours.</p></div>
            <div className="pos-card"><div className="num">03</div><h3>Zero fluff logistics</h3><p>Clear briefings, exact gear lists, straight pricing. You know what you&apos;re getting before you lace up.</p></div>
            <div className="pos-card"><div className="num">04</div><h3>Safety first, always</h3><p>Every guide is briefed on weather windows, terrain risk, and emergency protocol before a single boot hits the trail. <span className="placeholder-inline">[Add specific certifications once confirmed — first aid, mountain guide licensing, etc.]</span></p></div>
          </div>
        </div></div>
      </section>

      {/* Instagram Feed Section */}
      <section className="instagram-section">
        <div className="wrap">
          <div className="insta-head">
            <span className="kicker">INSTAGRAM TRAIL FEED</span>
            <h2>Follow the trail — <span className="placeholder-text">@[your_instagram_handle]</span></h2>
            <p className="insta-sub">Real moments from real hikes. Tag us in yours.</p>
          </div>

          <div className="insta-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-post"
              >
                <svg viewBox="0 0 100 100" fill="none" className="insta-svg">
                  <rect width="100" height="100" fill="#1F4B4C" />
                  <path d="M10 80 L35 40 L55 65 L75 35 L90 80 Z" fill="#C9B790" opacity="0.4" />
                  <circle cx="75" cy="25" r="8" fill="#C1440E" opacity="0.8" />
                </svg>
                <div className="insta-overlay">
                  <span>📷 @[your_instagram_handle]</span>
                  <small>View on Instagram ↗</small>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="wrap"><div className="banner-box">
          <h2>Ready for your next adventure?</h2>
          <p>Tell us what you&apos;re planning — whether it&apos;s a solo spot on a weekend hike or an expedition for your team.</p>
          <Link href="/enquire" className="btn-primary">Get in touch</Link>
        </div></div>
      </section>

      <style>{`
        .testimonials-strip { padding: 70px 0; background: #fffaf2; border-top: 1px solid var(--sand-line); border-bottom: 1px solid var(--sand-line); }
        .strip-head { margin-bottom: 38px; }
        .strip-head .kicker { color: var(--ember); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 10px; }
        .strip-head h2 { font-size: clamp(32px, 5vw, 54px); }
        .strip-sub { margin-top: 8px; color: #514c45; font-size: 16px; }

        .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .review-card { background: var(--ash); border: 1px solid var(--sand-line); padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
        .review-card .quote-mark { font-family: var(--font-display), sans-serif; font-size: 54px; line-height: 0.5; color: var(--ember); margin-bottom: 12px; }
        .quote-body { font-size: 15px; line-height: 1.6; color: #3d3a36; font-style: italic; margin-bottom: 20px; }
        .review-meta { border-top: 1px solid var(--sand-line); padding-top: 14px; display: flex; flex-direction: column; gap: 2px; }
        .review-meta .author { font-size: 14px; color: var(--ink); }
        .review-meta .hike-tag { font-size: 12.5px; color: #6b675f; }

        .pos-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 40px; }
        .placeholder-inline { color: var(--ember); background: rgba(193,68,14,0.08); padding: 2px 6px; font-style: italic; }

        .instagram-section { padding: 76px 0; border-top: 1px solid var(--sand-line); background: #f5f1e8; }
        .insta-head { margin-bottom: 38px; }
        .insta-head .kicker { color: var(--ember); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 10px; }
        .insta-head h2 { font-size: clamp(30px, 4.5vw, 50px); }
        .insta-sub { margin-top: 8px; color: #514c45; font-size: 16px; }

        .insta-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .insta-post { aspect-ratio: 1/1; background: var(--teal); position: relative; overflow: hidden; display: block; border: 1px solid var(--sand-line); }
        .insta-svg { width: 100%; height: 100%; display: block; }
        .insta-overlay { position: absolute; inset: 0; background: rgba(33,31,29,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--warm-white); opacity: 0; transition: opacity 0.2s ease; padding: 12px; text-align: center; }
        .insta-post:hover .insta-overlay { opacity: 1; }
        .insta-overlay span { font-size: 11px; font-weight: 700; }
        .insta-overlay small { font-size: 10px; color: var(--sand); text-transform: uppercase; letter-spacing: 0.05em; }

        .placeholder-text { color: var(--ember); font-style: italic; }

        @media (max-width: 960px) {
          .reviews-grid { grid-template-columns: 1fr; }
          .pos-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .insta-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 560px) {
          .pos-grid-4 { grid-template-columns: 1fr; }
          .insta-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  )
}
