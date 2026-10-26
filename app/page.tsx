import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HomeClientPillars from '@/components/HomeClientPillars'
import InstagramEmbed from '@/components/InstagramEmbed'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: hikesData },
    { data: scheduledData },
    { data: expedition },
    { data: teamData },
    { data: content },
    { data: settings },
    { data: testimonials },
    { data: instagramPosts },
  ] = await Promise.all([
    supabase.from('hikes').select('id,name,difficulty,duration,location,price,booking_type').eq('status', 'published').order('created_at', { ascending: true }),
    supabase.from('scheduled_hikes').select('id,hike_id,date,price,spots_remaining,spots_total,status').eq('status', 'published').gte('date', today).order('date', { ascending: true }),
    supabase.from('expeditions').select('id,slug,name,destination,duration_days,price_from,next_departure,description').eq('status', 'published').order('created_at', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('team_building_packages').select('id,name,type,description').eq('status', 'published'),
    supabase.from('homepage_content').select('*').eq('id', true).maybeSingle(),
    supabase.from('site_settings').select('instagram_handle,instagram_url').eq('id', true).maybeSingle(),
    supabase.from('testimonials').select('id,quote,name,activity,photo_url,photo_position_x,photo_position_y,photo_zoom').eq('status', 'published').order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(6),
    supabase.from('instagram_posts').select('id,image_url,post_url,embed_code,caption').eq('status', 'published').order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(6),
  ])

  const c = content || {}
  const s = settings || { instagram_handle: 'peak.axis', instagram_url: 'https://www.instagram.com/peak.axis' }
  const reviews = testimonials || []
  const posts = instagramPosts || []

  return (
    <div id="view-home">
      <section className="hero">
        <svg className="contour-svg" viewBox="0 0 600 500" fill="none" aria-hidden="true">
          <path d="M50 400 C150 350, 200 480, 350 420 C500 360, 480 200, 580 150" stroke="#C9B790" strokeWidth="1" opacity=".4" />
          <path d="M20 320 C120 270, 180 390, 310 330 C440 270, 420 120, 550 80" stroke="#C9B790" strokeWidth="1" opacity=".5" />
          <path d="M80 450 C180 400, 220 500, 380 450 C520 400, 510 250, 590 200" stroke="#C1440E" strokeWidth="1.2" opacity=".35" />
          <path d="M150 180 C210 150, 280 210, 360 160 C440 110, 430 30, 490 10" stroke="#1F4B4C" strokeWidth="1.2" opacity=".3" />
        </svg>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="kicker">ADVENTURE WITHOUT BORDERS</span>
            <h1>Three terrains.<br /><span>One way of exploring.</span></h1>
            <p>From Mauritius ridgelines to volcanic crossings in La Réunion, we take you beyond the obvious trail.</p>
            <div className="hero-actions">
              <Link href="/hikes" className="btn-primary">View hikes</Link>
              <Link href="/expeditions/piton-de-la-fournaise" className="btn-ghost">Featured expedition</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-terrain">
        <div className="wrap">
          <div className="terrain-heading">
            <div>
              <span className="terrain-kicker">ADVENTURE WITHOUT BORDERS</span>
              <h2>Three terrains.<br /><span>One way of exploring.</span></h2>
            </div>
            <p>From Mauritius ridgelines to volcanic crossings in La Réunion — we take you beyond the obvious trail.</p>
          </div>

          <div className="terrain-grid">
            <Link href="/hikes" className="terrain-card terrain-mauritius">
              <div className="terrain-overlay">
                <span className="terrain-number">01</span>
                <span className="terrain-place">MAURITIUS</span>
                <h3>Ridge trails</h3>
                <p>Technical ridges, forest climbs and summit days.</p>
                <span className="terrain-link">Explore hikes <span>↗</span></span>
              </div>
            </Link>

            <Link href="/expeditions/piton-de-la-fournaise" className="terrain-card terrain-reunion">
              <div className="terrain-overlay">
                <span className="terrain-number">02</span>
                <span className="terrain-place">LA RÉUNION</span>
                <h3>Active volcanoes</h3>
                <p>Multi-day crossings on some of the world&apos;s wildest terrain.</p>
                <span className="terrain-link">Explore expeditions <span>↗</span></span>
              </div>
            </Link>

            <Link href="/enquire?interest=team" className="terrain-card terrain-team">
              <div className="terrain-overlay">
                <span className="terrain-number">03</span>
                <span className="terrain-place">TEAM TERRAIN</span>
                <h3>Expeditions</h3>
                <p>Outdoor challenges designed around your team.</p>
                <span className="terrain-link">Build your enquiry <span>↗</span></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <HomeClientPillars
        hikes={hikesData || []}
        scheduledHikes={scheduledData || []}
        expedition={expedition || null}
        teamBuilding={teamData || []}
        copy={c}
      />

      {expedition && (
        <section className="feat-band">
          <div className="wrap">
            <div className="band-inner">
              <div className="b-left">
                <span className="eyebrow">{c.featured_expedition_label}</span>
                <h2>{expedition.name}</h2>
                <p>{c.featured_expedition_description}</p>
                <div className="b-stats">
                  <div>
                    <span className="val">{expedition.duration_days} Days</span>
                    <span className="lbl">{c.featured_expedition_duration_label}</span>
                  </div>
                  <div>
                    <span className="val">{expedition.next_departure || 'On request'}</span>
                    <span className="lbl">{c.featured_expedition_departure_label}</span>
                  </div>
                </div>
              </div>
              <div className="b-right">
                <div className="price-tag">From {expedition.price_from}</div>
                <Link href={`/expeditions/${expedition.slug}`} className="btn-ember">
                  {c.featured_expedition_cta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="testimonials-strip">
          <div className="wrap">
            <div className="strip-head">
              <span className="kicker">{c.testimonials_kicker}</span>
              <h2>{c.testimonials_title}</h2>
              <p className="strip-sub">{c.testimonials_subtitle}</p>
            </div>
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="quote-mark">“</div>
                  <p className="quote-body">{review.quote}</p>
                  <div className="review-meta">
                    {review.photo_url && (
                      <div className="review-photo">
                        <img src={review.photo_url} alt="" style={{ objectPosition: `${review.photo_position_x ?? 50}% ${review.photo_position_y ?? 30}%`, transform: `scale(${review.photo_zoom ?? 1})` }} />
                      </div>
                    )}
                    <div>
                      <strong className="author">{review.name}</strong>
                      <span className="hike-tag">{review.activity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="positioning">
        <div className="wrap">
          <div className="pos-inner">
            <h2>
              {c.positioning_title}
              <br />
              {c.positioning_prefix} <span className="em">{c.positioning_emphasis}</span>.
            </h2>
            <div className="pos-grid pos-grid-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="pos-card" key={`pos-${index}`}>
                  <div className="num">0{index + 1}</div>
                  <h3>{c[`why_${index + 1}_title`]}</h3>
                  <p>{c[`why_${index + 1}_body`]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="instagram-section">
        <div className="wrap">
          <div className="insta-head">
            <span className="kicker">{c.instagram_kicker}</span>
            <h2>
              {c.instagram_title_prefix} <a href={s.instagram_url} target="_blank" rel="noreferrer">@{s.instagram_handle}</a>
            </h2>
            <p className="insta-sub">{c.instagram_subtitle}</p>
          </div>

          {posts.length > 0 ? (
            <div className="insta-embeds">
              {posts.map((post) => (
                <div key={post.id} className="insta-card">
                  <InstagramEmbed url={post.post_url} />
                  {post.caption && <p className="insta-caption">{post.caption}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="insta-empty">
              <p>Add your latest Instagram posts from Admin > Site Content to display them here.</p>
              <a href={s.instagram_url} target="_blank" rel="noreferrer" className="btn-ghost">Follow @{s.instagram_handle}</a>
            </div>
          )}
        </div>
      </section>

      <section className="cta-banner">
        <div className="wrap">
          <div className="banner-box">
            <h2>{c.cta_title}</h2>
            <p>{c.cta_body}</p>
            <Link href={c.cta_url || '/enquire'} className="btn-primary">{c.cta_button}</Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          position: relative; overflow: hidden; background: #f5f1e8; padding: 76px 0 0; min-height: 420px;
        }
        .contour-svg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .9; }
        .hero-inner { position: relative; z-index: 1; }
        .hero-copy { max-width: 620px; padding: 32px 0 72px; }
        .kicker, .terrain-kicker { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: .12em; display: block; margin-bottom: 16px; }
        .hero-copy h1, .terrain-heading h2, .cta-banner h2, .insta-head h2 { font-family: var(--font-display), sans-serif; font-size: clamp(52px, 8vw, 96px); line-height: .88; text-transform: uppercase; margin: 0; }
        .hero-copy p, .terrain-heading p { color: #514c45; font-size: 18px; line-height: 1.7; margin-top: 22px; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 28px; }
        .btn-primary, .btn-ghost, .btn-ember {
          display: inline-flex; align-items: center; justify-content: center; border: 1px solid #211f1d; padding: 14px 22px; font-weight: 700; text-decoration: none; transition: .2s ease;
        }
        .btn-primary { background: #211f1d; color: #fffaf2; }
        .btn-ghost { background: transparent; color: #211f1d; }
        .btn-ember { background: #c1440e; color: #fffaf2; border-color: #c1440e; }
        .intro-terrain { padding: 72px 0 84px; background: #f5f1e8; border-top: 1px solid rgba(33,31,29,.14); border-bottom: 1px solid rgba(33,31,29,.14); }
        .terrain-heading { display: grid; grid-template-columns: 1.1fr .9fr; gap: 56px; align-items: end; }
        .terrain-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 28px; }
        .terrain-card { position: relative; display: block; min-height: 390px; background: #211f1d; color: #fffaf2; overflow: hidden; border: 1px solid rgba(33,31,29,.08); text-decoration: none; }
        .terrain-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(23,56,56,0.15), rgba(17,16,15,0.45)); }
        .terrain-card:nth-child(1) { background: #173838; }
        .terrain-card:nth-child(2) { background: #0f2626; }
        .terrain-card:nth-child(3) { background: #1f4b4c; }
        .terrain-overlay { position: absolute; inset: 0; padding: 28px 26px 25px; display: flex; flex-direction: column; justify-content: flex-end; z-index: 1; }
        .terrain-number { display: block; font-size: 22px; font-weight: 700; }
        .terrain-place { display: block; margin-top: 12px; font-size: 12px; letter-spacing: .12em; }
        .terrain-card h3 { margin: 14px 0 0; font-size: clamp(26px, 3vw, 38px); }
        .terrain-card p { margin: 14px 0 0; font-size: 16px; line-height: 1.5; color: #d7d1ca; }
        .terrain-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 18px; font-weight: 700; }
        .feat-band { padding: 0 0 72px; background: #f5f1e8; }
        .band-inner { display: grid; grid-template-columns: 1.2fr .8fr; gap: 40px; background: #211f1d; color: #fffaf2; padding: 36px 28px; }
        .eyebrow { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: .12em; display: block; margin-bottom: 24px; }
        .band-inner h2 { margin: 0; font-size: clamp(32px, 4vw, 56px); text-transform: uppercase; }
        .band-inner p { color: #d7d1ca; font-size: 17px; line-height: 1.7; margin: 18px 0 0; }
        .b-stats { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 24px; }
        .b-stats > div { min-width: 140px; display: flex; flex-direction: column; }
        .b-stats .val { font-size: 24px; font-weight: 700; }
        .b-stats .lbl { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #aaa29a; }
        .b-right { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 18px; }
        .price-tag { font-size: 34px; font-weight: 700; }
        .testimonials-strip { padding: 0 0 72px; background: #f5f1e8; }
        .strip-head { margin-bottom: 24px; }
        .strip-head h2 { margin: 0; font-size: clamp(32px, 4vw, 54px); text-transform: uppercase; }
        .strip-sub { margin-top: 12px; color: #514c45; }
        .reviews-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .review-card { background: #fffaf2; border: 1px solid rgba(33,31,29,.12); padding: 26px 22px; display: flex; flex-direction: column; }
        .quote-mark { font-size: 48px; color: #c1440e; line-height: .8; }
        .quote-body { font-size: 18px; line-height: 1.7; color: #3d3a36; margin-top: 8px; }
        .review-meta { display: flex; gap: 12px; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(33,31,29,.12); }
        .review-photo { width: 54px; height: 54px; border-radius: 50%; overflow: hidden; background: #e9e2d6; }
        .review-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .author { display: block; font-size: 15px; }
        .hike-tag { display: block; font-size: 12px; color: #6b665e; }
        .positioning { padding: 0 0 72px; background: #f5f1e8; }
        .pos-inner { background: #fffaf2; border: 1px solid rgba(33,31,29,.12); padding: 32px 28px; }
        .pos-inner h2 { margin: 0 0 24px; font-size: clamp(36px, 5vw, 62px); text-transform: uppercase; }
        .em { color: #c1440e; }
        .pos-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .pos-card { border: 1px solid rgba(33,31,29,.12); background: #f7f1e6; padding: 18px 16px; }
        .pos-card .num { font-size: 28px; font-weight: 700; color: #c1440e; }
        .pos-card h3 { margin: 14px 0 0; font-size: 18px; text-transform: uppercase; }
        .pos-card p { margin: 10px 0 0; color: #514c45; line-height: 1.6; }
        .instagram-section { padding: 0 0 72px; background: #f5f1e8; }
        .insta-head h2 { font-size: clamp(34px, 4vw, 54px); }
        .insta-head a { color: #c1440e; text-decoration: none; }
        .insta-sub { color: #514c45; margin-top: 12px; }
        .insta-embeds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
        .insta-card { background: #fffaf2; border: 1px solid rgba(33,31,29,.12); padding: 12px; }
        .insta-caption { margin: 12px 0 0; color: #514c45; line-height: 1.5; }
        .insta-empty { margin-top: 24px; background: #fffaf2; border: 1px dashed rgba(33,31,29,.35); padding: 24px; }
        .cta-banner { padding: 0 0 72px; background: #f5f1e8; }
        .banner-box { background: #1f4b4c; color: #fffaf2; padding: 42px 36px; display: flex; justify-content: space-between; gap: 24px; align-items: center; }
        .banner-box h2 { margin: 0; font-size: clamp(30px, 4vw, 52px); }
        .banner-box p { margin: 0; color: #dfe7e8; max-width: 560px; }
        @media (max-width: 900px) {
          .terrain-heading, .band-inner, .banner-box { grid-template-columns: 1fr; display: grid; }
          .terrain-grid, .reviews-grid, .pos-grid, .insta-embeds { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .terrain-grid, .reviews-grid, .pos-grid, .insta-embeds { grid-template-columns: 1fr; }
          .hero-copy h1, .terrain-heading h2 { font-size: clamp(36px, 10vw, 56px); }
          .banner-box { padding: 28px 20px; }
        }
      `}</style>
    </div>
  )
}
