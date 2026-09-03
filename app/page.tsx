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
    .single()

  const { data: teamData } = await supabase
    .from('team_building_packages')
    .select('id, name, type, description')
    .eq('status', 'published')

  const hikes = hikesData || []
  const expedition = expData || null
  const teamBuilding = teamData || []

  return (
    <div id="view-home">
      {/* Hero Section */}
      <section className="hero">
        <svg className="contour-svg" viewBox="0 0 600 500" fill="none">
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
              <Link href="/hikes" className="btn-primary">
                View upcoming hikes
              </Link>
              <Link href="/expeditions/piton-de-la-fournaise" className="btn-ghost">
                Featured expedition
              </Link>
            </div>
            <div className="elev-marks">
              <div className="elev-mark">
                <div className="num">828m</div>
                <div className="lbl">Highest peak (Mauritius)</div>
              </div>
              <div className="elev-mark">
                <div className="num">2,632m</div>
                <div className="lbl">Volcano rim (Réunion)</div>
              </div>
              <div className="elev-mark">
                <div className="num">01</div>
                <div className="lbl">Single point of contact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro">
        <div className="wrap">
          <div className="intro-inner">
            <h2>From island trails to island volcanoes.</h2>
            <p>
              Peak Axis operates between Mauritius and La Réunion. We run weekly group hikes, multi-day crater treks, and corporate team days — designed for people who want terrain, not tourist walk-throughs.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <HomeClientPillars hikes={hikes} expedition={expedition} teamBuilding={teamBuilding} />

      {/* Featured Expedition Band */}
      {expedition && (
        <section className="feat-band">
          <div className="wrap">
            <div className="band-inner">
              <div className="b-left">
                <span className="eyebrow">FEATURED EXPEDITION · LA RÉUNION</span>
                <h2>Piton de la Fournaise</h2>
                <p>
                  A 3-day trek across the Plaine des Sables and into the active Enclos Fouqué caldera. Small group, certified guide, full mountain logistics included.
                </p>
                <div className="b-stats">
                  <div>
                    <span className="val">2,632m</span>
                    <span className="lbl">Summit elev.</span>
                  </div>
                  <div>
                    <span className="val">3 Days</span>
                    <span className="lbl">Duration</span>
                  </div>
                  <div>
                    <span className="val">{expedition.next_departure}</span>
                    <span className="lbl">Next departure</span>
                  </div>
                </div>
              </div>
              <div className="b-right">
                <div className="price-tag">From {expedition.price_from}</div>
                <Link href={`/expeditions/${expedition.slug}`} className="btn-ember">
                  View itinerary & details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Positioning Section */}
      <section className="positioning">
        <div className="wrap">
          <div className="pos-inner">
            <h2>
              You&apos;re not just here for a hike.
              <br />
              You&apos;re here to go <span className="em">further</span>.
            </h2>
            <div className="pos-grid">
              <div className="pos-card">
                <div className="num">01</div>
                <h3>Small, fixed groups</h3>
                <p>We cap numbers so every group moves cleanly, stays safe, and leaves minimal trace on the mountain.</p>
              </div>
              <div className="pos-card">
                <div className="num">02</div>
                <h3>Real mountain leadership</h3>
                <p>Guides who know the weather windows, the unmarked ridge paths, and how to pace a group over hours.</p>
              </div>
              <div className="pos-card">
                <div className="num">03</div>
                <h3>Zero fluff logistics</h3>
                <p>Clear briefings, exact gear lists, straight pricing. You know what you&apos;re getting before you lace up.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Callout Banner */}
      <section className="cta-banner">
        <div className="wrap">
          <div className="banner-box">
            <h3 className="display">Ready for your next adventure?</h3>
            <p>Tell us what you&apos;re planning — whether it&apos;s a solo spot on a weekend hike or an expedition for your team.</p>
            <Link href="/enquire" className="btn-primary">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
