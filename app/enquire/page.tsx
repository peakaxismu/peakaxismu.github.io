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
  const { data: hikes } = await supabase.from('hikes').select('id, name, date, price, price_solo_usd, price_group_usd, hike_type, main_attraction, difficulty, difficulty_numeric, duration, location, spots_remaining, spots_total, description, booking_type').eq('status', 'published').eq('booking_type', 'scheduled_group')
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
              <div><strong>02</strong><span>Tell us your date &amp; group</span></div>
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
        #view-enquire .enquiry-layout { display:grid; grid-template-columns:minmax(0,1fr) 310px; gap:28px; align-items:start; max-width:1100px; margin:0 auto; }
        #view-enquire .enquiry-main-col { min-width:0; }
        #view-enquire .enquiry-sidebar-col { min-width:0; }
        #view-enquire .sticky-summary-card { position:sticky; top:96px; background:#211f1d; color:#faf8f3; padding:24px; border:1px solid rgba(250,248,243,.08); box-shadow:0 18px 50px rgba(33,31,29,.14); }
        #view-enquire .summary-title { color:#faf8f3; font-size:24px; margin:0 0 22px; }
        #view-enquire .summary-section { padding:14px 0; border-top:1px solid rgba(250,248,243,.12); }
        #view-enquire .summary-label { color:#a19c92; font-size:10px; font-weight:800; letter-spacing:.11em; text-transform:uppercase; margin-bottom:5px; }
        #view-enquire .summary-value { color:#faf8f3; font-size:14px; line-height:1.45; overflow-wrap:anywhere; }
        #view-enquire .summary-value.highlight { color:#c9b790; font-weight:700; }
        #view-enquire .placeholder-text { color:#a19c92; font-weight:400; }
        #view-enquire .summary-pricing-box { margin-top:16px; padding:16px; background:#173838; }
        #view-enquire .pricing-title { color:#c9b790; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .pricing-breakdown { display:flex; flex-direction:column; gap:5px; margin-top:10px; color:#c9c5bc; font-size:12px; }
        #view-enquire .pricing-breakdown strong { color:#faf8f3; font-size:13px; }
        #view-enquire .pricing-total { display:flex; justify-content:space-between; gap:12px; margin-top:13px; padding-top:13px; border-top:1px solid rgba(250,248,243,.15); font-size:12px; }
        #view-enquire .pricing-total strong { color:#faf8f3; }
        #view-enquire .pricing-custom strong { display:block; margin-top:9px; color:#faf8f3; font-size:14px; }
        #view-enquire .pricing-custom p { margin-top:6px; color:#c9c5bc; font-size:12px; line-height:1.5; }
        #view-enquire .pricing-disclaimer { margin-top:13px; color:#a19c92; font-size:10.5px; line-height:1.45; }
        #view-enquire .sidebar-trust-box { margin-top:18px; padding-top:8px; }
        #view-enquire .trust-item { padding:11px 0; border-top:1px solid rgba(250,248,243,.12); display:flex; flex-direction:column; gap:2px; }
        #view-enquire .trust-item strong { color:#c9b790; font-size:11px; }
        #view-enquire .trust-item span { color:#a19c92; font-size:11px; }
        #view-enquire #enquiryForm { background:#faf8f3; border:1px solid rgba(33,31,29,.12); padding:34px; box-shadow:0 18px 50px rgba(33,31,29,.08); }
        #view-enquire .field { margin:0 0 22px; min-width:0; }
        #view-enquire .field label, #view-enquire .field-label-bold { display:block; margin:0 0 8px; color:#211f1d; font-size:13px; line-height:1.35; font-weight:700; }
        #view-enquire .req-star { color:#c1440e; }
        #view-enquire .row2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
        #view-enquire input, #view-enquire select, #view-enquire textarea { display:block; width:100%; max-width:100%; border:1px solid #cfc8bb; border-radius:0; background:#fffdf9; color:#211f1d; padding:12px 13px; font-size:14px; line-height:1.4; box-shadow:none; }
        #view-enquire input, #view-enquire select { min-height:46px; }
        #view-enquire textarea { min-height:120px; resize:vertical; }
        #view-enquire input:hover, #view-enquire select:hover, #view-enquire textarea:hover { border-color:#9e978c; }
        #view-enquire input:focus, #view-enquire select:focus, #view-enquire textarea:focus { border-color:#c1440e; outline:2px solid rgba(193,68,14,.15); outline-offset:0; }
        #view-enquire .input-error { border-color:#c1440e; background:#fff8f5; }
        #view-enquire .field-error-text { display:block; margin-top:6px; color:#a3390b; font-size:11px; }
        #view-enquire .field-group-heading { margin:34px 0 18px; padding-top:26px; border-top:1px solid #ded7ca; color:#211f1d; font-family:var(--font-display),sans-serif; font-size:25px; font-weight:900; letter-spacing:.01em; text-transform:uppercase; }
        #view-enquire .interest-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        #view-enquire .interest-opt { width:100%; min-height:92px; padding:15px 16px; text-align:left; border:1px solid #d2cbbf; background:#f5f1e8; color:#211f1d; cursor:pointer; }
        #view-enquire .interest-opt:hover { border-color:#c1440e; transform:translateY(-1px); }
        #view-enquire .interest-opt.active { border-color:#c1440e; background:#211f1d; color:#faf8f3; box-shadow:inset 0 0 0 1px #c1440e; }
        #view-enquire .interest-opt .t { font-size:14px; font-weight:800; }
        #view-enquire .interest-opt .s { margin-top:5px; color:#6b675f; font-size:11.5px; line-height:1.45; }
        #view-enquire .interest-opt.active .s { color:#c9c5bc; }
        #view-enquire .cond-section { margin:2px 0 4px; padding:20px 0 2px; border-top:1px solid #ded7ca; }
        #view-enquire .upsell-box { margin:4px 0 18px; padding:12px 14px; background:#f4eadf; border-left:3px solid #c1440e; color:#5a564f; font-size:12px; line-height:1.5; }
        #view-enquire .referenced-item-card { margin-bottom:20px; padding:20px; background:#211f1d; color:#faf8f3; border-left:3px solid #c1440e; }
        #view-enquire .ref-card-header { display:flex; justify-content:space-between; gap:16px; align-items:center; }
        #view-enquire .ref-card-kicker { color:#c9b790; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .ref-card-title { margin-top:7px; color:#faf8f3; font-size:24px; line-height:1.05; }
        #view-enquire .ref-card-meta { display:flex; gap:7px; flex-wrap:wrap; margin-top:12px; }
        #view-enquire .ref-pill { padding:6px 9px; background:rgba(250,248,243,.08); color:#c9c5bc; font-size:10.5px; }
        #view-enquire .ref-clear-btn { flex-shrink:0; border:0; background:none; color:#c9b790; font-size:11px; cursor:pointer; }
        #view-enquire .form-error-banner { margin-bottom:18px; padding:12px 14px; background:#f7e4dc; border:1px solid #d9a18d; color:#8e2f0c; font-size:13px; }
        #view-enquire .privacy-notice { margin:20px 0 16px; color:#6b675f; font-size:11px; line-height:1.55; max-width:760px; }
        #view-enquire .legal-link { color:#211f1d; text-decoration:underline; text-underline-offset:2px; }
        #view-enquire .form-submit-btn { display:inline-flex; align-items:center; justify-content:center; min-height:48px; padding:13px 24px; border:0; background:#c1440e; color:#faf8f3; font-size:14px; font-weight:800; cursor:pointer; }
        #view-enquire .form-submit-btn:hover { background:#a3390b; }
        #view-enquire .enquiry-success-card { max-width:820px; margin:70px auto 100px; padding:40px; background:#faf8f3; border:1px solid rgba(33,31,29,.12); box-shadow:0 18px 50px rgba(33,31,29,.08); }
        #view-enquire .enquiry-success-card h2 { margin-top:14px; font-size:clamp(34px,5vw,52px); }
        #view-enquire .success-badge { display:inline-block; padding:7px 10px; background:#173838; color:#c9b790; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .success-lead { margin-top:18px; color:#5a564f; line-height:1.65; }
        #view-enquire .ref-number-box, #view-enquire .summary-recap-box, #view-enquire .success-next-steps { margin-top:24px; padding:18px; border:1px solid #ded7ca; background:#f5f1e8; }
        #view-enquire .ref-number-box { border-left:3px solid #c1440e; }
        #view-enquire .ref-label, #view-enquire .ref-value { display:block; }
        #view-enquire .ref-label { color:#6b675f; font-size:10px; text-transform:uppercase; letter-spacing:.1em; }
        #view-enquire .ref-value { margin-top:4px; font-size:20px; }
        #view-enquire .summary-recap-box h3 { font-size:20px; }
        #view-enquire .recap-list { margin:14px 0 0; }
        #view-enquire .recap-list > div { display:grid; grid-template-columns:150px 1fr; gap:16px; padding:9px 0; border-top:1px solid #ded7ca; }
        #view-enquire .recap-list dt { color:#6b675f; font-size:12px; }
        #view-enquire .recap-list dd { margin:0; font-size:13px; overflow-wrap:anywhere; }
        #view-enquire .success-next-steps h4 { margin:0; font-size:15px; }
        #view-enquire .success-next-steps ul { margin:10px 0 0; padding-left:20px; color:#5a564f; font-size:13px; line-height:1.6; }
        #view-enquire .success-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:26px; }
        #view-enquire .success-actions .btn-primary { background:#c1440e; color:#faf8f3; padding:13px 20px; font-weight:700; }
        #view-enquire .success-actions .btn-secondary { border:1px solid #211f1d; padding:12px 20px; font-weight:700; }
        @media(max-width:900px) {
          #view-enquire .enquiry-layout { grid-template-columns:1fr; }
          #view-enquire .enquiry-sidebar-col { order:2; }
          #view-enquire .sticky-summary-card { position:relative; top:auto; }
        }
        @media(max-width:700px) {
          #view-enquire .contact-hero, #view-enquire .contact-hero-inner { min-height:500px; }
          #view-enquire .contact-hero-copy { padding:56px 0 48px; }
          #view-enquire .contact-form-heading { display:block; }
          #view-enquire .contact-form-heading p { margin-top:12px; }
          #view-enquire #enquiryForm { padding:22px; }
          #view-enquire .interest-grid, #view-enquire .row2 { grid-template-columns:1fr; }
          #view-enquire .contact-trust-row { gap:18px 28px; }
          #view-enquire .enquiry-success-card { margin:38px auto 70px; padding:24px; }
          #view-enquire .recap-list > div { grid-template-columns:1fr; gap:3px; }
        }
      `}</style>
    </div>
  )
}
