import Link from 'next/link'

export const metadata = {
  title: 'Camping — Peak Axis',
  description: 'Camping experiences in Mauritius — a separate outdoor activity from guided hikes.',
}

const campingOptions = [
  {
    title: 'Forest Camping',
    line: 'A quiet overnight base close to the mountains and forest trails.',
    detail: 'Overnight · Guided',
  },
  {
    title: 'Mountain Camping',
    line: 'Sleep higher, wake to the landscape, and build the route around your group.',
    detail: 'Overnight · Small group',
  },
  {
    title: 'Private Camp',
    line: 'A flexible camping setup for your own group, dates, and preferred setting.',
    detail: 'Private · On request',
  },
]

export default function CampingPage() {
  return (
    <div className="camping-page">
      <section className="camping-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap camping-hero-inner">
          <div className="kicker">MAURITIUS · OUTDOOR CAMPING</div>
          <h1>Stay outside.<br />Go deeper.</h1>
          <p>Camping is now its own Peak Axis experience — separate from hikes, with overnight routes and private camp options developed around the season.</p>
          <Link href="/enquire?interest=camping" className="btn-primary">Plan a camping trip →</Link>
        </div>
      </section>

      <section className="camping-intro">
        <div className="wrap camping-intro-grid">
          <div>
            <span>01</span>
            <h2>Choose the setting</h2>
            <p>Forest, mountain, or a private camp built around your group.</p>
          </div>
          <div>
            <span>02</span>
            <h2>Build the night</h2>
            <p>Combine an overnight stay with the outdoor activities that fit your plans.</p>
          </div>
          <div>
            <span>03</span>
            <h2>Ask for dates</h2>
            <p>Camping availability and routes are handled on request while the programme is being developed.</p>
          </div>
        </div>
      </section>

      <section className="camping-options">
        <div className="wrap">
          <div className="section-head">
            <div className="kicker">CAMPING EXPERIENCES</div>
            <h2>Pick your kind of night.</h2>
            <p>These are separate camping experiences, not hike listings.</p>
          </div>
          <div className="camping-cards">
            {campingOptions.map((option) => (
              <article className="camp-card" key={option.title}>
                <div className="camp-number">0{campingOptions.indexOf(option) + 1}</div>
                <div>
                  <span className="camp-detail">{option.detail}</span>
                  <h3>{option.title}</h3>
                  <p>{option.line}</p>
                </div>
                <Link href={`/enquire?interest=camping&ref=${encodeURIComponent(option.title)}`} className="detail-link">
                  Ask about this camp →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="camping-cta">
        <div className="wrap">
          <h2>Have a place in mind?</h2>
          <p>Tell us your dates, group size, and the kind of outdoor night you want. We can shape the camping plan around that.</p>
          <Link href="/enquire?interest=camping" className="btn-secondary">Enquire about camping</Link>
        </div>
      </section>

      <style>{`
        .camping-page{background:#f5f1e8;color:#211f1d;min-height:80vh}
        .camping-hero{position:relative;overflow:hidden;background:#102b2b;color:#fffaf2;padding:100px 0 90px;min-height:520px;display:flex;align-items:center}
        .camping-hero:after{content:"";position:absolute;left:-8%;right:-8%;bottom:-150px;height:300px;background:#0b2020;border-radius:50% 50% 0 0/35% 35% 0 0}
        .hero-glow{position:absolute;width:420px;height:420px;right:12%;top:4%;border-radius:50%;background:radial-gradient(circle,rgba(201,183,144,.28),rgba(201,183,144,0) 68%)}
        .camping-hero-inner{position:relative;z-index:1}
        .kicker{color:#c1440e;font-size:12px;font-weight:800;letter-spacing:.12em;margin-bottom:16px}
        .camping-hero h1{font-family:var(--font-display),sans-serif;font-size:clamp(54px,8vw,96px);line-height:.86;text-transform:uppercase;max-width:850px;color:#fffaf2}
        .camping-hero p{margin:26px 0 26px;font-size:18px;line-height:1.6;color:#c9c5bc;max-width:680px}
        .camping-hero .btn-primary{display:inline-flex}
        .camping-intro{padding:58px 0 30px}
        .camping-intro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--sand-line);border:1px solid var(--sand-line)}
        .camping-intro-grid>div{background:#fffaf2;padding:26px}
        .camping-intro-grid span{display:block;color:#c1440e;font:800 12px/1 var(--font-display),sans-serif;letter-spacing:.12em;margin-bottom:18px}
        .camping-intro-grid h2{font:700 21px/1.05 var(--font-display),sans-serif;text-transform:uppercase}
        .camping-intro-grid p{margin:10px 0 0;color:#5a564f;font-size:13.5px;line-height:1.55}
        .camping-options{padding:42px 0 78px}
        .section-head{margin-bottom:34px}
        .section-head h2{font:700 clamp(38px,5vw,58px)/.95 var(--font-display),sans-serif;text-transform:uppercase}
        .section-head p{margin-top:10px;color:#514c45;font-size:16px}
        .camping-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
        .camp-card{background:#fffaf2;border:1px solid rgba(33,31,29,.14);min-height:330px;padding:26px;display:flex;flex-direction:column;justify-content:space-between}
        .camp-number{font:800 12px/1 var(--font-display),sans-serif;color:#c1440e;letter-spacing:.12em}
        .camp-detail{display:block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#716c63;margin-bottom:9px}
        .camp-card h3{font:700 31px/1 var(--font-display),sans-serif;text-transform:uppercase}
        .camp-card p{margin-top:12px;color:#5a564f;font-size:14.5px;line-height:1.6;max-width:330px}
        .detail-link{font-size:12px;font-weight:800;color:inherit}
        .camping-cta{background:#211f1d;color:#fffaf2;padding:62px 0 72px}
        .camping-cta h2{font:700 clamp(38px,5vw,58px)/.95 var(--font-display),sans-serif;text-transform:uppercase}
        .camping-cta p{margin:14px 0 24px;max-width:650px;color:#c9c5bc;font-size:16px;line-height:1.6}
        .btn-secondary{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 22px;border:1.5px solid #fffaf2;color:#fffaf2;font-size:14px;font-weight:700}
        @media(max-width:900px){.camping-intro-grid,.camping-cards{grid-template-columns:1fr}.camping-hero{min-height:470px;padding:82px 0 72px}}
      `}</style>
    </div>
  )
}
