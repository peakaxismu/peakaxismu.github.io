import { createClient } from '@/lib/supabase/server'
import HikesClientList from '@/components/HikesClientList'

export const revalidate = 0

export default async function HikesPage() {
  const supabase = await createClient()
  const [{ data: hikes }, { data: media }] = await Promise.all([
    supabase.from('hikes').select('*').eq('status', 'published').order('created_at', { ascending: true }),
    supabase.from('hike_media').select('id,hike_id,image_url,is_main,sort_order').order('is_main', { ascending: false }).order('sort_order', { ascending: true }),
  ])

  return (
    <div id="view-hikes" className="view active" style={{ display: 'block' }}>
      <section className="pagehead">
        <svg className="hero-scape" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0,500 L0,360 C100,320 155,255 260,265 C345,274 390,185 470,205 C555,226 610,125 690,140 C770,155 820,250 900,235 C1000,216 1060,170 1200,220 L1200,500 Z" fill="#173838" opacity=".95"/>
          <path d="M0,500 L0,410 C120,380 210,335 315,350 C410,364 475,285 555,300 C650,318 705,225 780,250 C870,280 920,325 1015,310 C1090,298 1150,330 1200,320 L1200,500 Z" fill="#0f2626"/>
          <path d="M470,205 C525,270 565,330 610,500 M690,140 C675,220 660,300 650,500" stroke="#c9b790" strokeWidth="3" opacity=".55" fill="none"/>
          <ellipse cx="720" cy="118" rx="26" ry="9" fill="#c1440e" opacity=".85"/>
        </svg>
        <div className="wrap hero-inner">
          <div className="kicker">MAURITIUS · GUIDED GROUP HIKES</div>
          <h1>Find your line through the mountains.</h1>
          <p>No group of your own? Join one of ours. Every hike runs with a guide, a fixed group size, and a route chosen for the season.</p>
        </div>
      </section>
      <HikesClientList hikes={hikes || []} media={media || []} />
      <style>{`.pagehead{position:relative;overflow:hidden;background:#211f1d;color:#fffaf2;padding:88px 0 72px;min-height:430px;display:flex;align-items:center}.hero-scape{position:absolute;inset:0;width:100%;height:100%;opacity:.95}.hero-inner{position:relative;z-index:1}.pagehead .kicker{color:#c1440e;font-size:12px;font-weight:800;letter-spacing:.12em;margin-bottom:16px}.pagehead h1{font-family:var(--font-display),sans-serif;font-size:clamp(48px,7.5vw,88px);line-height:.88;text-transform:uppercase;max-width:900px;color:#fffaf2}.pagehead p{margin-top:24px;font-size:19px;line-height:1.6;color:#c9c5bc;max-width:680px}@media(max-width:700px){.pagehead{min-height:390px;padding:72px 0 58px}}`}</style>
    </div>
  )
}
