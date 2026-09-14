import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EnquiryFormClient from '@/components/EnquiryFormClient'

export const revalidate = 0

type EnquiryPageProps = {
  searchParams: Promise<{ interest?: string; ref?: string }>
}

export default async function EnquiryPage({ searchParams }: EnquiryPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: hikes } = await supabase.from('hikes').select('id, name, date, price, price_solo_usd, price_group_usd, hike_type, main_attraction, difficulty, difficulty_numeric, duration, location, spots_remaining, spots_total, description').eq('status', 'published')
  const { data: expeditions } = await supabase.from('expeditions').select('id, name, destination, price_from, duration, difficulty, description').eq('status', 'published')
  const { data: teamPackages } = await supabase.from('team_building_packages').select('id, name, type, duration, price_note, description').eq('status', 'published')
  const allowedInterests = new Set(['hike', 'private_hike', 'expedition', 'piton_des_neiges', 'team', 'activity'])
  let initialInterest = params.interest && allowedInterests.has(params.interest) ? params.interest : 'hike'
  const rawRef = params.ref ?? ''
  let initialRef = ''
  try { initialRef = decodeURIComponent(rawRef) } catch { initialRef = rawRef }
  if (initialInterest === 'piton_des_neiges') { initialInterest = 'expedition'; if (!initialRef) initialRef = 'Piton des Neiges Expedition' }

  return (
    <div id="view-enquire" className="view active" style={{ display: 'block' }}>
      <section className="contact-hero">
        <svg className="contact-hero-scape" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0,500 L0,340 C150,300 220,220 340,220 C440,220 470,150 560,150 C620,150 640,110 690,110 C740,110 760,150 820,150 C920,150 980,260 1100,250 C1150,246 1180,270 1200,270 L1200,500 Z" fill="#173838" opacity="0.9" />
          <path d="M0,500 L0,400 C160,370 240,320 360,320 C450,320 480,270 570,270 C630,270 650,240 700,240 C750,240 770,270 830,270 C930,270 990,340 1100,335 L1200,335 L1200,500 Z" fill="#0f2626" />
          <path d="M90,365 C230,330 270,385 410,350 C545,315 610,360 760,320 C875,290 980,325 1110,295" fill="none" stroke="#C9B790" strokeWidth="1.4" opacity="0.34" />
          <path d="M120,415 C255,385 320,430 450,395 C580,360 675,405 805,365 C920,330 1010,360 1140,335" fill="none" stroke="#C9B790" strokeWidth="1" opacity="0.24" />
          <ellipse cx="660" cy="145" rx="26" ry="9" fill="#C1440E" opacity="0.85" />
        </svg>
        <div className="wrap contact-hero-inner">
          <div className="contact-hero-copy">
            <span className="contact-kicker">PEAK AXIS · CONTACT</span>
            <h1>Let&apos;s plan your<br /><span>next adventure.</span></h1>
            <p>Tell us where you want to go, who&apos;s coming and what kind of experience you&apos;re after. We&apos;ll take care of the route, guides and logistics.</p>
            <div className="contact-hero-actions">
              <a href="#enquiryForm" className="btn-primary">Start your enquiry</a>
              <Link href="/hikes" className="btn-ghost">Explore hikes</Link>
            </div>
            <div className="contact-trust-row" aria-label="What happens next">
              <div><strong>01</strong><span>Choose your experience</span></div>
              <div><strong>02</strong><span>Tell us your date & group</span></div>
              <div><strong>03</strong><span>We plan the details</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="wrap">
          <div className="contact-form-heading">
            <div>
              <span className="contact-form-kicker">YOUR ADVENTURE</span>
              <h2>Build your enquiry</h2>
            </div>
            <p>Start with the experience you want. The form will adapt to show only the details relevant to your trip.</p>
          </div>
          <Suspense fallback={<div className="contact-loading"><p>Loading your enquiry form…</p></div>}>
            <EnquiryFormClient hikes={hikes || []} expeditions={expeditions || []} teamPackages={teamPackages || []} initialInterest={initialInterest} initialRef={initialRef} />
          </Suspense>
        </div>
      </section>

      <style>{`
        #view-enquire { background:#f5f1e8; }
        #view-enquire .contact-hero { position:relative; min-height:560px; overflow:hidden; background:#211f1d; color:#faf8f3; }
        #view-enquire .contact-hero-scape { position:absolute; inset:0; width:100%; height:100%; opacity:.95; }
        #view-enquire .contact-hero::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(33,31,29,.98) 0%,rgba(33,31,29,.76) 46%,rgba(33,31,29,.22) 100%); pointer-events:none; }
        #view-enquire .contact-hero-inner { position:relative; z-index:1; min-height:560px; display:flex; align-items:center; }
        #view-enquire .contact-hero-copy { max-width:650px; padding:72px 0 64px; }
        #view-enquire .contact-kicker, #view-enquire .contact-form-kicker { display:block; color:#c1440e; font-size:12px; font-weight:800; letter-spacing:.12em; margin-bottom:16px; }
        #view-enquire .contact-hero h1 { font-size:clamp(48px,7vw,86px); color:#faf8f3; }
        #view-enquire .contact-hero h1 span { color:#c9b790; }
        #view-enquire .contact-hero p { margin-top:24px; max-width:570px; color:#c9c5bc; font-size:17px; line-height:1.65; }
        #view-enquire .contact-hero-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:32px; }
        #view-enquire .contact-hero .btn-primary { display:inline-flex; align-items:center; justify-content:center; background:#c1440e; color:#faf8f3; padding:13px 22px; border:0; font-weight:700; }
        #view-enquire .contact-hero .btn-primary:hover { background:#a3390b; }
        #view-enquire .contact-hero .btn-ghost { display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(250,248,243,.65); color:#faf8f3; padding:12px 22px; font-weight:600; }
        #view-enquire .contact-hero .btn-ghost:hover { background:#faf8f3; color:#211f1d; }
        #view-enquire .contact-trust-row { display:flex; gap:34px; flex-wrap:wrap; margin-top:46px; padding-top:22px; border-top:1px solid rgba(250,248,243,.18); max-width:680px; }
        #view-enquire .contact-trust-row div { display:flex; flex-direction:column; gap:2px; }
        #view-enquire .contact-trust-row strong { color:#c9b790; font-family:var(--font-display),sans-serif; font-size:20px; }
        #view-enquire .contact-trust-row span { color:#a19c92; font-size:12px; }
        #view-enquire .contact-form-section { padding:70px 0 100px; background:#f5f1e8; }
        #view-enquire .contact-form-heading { display:flex; justify-content:space-between; gap:40px; align-items:flex-end; margin-bottom:34px; }
        #view-enquire .contact-form-heading h2 { font-size:clamp(34px,5vw,52px); }
        #view-enquire .contact-form-heading p { max-width:440px; color:#5a564f; font-size:15px; line-height:1.6; }
        #view-enquire #formView { padding:0; }
        #view-enquire #formView > .enquiry-layout { margin:0; }
        #view-enquire .enquiry-layout { display:grid; grid-template-columns:minmax(0,1fr); max-width:920px; margin:0 auto; }
        #view-enquire .enquiry-main-col { min-width:0; }
        #view-enquire #enquiryForm { background:#faf8f3; border:1px solid rgba(33,31,29,.12); padding:34px; box-shadow:0 18px 50px rgba(33,31,29,.08); }
        #view-enquire .field-label-bold { display:block; margin-bottom:12px; font-size:15px; font-weight:700; }
        #view-enquire .interest-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        #view-enquire .interest-opt { text-align:left; min-height:94px; padding:16px; border:1px solid rgba(33,31,29,.14); background:#f5f1e8; color:#211f1d; cursor:pointer; transition:.18s ease; }
        #view-enquire .interest-opt:hover { border-color:#c1440e; transform:translateY(-1px); }
        #view-enquire .interest-opt.active { border-color:#c1440e; background:#211f1d; color:#faf8f3; box-shadow:inset 0 0 0 1px #c1440e; }
        #view-enquire .interest-opt .t { font-weight:700; font-size:15px; }
        #view-enquire .interest-opt .s { margin-top:5px; font-size:12px; line-height:1.45; color:#6b675f; }
        #view-enquire .interest-opt.active .s { color:#c9c5bc; }
        #view-enquire .cond-section { margin-top:24px; padding-top:24px; border-top:1px solid rgba(33,31,29,.1); }
        #view-enquire .referenced-item-card { margin-bottom:20px; padding:20px; background:#211f1d; color:#faf8f3; border-left:3px solid #c1440e; }
        #view-enquire .ref-card-kicker { color:#c9b790; font-size:11px; font-weight:800; letter-spacing:.1em; }
        #view-enquire .ref-card-title { margin-top:6px; font-size:25px; color:#faf8f3; }
        #view-enquire .ref-card-meta { display:flex; gap:7px; flex-wrap:wrap; margin-top:12px; }
        #view-enquire .ref-pill { padding:6px 9px; background:rgba(250,248,243,.08); color:#c9c5bc; font-size:11px; }
        #view-enquire .ref-clear-btn { float:right; border:0; background:none; color:#c9b790; font-size:12px; cursor:pointer; }
        #view-enquire .form-error-banner { margin-bottom:18px; padding:12px 14px; background:#f7e4dc; border:1px solid #d9a18d; color:#8e2f0c; }
        #view-enquire .contact-loading { max-width:920px; margin:0 auto; padding:30px; background:#faf8f3; border:1px solid rgba(33,31,29,.12); color:#5a564f; }
        @media(max-width:700px) {
          #view-enquire .contact-hero, #view-enquire .contact-hero-inner { min-height:500px; }
          #view-enquire .contact-hero-copy { padding:56px 0 48px; }
          #view-enquire .contact-form-heading { display:block; }
          #view-enquire .contact-form-heading p { margin-top:12px; }
          #view-enquire #enquiryForm { padding:22px; }
          #view-enquire .interest-grid { grid-template-columns:1fr; }
          #view-enquire .contact-trust-row { gap:18px 28px; }
        }
      `}</style>
    </div>
  )
}
