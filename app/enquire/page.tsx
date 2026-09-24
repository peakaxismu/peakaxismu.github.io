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
  if (initialInterest === 'hike' && !(hikes?.length)) initialInterest = 'private_hike'

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
            <span className="contact-kicker">PEAK AXIS · LET&apos;S TALK</span>
            <h1>Tell us what you&apos;re<br /><span>dreaming of.</span></h1>
            <p>Start with the experience. We&apos;ll help with the route, timing and details.</p>
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
              <span className="contact-form-kicker">A SIMPLE START</span>
              <h2>Let&apos;s talk.</h2>
            </div>
            <p>Choose what sounds right. You can add dates, group size and other details only if you already know them.</p>
          </div>
          <EnquiryFormClient hikes={hikes || []} expeditions={expeditions || []} teamPackages={teamPackages || []} initialInterest={initialInterest} initialRef={initialRef} />
        </div>
      </section>

      <style>{`
        #view-enquire { background:#f5f1e8; }
        #view-enquire .contact-hero { position:relative; min-height:500px; overflow:hidden; background:#211f1d; color:#faf8f3; }
        #view-enquire .contact-hero-scape { position:absolute; inset:0; width:100%; height:100%; opacity:.95; }
        #view-enquire .contact-hero::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(33,31,29,.98) 0%,rgba(33,31,29,.78) 48%,rgba(33,31,29,.25) 100%); pointer-events:none; }
        #view-enquire .contact-hero-inner { position:relative; z-index:1; min-height:500px; display:flex; align-items:center; }
        #view-enquire .contact-hero-copy { max-width:650px; padding:62px 0 54px; }
        #view-enquire .contact-kicker, #view-enquire .contact-form-kicker { display:block; color:#c1440e; font-size:11px; font-weight:800; letter-spacing:.12em; margin-bottom:14px; }
        #view-enquire .contact-hero h1 { font-size:clamp(46px,7vw,78px); color:#faf8f3; line-height:.98; }
        #view-enquire .contact-hero h1 span { color:#c9b790; }
        #view-enquire .contact-hero p { margin-top:20px; max-width:520px; color:#c9c5bc; font-size:17px; line-height:1.6; }
        #view-enquire .contact-hero-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:28px; }
        #view-enquire .contact-hero .btn-primary { display:inline-flex; align-items:center; justify-content:center; background:#c1440e; color:#faf8f3; padding:12px 21px; border:0; font-weight:700; }
        #view-enquire .contact-hero .btn-ghost { display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(250,248,243,.65); color:#faf8f3; padding:11px 21px; font-weight:600; }
        #view-enquire .contact-trust-row { display:flex; gap:30px; flex-wrap:wrap; margin-top:38px; padding-top:19px; border-top:1px solid rgba(250,248,243,.18); max-width:680px; }
        #view-enquire .contact-trust-row div { display:flex; flex-direction:column; gap:2px; }
        #view-enquire .contact-trust-row strong { color:#c9b790; font-family:var(--font-display),sans-serif; font-size:13px; letter-spacing:.05em; }
        #view-enquire .contact-trust-row span { color:#a19c92; font-size:11px; }
        #view-enquire .contact-form-section { padding:64px 0 90px; background:#f5f1e8; }
        #view-enquire .contact-form-heading { display:flex; justify-content:space-between; gap:40px; align-items:flex-end; margin-bottom:26px; }
        #view-enquire .contact-form-heading h2 { font-size:clamp(34px,5vw,50px); }
        #view-enquire .contact-form-heading p { max-width:440px; color:#5a564f; font-size:15px; line-height:1.6; }
        #view-enquire .enquiry-layout { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:28px; align-items:start; max-width:1060px; margin:0 auto; }
        #view-enquire #enquiryForm { background:#faf8f3; border:1px solid rgba(33,31,29,.10); padding:30px; box-shadow:0 14px 38px rgba(33,31,29,.06); }
        #view-enquire .field { margin:0 0 18px; min-width:0; }
        #view-enquire .field label { display:block; margin:0 0 7px; color:#211f1d; font-size:13px; line-height:1.35; font-weight:700; }
        #view-enquire .req-star { color:#c1440e; }
        #view-enquire .optional-label { color:#8b857b; font-size:11px; font-weight:500; margin-left:4px; }
        #view-enquire .row2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        #view-enquire input, #view-enquire select, #view-enquire textarea { display:block; width:100%; max-width:100%; border:1px solid #cfc8bb; border-radius:10px; background:#fffdf9; color:#211f1d; padding:12px 13px; font-size:14px; line-height:1.4; box-shadow:none; }
        #view-enquire input, #view-enquire select { min-height:46px; }
        #view-enquire textarea { min-height:120px; resize:vertical; }
        #view-enquire input:focus, #view-enquire select:focus, #view-enquire textarea:focus { border-color:#c1440e; outline:2px solid rgba(193,68,14,.14); outline-offset:0; }
        #view-enquire .experience-fieldset { margin:0; padding:0; border:0; }
        #view-enquire .experience-fieldset legend { color:#211f1d; font-size:18px; font-weight:800; margin-bottom:13px; }
        #view-enquire .interest-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        #view-enquire .interest-opt { width:100%; min-height:82px; display:flex; align-items:flex-start; gap:12px; padding:14px; text-align:left; border:1px solid #d2cbbf; border-radius:12px; background:#f5f1e8; color:#211f1d; cursor:pointer; transition:.18s ease; }
        #view-enquire .interest-opt:hover { border-color:#c1440e; transform:translateY(-1px); }
        #view-enquire .interest-opt.active { border-color:#c1440e; background:#211f1d; color:#faf8f3; box-shadow:inset 0 0 0 1px #c1440e; }
        #view-enquire .interest-icon { width:30px; height:30px; flex:0 0 30px; display:grid; place-items:center; border-radius:50%; background:#e8e0d3; color:#c1440e; font-weight:800; }
        #view-enquire .interest-opt.active .interest-icon { background:#c1440e; color:#faf8f3; }
        #view-enquire .interest-copy { display:flex; flex-direction:column; gap:4px; }
        #view-enquire .interest-copy strong { font-size:14px; }
        #view-enquire .interest-copy span { color:#6b675f; font-size:11.5px; line-height:1.4; }
        #view-enquire .interest-opt.active .interest-copy span { color:#c9c5bc; }
        #view-enquire .field-group-heading { margin:28px 0 18px; padding-top:24px; border-top:1px solid #ded7ca; color:#211f1d; font-family:var(--font-display),sans-serif; font-size:22px; font-weight:900; }
        #view-enquire .details-toggle { width:100%; display:flex; justify-content:space-between; align-items:center; margin:2px 0 18px; padding:14px 0; border:0; border-top:1px solid #ded7ca; border-bottom:1px solid #ded7ca; background:transparent; color:#211f1d; font-weight:800; cursor:pointer; }
        #view-enquire .details-toggle span:last-child { font-size:20px; color:#c1440e; }
        #view-enquire .details-panel { padding:3px 0 2px; }
        #view-enquire .referenced-item-card { display:grid; grid-template-columns:1fr auto; gap:8px 16px; margin:0 0 20px; padding:16px; background:#173838; color:#faf8f3; border-radius:10px; }
        #view-enquire .ref-card-kicker { display:block; color:#c9b790; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .referenced-item-card h3 { margin-top:5px; color:#faf8f3; font-size:18px; line-height:1.2; }
        #view-enquire .ref-card-meta { grid-column:1 / -1; display:flex; gap:8px; flex-wrap:wrap; color:#c9c5bc; font-size:11px; }
        #view-enquire .ref-card-meta span { padding:5px 8px; background:rgba(250,248,243,.08); border-radius:6px; }
        #view-enquire .ref-clear-btn { align-self:start; border:0; background:none; color:#c9b790; font-size:11px; cursor:pointer; }
        #view-enquire .upsell-box { margin-top:8px; padding:11px 13px; background:#f4eadf; border-left:3px solid #c1440e; color:#5a564f; font-size:12px; line-height:1.5; border-radius:0 7px 7px 0; }
        #view-enquire .form-error-banner { margin-bottom:16px; padding:11px 13px; background:#f7e4dc; border:1px solid #d9a18d; color:#8e2f0c; font-size:13px; border-radius:8px; }
        #view-enquire .field-error-text { display:block; margin-top:5px; color:#a3390b; font-size:11px; }
        #view-enquire .privacy-notice { margin:18px 0 14px; color:#6b675f; font-size:11px; line-height:1.55; }
        #view-enquire .legal-link { color:#211f1d; text-decoration:underline; text-underline-offset:2px; }
        #view-enquire .form-submit-btn { width:100%; display:inline-flex; align-items:center; justify-content:center; min-height:50px; padding:13px 24px; border:0; border-radius:10px; background:#c1440e; color:#faf8f3; font-size:14px; font-weight:800; cursor:pointer; }
        #view-enquire .form-submit-btn:disabled { opacity:.65; cursor:wait; }
        #view-enquire .enquiry-side-note { position:sticky; top:96px; background:#fffaf2; border:1px solid #ded7ca; border-radius:12px; overflow:hidden; }
        #view-enquire .side-note-main { padding:22px; }
        #view-enquire .side-kicker { color:#c1440e; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .side-note-main h3 { margin-top:8px; font-size:23px; line-height:1.08; }
        #view-enquire .side-note-main p { margin-top:10px; color:#5a564f; font-size:12.5px; line-height:1.55; }
        #view-enquire .trust-list { border-top:1px solid #ded7ca; }
        #view-enquire .trust-list > div { display:flex; flex-direction:column; gap:2px; padding:13px 22px; border-bottom:1px solid #ded7ca; }
        #view-enquire .trust-list > div:last-child { border-bottom:0; }
        #view-enquire .trust-list strong { color:#211f1d; font-size:12px; }
        #view-enquire .trust-list span { color:#6b675f; font-size:11px; }
        #view-enquire .enquiry-success-card { max-width:820px; margin:30px auto 70px; padding:34px; background:#faf8f3; border:1px solid rgba(33,31,29,.12); border-radius:12px; box-shadow:0 14px 38px rgba(33,31,29,.06); }
        #view-enquire .enquiry-success-card h2 { margin-top:12px; font-size:clamp(34px,5vw,50px); }
        #view-enquire .success-badge { display:inline-block; padding:7px 10px; background:#173838; color:#c9b790; border-radius:6px; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        #view-enquire .success-lead { margin-top:16px; color:#5a564f; line-height:1.65; }
        #view-enquire .ref-number-box, #view-enquire .summary-recap-box, #view-enquire .success-next-steps { margin-top:20px; padding:16px; border:1px solid #ded7ca; background:#f5f1e8; border-radius:9px; }
        #view-enquire .ref-label, #view-enquire .ref-value { display:block; }
        #view-enquire .ref-label { color:#6b675f; font-size:10px; text-transform:uppercase; letter-spacing:.1em; }
        #view-enquire .ref-value { margin-top:4px; font-size:18px; }
        #view-enquire .summary-recap-box h3 { font-size:19px; }
        #view-enquire .recap-list { margin:12px 0 0; }
        #view-enquire .recap-list > div { display:grid; grid-template-columns:150px 1fr; gap:14px; padding:8px 0; border-top:1px solid #ded7ca; }
        #view-enquire .recap-list dt { color:#6b675f; font-size:12px; }
        #view-enquire .recap-list dd { margin:0; font-size:13px; overflow-wrap:anywhere; }
        #view-enquire .success-next-steps h4 { margin:0; font-size:15px; }
        #view-enquire .success-next-steps p { margin-top:7px; color:#5a564f; font-size:13px; line-height:1.55; }
        #view-enquire .success-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:22px; }
        #view-enquire .success-actions .btn-primary { background:#c1440e; color:#faf8f3; padding:12px 19px; font-weight:700; border-radius:8px; }
        #view-enquire .success-actions .btn-secondary { border:1px solid #211f1d; padding:11px 19px; font-weight:700; border-radius:8px; }
        #view-enquire .contact-loading { min-height:280px; display:grid; place-items:center; color:#6b675f; }
        @media(max-width:900px) {
          #view-enquire .enquiry-layout { grid-template-columns:1fr; }
          #view-enquire .enquiry-side-note { position:relative; top:auto; order:2; }
        }
        @media(max-width:700px) {
          #view-enquire .contact-hero, #view-enquire .contact-hero-inner { min-height:470px; }
          #view-enquire .contact-hero-copy { padding:50px 0 42px; }
          #view-enquire .contact-form-heading { display:block; }
          #view-enquire .contact-form-heading p { margin-top:10px; }
          #view-enquire #enquiryForm { padding:22px; }
          #view-enquire .interest-grid, #view-enquire .row2 { grid-template-columns:1fr; }
          #view-enquire .contact-trust-row { gap:16px 24px; }
          #view-enquire .form-submit-btn { position:sticky; bottom:12px; z-index:5; box-shadow:0 8px 22px rgba(33,31,29,.18); }
          #view-enquire .enquiry-success-card { padding:24px; }
          #view-enquire .recap-list > div { grid-template-columns:1fr; gap:3px; }
        }
      `}</style>
    </div>
  )
}
