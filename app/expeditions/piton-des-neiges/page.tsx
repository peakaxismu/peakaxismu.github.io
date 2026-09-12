import Link from 'next/link'

export const metadata = {
  title: 'Piton des Neiges Expedition — Peak Axis',
  description: "Réunion's highest peak, 3,069m — the roof of the Indian Ocean. Expedition recap and interest registration.",
}

export default function PitonDesNeigesPage() {
  return (
    <main className="pdn-page">
      {/* Hero Section */}
      <section className="pdn-hero">
        <div className="wrap">
          <div className="kicker">LA RÉUNION · EXPEDITION RECAP &amp; REGISTER INTEREST</div>
          <h1>Piton des Neiges</h1>
          <p className="hero-subtitle">
            Réunion&apos;s highest peak, 3,069m — the roof of the Indian Ocean.
          </p>
          <div className="hero-intro-line">
            We&apos;ve already stood on top of it. Here&apos;s how it went — and how you can join the next one.
          </div>
        </div>
      </section>

      {/* Recap Stats Block */}
      <section className="recap-stats-section" aria-label="Expedition Recap Statistics">
        <div className="wrap">
          <div className="recap-grid">
            <div className="stat-card">
              <span className="lbl">SUMMIT ELEVATION</span>
              <strong className="val">3,069m</strong>
            </div>
            <div className="stat-card">
              <span className="lbl">ROUTE</span>
              <strong className="val placeholder-text">[e.g. Cilaos → Gîte de Bélouve → summit]</strong>
            </div>
            <div className="stat-card">
              <span className="lbl">DURATION / DEPARTURES</span>
              <strong className="val placeholder-text">[X days] / [X] departure(s) run</strong>
            </div>
            <div className="stat-card">
              <span className="lbl">GROUP SIZE</span>
              <strong className="val placeholder-text">[X] hikers</strong>
            </div>
            <div className="stat-card">
              <span className="lbl">ELEVATION GAIN</span>
              <strong className="val placeholder-text">[X]m</strong>
            </div>
            <div className="stat-card">
              <span className="lbl">LAST DEPARTURE</span>
              <strong className="val placeholder-text">[Month/Year]</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Recap Paragraph & Details */}
      <section className="recap-story-section">
        <div className="wrap">
          <div className="story-content">
            <span className="story-kicker">01 · EXPEDITION RECAP</span>
            <h2>The Roof of the Indian Ocean</h2>
            <p className="recap-body">
              Our first Piton des Neiges expedition took a small group up through Cilaos and onto the exposed ridge line for a night before the final summit push. Sunrise from the top of Réunion — above the cloud line, looking down into the cirques — is one of the most talked-about moments our guests have had with us. <span className="placeholder-inline">[Add 2-3 more sentences on the specific route/experience once details are confirmed.]</span>
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="wrap">
          <div className="gallery-header">
            <span className="gallery-kicker">02 · GALLERY</span>
            <h2>A look back at our Piton des Neiges expedition.</h2>
            <p>Real photos pulled directly from our Instagram trail feeds.</p>
          </div>

          <div className="gallery-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="gallery-card">
                <div className="gallery-visual">
                  <svg viewBox="0 0 100 100" fill="none" className="visual-svg">
                    <rect width="100" height="100" fill="#1F4B4C" />
                    <path d="M10 80 L35 40 L55 65 L75 35 L90 80 Z" fill="#C9B790" opacity="0.4" />
                    <circle cx="75" cy="25" r="8" fill="#C1440E" opacity="0.8" />
                  </svg>
                  <div className="gallery-overlay">
                    <span className="insta-icon">📷</span>
                    <span className="slot-num">Photo slot #{i + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="wrap">
          <div className="testimonial-box">
            <span className="quote-mark">&ldquo;</span>
            <blockquote className="testimonial-quote placeholder-quote">
              &quot;[Guest quote about the expedition — pull from any WhatsApp/email feedback if you have it, or leave blank until first review comes in.]&quot;
            </blockquote>
            <div className="testimonial-author placeholder-author">
              — [Guest name], [Trip date]
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-interest-section">
        <div className="wrap">
          <div className="cta-interest-box">
            <div className="cta-left">
              <span className="kicker-light">REGISTER INTEREST</span>
              <h2>Ran once. Coming back by demand.</h2>
              <p>
                Piton des Neiges isn&apos;t currently on our fixed schedule, but we&apos;re building the next departure around interest. Register below and we&apos;ll be in touch as soon as dates are confirmed.
              </p>
            </div>
            <div className="cta-right">
              <Link href="/enquire?interest=piton_des_neiges" className="btn-primary-ember">
                Register Interest →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-link Box */}
      <section className="crosslink-section">
        <div className="wrap">
          <div className="crosslink-box">
            <div className="crosslink-text">
              <span className="kicker">TWO PEAKS OF RÉUNION</span>
              <h3>Piton de la Fournaise &amp; Piton des Neiges</h3>
              <p>
                Piton de la Fournaise and Piton des Neiges are Réunion&apos;s two iconic summits — an active volcano and the island&apos;s highest point. Ask us about combining both into a single expedition.
              </p>
            </div>
            <div className="crosslink-action">
              <Link href="/expeditions/piton-de-la-fournaise" className="btn-ghost-dark">
                View Piton de la Fournaise →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .pdn-page { background: #f5f1e8; color: #211f1d; min-height: 100vh; padding-bottom: 80px; }

        .pdn-hero { padding: 76px 0 54px; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .kicker, .kicker-light { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; color: #c1440e; text-transform: uppercase; margin-bottom: 16px; display: block; }
        .kicker-light { color: #e8d9b8; }
        .pdn-hero h1 { font-family: var(--font-display), sans-serif; font-size: clamp(52px, 8.5vw, 102px); line-height: 0.86; text-transform: uppercase; }
        .hero-subtitle { margin-top: 20px; font-size: 20px; font-weight: 600; color: #3d3a36; max-width: 680px; }
        .hero-intro-line { margin-top: 18px; font-size: 17px; color: #514c45; max-width: 620px; line-height: 1.6; }

        .recap-stats-section { background: #211f1d; color: #fffaf2; padding: 12px 0; }
        .recap-grid { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid rgba(255, 250, 242, 0.12); }
        .stat-card { padding: 22px 24px; border-right: 1px solid rgba(255, 250, 242, 0.12); border-bottom: 1px solid rgba(255, 250, 242, 0.12); display: flex; flex-direction: column; justify-content: center; }
        .stat-card:nth-child(3n) { border-right: 0; }
        .stat-card .lbl { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #aaa49b; }
        .stat-card .val { margin-top: 8px; font-size: 15px; font-weight: 650; color: #fffaf2; }
        .placeholder-text { color: #e8b082; font-style: italic; font-weight: 500; }

        .recap-story-section { padding: 72px 0; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .story-kicker { color: #c1440e; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }
        .story-content h2 { font-family: var(--font-display), sans-serif; font-size: clamp(38px, 5.5vw, 64px); text-transform: uppercase; line-height: 0.9; margin-bottom: 24px; }
        .recap-body { font-size: 18px; line-height: 1.75; color: #3d3a36; max-width: 800px; }
        .placeholder-inline { color: #c1440e; background: rgba(193, 68, 14, 0.08); padding: 2px 6px; font-style: italic; }

        .gallery-section { padding: 72px 0; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .gallery-kicker { color: #c1440e; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }
        .gallery-header h2 { font-family: var(--font-display), sans-serif; font-size: clamp(34px, 4.8vw, 54px); text-transform: uppercase; }
        .gallery-header p { margin-top: 10px; color: #514c45; font-size: 15.5px; }

        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 36px; }
        .gallery-card { aspect-ratio: 1/1; background: #1f4b4c; position: relative; overflow: hidden; border: 1px solid rgba(33, 31, 29, 0.1); }
        .gallery-visual { width: 100%; height: 100%; position: relative; }
        .visual-svg { width: 100%; height: 100%; display: block; }
        .gallery-overlay { position: absolute; inset: 0; background: rgba(33, 31, 29, 0.35); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #fffaf2; }
        .insta-icon { font-size: 22px; }
        .slot-num { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(33, 31, 29, 0.7); padding: 4px 10px; }

        .testimonial-section { padding: 64px 0; border-bottom: 1px solid rgba(33, 31, 29, 0.14); }
        .testimonial-box { background: #fffaf2; border: 1px solid rgba(33, 31, 29, 0.14); padding: 42px 48px; position: relative; max-width: 860px; margin: 0 auto; text-align: center; }
        .quote-mark { font-family: var(--font-display), sans-serif; font-size: 72px; line-height: 0.5; color: #c1440e; display: block; margin-bottom: 12px; }
        .testimonial-quote { font-size: 18px; line-height: 1.6; color: #3d3a36; margin: 0 auto 16px; font-style: italic; }
        .placeholder-quote { color: #c1440e; background: rgba(193, 68, 14, 0.06); padding: 12px 18px; border: 1px dashed #c1440e; }
        .testimonial-author { font-size: 14px; font-weight: 700; color: #6b665e; }
        .placeholder-author { color: #c1440e; font-style: italic; }

        .cta-interest-section { padding: 72px 0 40px; }
        .cta-interest-box { background: #1f4b4c; color: #fffaf2; padding: 52px 48px; display: flex; justify-content: space-between; align-items: center; gap: 36px; }
        .cta-left h2 { font-family: var(--font-display), sans-serif; font-size: clamp(36px, 5vw, 60px); text-transform: uppercase; line-height: 0.9; margin-bottom: 16px; color: #fffaf2; }
        .cta-left p { color: #d7e4e3; font-size: 16.5px; line-height: 1.65; max-width: 580px; }
        .btn-primary-ember { display: inline-flex; align-items: center; justify-content: center; height: 54px; padding: 0 28px; background: #c1440e; color: #fffaf2; font-size: 15px; font-weight: 700; white-space: nowrap; }
        .btn-primary-ember:hover { background: #a3390b; }

        .crosslink-section { padding: 32px 0 80px; }
        .crosslink-box { background: #fffaf2; border: 1.5px solid rgba(33, 31, 29, 0.16); padding: 38px 42px; display: flex; justify-content: space-between; align-items: center; gap: 32px; }
        .crosslink-text h3 { font-family: var(--font-display), sans-serif; font-size: 32px; text-transform: uppercase; margin-bottom: 10px; }
        .crosslink-text p { color: #514c45; font-size: 15.5px; line-height: 1.6; max-width: 580px; }
        .btn-ghost-dark { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border: 1.5px solid #211f1d; color: #211f1d; font-size: 14px; font-weight: 700; white-space: nowrap; }
        .btn-ghost-dark:hover { background: #211f1d; color: #fffaf2; }

        @media (max-width: 900px) {
          .recap-grid { grid-template-columns: 1fr 1fr; }
          .recap-grid > div:nth-child(3n) { border-right: 1px solid rgba(255, 250, 242, 0.12); }
          .recap-grid > div:nth-child(2n) { border-right: 0; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .cta-interest-box, .crosslink-box { flex-direction: column; align-items: flex-start; padding: 32px 24px; }
        }
        @media (max-width: 560px) {
          .recap-grid { grid-template-columns: 1fr; }
          .recap-grid > div { border-right: 0; }
          .gallery-grid { grid-template-columns: 1fr; }
          .testimonial-box { padding: 28px 20px; }
        }
      `}</style>
    </main>
  )
}
