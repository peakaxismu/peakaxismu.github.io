import Link from 'next/link'

export default function HomeStoryKilimanjaro() {
  return (
    <>
      <section className="home-story">
        <div className="wrap">
          <div className="story-grid">
            <div className="story-intro">
              <span className="story-eyebrow">OUR STORY</span>
              <h2>Everest<br /><span>by 2035.</span></h2>
              <p className="story-thesis">We are building the mountain before we ever stand on it.</p>
            </div>
            <div className="story-copy">
              <p>That is why Peak Axis exists. Mauritius&apos; highest point is 828m. We do not have glaciers or the altitude that Everest demands, so if a Mauritian wants to stand on the roof of the world, we have to build the path ourselves — one hike, one expedition, one year at a time.</p>
              <p>We never wanted to ask people to fund a dream from the outside. Instead, we built something people can join: guided hikes across Mauritius, volcano expeditions in La Réunion and, from 2027, Kilimanjaro. Every trail brings another person into the journey and helps fund the next step.</p>
              <p>By the time we reach Everest, everyone who hiked with us, crossed a caldera with us or trained with us on Kilimanjaro will have helped build that summit long before anyone sets foot on it.</p>
            </div>
          </div>
          <div className="story-stats" aria-label="Peak Axis long-term mission">
            <div><strong>2035</strong><span>EVEREST TARGET</span></div>
            <div><strong>3</strong><span>EXPEDITIONS COMPLETED SO FAR</span></div>
            <div><strong>100%</strong><span>SELF-FUNDED THROUGH OUR OWN HIKES</span></div>
          </div>
        </div>
      </section>

      <section className="home-kili">
        <svg className="kili-scape" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0,500 L0,360 C120,345 190,300 260,280 C330,260 350,190 430,175 C480,166 500,140 560,138 C610,136 630,150 700,150 C760,150 780,168 840,178 C900,188 930,240 1020,250 C1090,258 1140,290 1200,285 L1200,500 Z" fill="#173838" opacity="0.9" />
          <path d="M0,500 L0,410 C140,395 210,360 290,345 C360,332 385,280 460,270 C510,264 535,245 600,244 C655,243 680,255 745,262 C810,269 840,300 920,308 C990,315 1040,350 1120,348 L1200,348 L1200,500 Z" fill="#0f2626" />
          <path d="M480,175 C500,160 520,150 560,138 C610,136 630,150 700,150 C735,150 755,158 780,168 L775,182 C740,170 715,164 700,164 C635,164 610,152 562,154 C528,164 505,172 486,186 Z" fill="#EDE7DA" opacity="0.9" />
          <path d="M90,390 C210,350 285,405 410,365 C535,325 640,380 775,335 C900,294 1020,340 1130,300" fill="none" stroke="#C9B790" strokeWidth="1.3" opacity="0.32" />
          <path d="M130,435 C250,400 330,445 465,405 C600,365 710,420 850,375 C965,338 1040,370 1160,335" fill="none" stroke="#C9B790" strokeWidth="1" opacity="0.22" />
          <ellipse cx="640" cy="147" rx="20" ry="7" fill="#C1440E" opacity="0.85" />
        </svg>
        <div className="wrap kili-wrap">
          <div className="kili-content">
            <span className="kili-eyebrow">NEXT MILESTONE · KILIMANJARO 2027</span>
            <h2>Kilimanjaro</h2>
            <p className="kili-lead">The next rung on the ladder to Everest. In October 2027, Peak Axis takes a group of Mauritians to Africa&apos;s highest peak — our highest-altitude expedition yet.</p>
            <p className="kili-body">This is not a bucket-list trip. It is another stage of the training journey: real altitude, real team preparation and another mountain built together.</p>
            <div className="kili-stats">
              <div><strong>5,895m</strong><span>SUMMIT ELEVATION</span></div>
              <div><strong>OCT 2027</strong><span>NEXT DEPARTURE</span></div>
              <div><strong>EVEREST PATH</strong><span>THE NEXT MILESTONE</span></div>
            </div>
            <div className="kili-actions">
              <Link href="/enquire?interest=expedition&ref=Kilimanjaro%202027" className="kili-button">Register your interest</Link>
              <Link href="/enquire?interest=expedition&ref=Kilimanjaro%202027" className="kili-text-link">Ask about Kilimanjaro <span>↗</span></Link>
            </div>
          </div>
        </div>
        <div className="kili-bottom-line"><span>EVERY SEAT BUILDS THE NEXT STEP</span><span>PEAK AXIS · 2027 → 2035</span></div>
      </section>

      <style>{`
        .home-story{padding:92px 0 86px;background:var(--ash);border-top:1px solid var(--sand-line);border-bottom:1px solid var(--sand-line)}
        .story-grid{display:grid;grid-template-columns:.82fr 1.18fr;gap:80px;align-items:start}
        .story-eyebrow,.kili-eyebrow{display:block;color:var(--ember);font-size:11px;font-weight:800;letter-spacing:.12em;margin-bottom:15px}
        .story-intro h2{font-size:clamp(48px,7vw,82px);line-height:.88}
        .story-intro h2 span{color:var(--ember)}
        .story-thesis{margin-top:28px;max-width:300px;font-size:19px;line-height:1.45;color:#514c45;font-weight:600}
        .story-copy{max-width:690px;padding-top:31px}
        .story-copy p{font-size:17px;line-height:1.72;color:#3d3a36}
        .story-copy p+p{margin-top:21px}
        .story-stats{display:grid;grid-template-columns:repeat(3,1fr);max-width:820px;margin-top:64px;border-top:1px solid var(--sand-line)}
        .story-stats>div{padding:20px 24px 0 0;border-right:1px solid var(--sand-line)}
        .story-stats>div+div{padding-left:24px}
        .story-stats>div:last-child{border-right:0}
        .story-stats strong{display:block;font-family:var(--font-display),sans-serif;font-size:30px;font-weight:800}
        .story-stats span{display:block;margin-top:3px;color:#6b675f;font-size:10px;font-weight:800;letter-spacing:.08em;line-height:1.4}
        .home-kili{position:relative;min-height:640px;overflow:hidden;background:#211f1d;color:var(--warm-white);display:flex;align-items:center}
        .kili-scape{position:absolute;inset:0;width:100%;height:100%;opacity:.96;pointer-events:none}
        .home-kili::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(33,31,29,.97) 0%,rgba(33,31,29,.8) 45%,rgba(33,31,29,.12) 100%);pointer-events:none}
        .kili-wrap{position:relative;z-index:1;width:100%}
        .kili-content{max-width:690px;padding:88px 0}
        .kili-content h2{font-size:clamp(54px,8vw,94px);color:var(--warm-white);line-height:.86}
        .kili-lead{margin-top:24px;max-width:620px;color:#d5d0c7;font-size:18px;line-height:1.68}
        .kili-body{margin-top:15px;max-width:580px;color:#aaa59d;font-size:14px;line-height:1.65}
        .kili-stats{display:grid;grid-template-columns:repeat(3,1fr);max-width:690px;margin-top:40px;padding-top:21px;border-top:1px solid rgba(250,248,243,.2)}
        .kili-stats>div{display:flex;flex-direction:column;gap:3px;padding-right:20px}
        .kili-stats strong{font-family:var(--font-display),sans-serif;font-size:24px;color:var(--warm-white)}
        .kili-stats span{color:#a19c92;font-size:10px;font-weight:800;letter-spacing:.08em}
        .kili-actions{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-top:34px}
        .kili-button{display:inline-flex;background:var(--ember);color:var(--warm-white);padding:14px 22px;font-size:13px;font-weight:800}
        .kili-button:hover{background:#a3390b;transform:translateY(-1px)}
        .kili-text-link{color:var(--warm-white);font-size:12px;font-weight:700;border-bottom:1px solid var(--sand);padding-bottom:4px}
        .kili-text-link span{color:var(--ember);font-size:15px;margin-left:5px}
        .kili-bottom-line{position:absolute;z-index:2;bottom:0;left:0;right:0;display:flex;justify-content:space-between;gap:20px;padding:15px max(32px,calc((100vw - 1180px)/2 + 32px));border-top:1px solid rgba(250,248,243,.15);color:#8f8a82;font-size:9px;font-weight:800;letter-spacing:.1em}
        @media(max-width:800px){.home-story{padding:64px 0}.story-grid{grid-template-columns:1fr;gap:28px}.story-copy{padding-top:0}.story-stats{grid-template-columns:1fr;gap:0}.story-stats>div,.story-stats>div+div{padding:15px 0;border-right:0;border-bottom:1px solid var(--sand-line)}.story-stats>div:last-child{border-bottom:0}.home-kili{min-height:700px}.kili-content{padding:72px 0 92px}.kili-stats{grid-template-columns:1fr;gap:17px}.kili-stats>div{padding:0}.kili-bottom-line{display:none}}
        @media(max-width:520px){.story-intro h2{font-size:clamp(46px,15vw,70px)}.story-copy p{font-size:15px}.kili-content h2{font-size:clamp(52px,17vw,78px)}.kili-lead{font-size:16px}.kili-actions{align-items:flex-start;flex-direction:column;gap:16px}.kili-button{width:100%;justify-content:center}}
      `}</style>
    </>
  )
}
