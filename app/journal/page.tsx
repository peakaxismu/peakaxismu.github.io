import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import JournalBrowser from '@/components/journal/JournalBrowser'
import type { JournalPost } from '@/lib/journal'

export const revalidate = 0
export const metadata = {
  title: 'The Adventure Journal | Trail Guides, Gear & Island Weather',
  description: 'Practical trail guides, packing advice, seasonal weather notes and expedition inspiration for hiking in Mauritius and La Réunion.',
  alternates: { canonical: '/journal' },
  openGraph: {
    type: 'website',
    title: 'The Adventure Journal — Peak Axis',
    description: 'Field-tested inspiration for Mauritius trails and La Réunion mountain expeditions.',
    url: '/journal',
    images: [{ url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85', width: 1200, height: 630, alt: 'Mountain landscape' }],
  },
  twitter: { card: 'summary_large_image' as const },
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('journal_posts').select('id,title,category,summary,content,status,created_at,updated_at').eq('status', 'published').order('created_at', { ascending: false })
  const posts = (data || []) as JournalPost[]

  return (
    <div id="view-journal" className="journal-page">
      <section className="journal-hero">
        <div className="journal-hero-image" aria-hidden="true" />
        <div className="wrap hero-inner">
          <span className="kicker">PEAK AXIS FIELD NOTES · MAURITIUS / LA RÉUNION</span>
          <h1>The Adventure<br /><em>Journal.</em></h1>
          <p className="hero-sub">Useful knowledge for the days you spend outside. Trail guides, gear notes and island conditions — written to help you prepare for the real terrain.</p>
          <div className="journal-hero-bottom"><span>FIELD GUIDES FOR CURIOUS HIKERS</span><span>{posts.length.toString().padStart(2, '0')} ARTICLES</span></div>
        </div>
      </section>
      <section className="journal-list-section">
        <div className="wrap">
          <div className="journal-section-heading"><div><span className="section-eyebrow">THE FIELD LIBRARY</span><h2>Read up before<br />you head out.</h2></div><p>From volcanic ridgelines to waterfall paths, get the context that helps you make better decisions outdoors.</p></div>
          <JournalBrowser posts={posts} />
          <div className="journal-cta-box">
            <div><span className="section-eyebrow">YOUR NEXT TRAIL STARTS HERE</span><h3>Want to put the notes into practice?</h3><p>Talk to Peak Axis about upcoming group hikes, private routes or a multi-day expedition across the islands.</p></div>
            <div className="journal-cta-actions"><Link href="/hikes" className="journal-cta-secondary">Explore hikes</Link><Link href="/enquire?interest=expedition" className="btn-primary">Plan an adventure <span aria-hidden="true">↗</span></Link></div>
          </div>
        </div>
      </section>
      <style>{`
        .journal-page{background:#f5f1e8;color:#211f1d;min-height:80vh;padding-bottom:80px}
        .journal-hero{position:relative;isolation:isolate;overflow:hidden;background:#172a29;color:#fffaf2;padding:92px 0 34px;min-height:540px;display:flex;align-items:center}
        .journal-hero-image{position:absolute;inset:0;z-index:-2;background-image:linear-gradient(90deg,rgba(15,28,27,.94) 0%,rgba(15,28,27,.76) 48%,rgba(15,28,27,.2) 100%),url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90');background-size:cover;background-position:center 45%;transform:scale(1.02)}
        .journal-hero:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,rgba(15,28,27,.55),transparent 45%);pointer-events:none}
        .hero-inner{position:relative;z-index:1;width:100%}
        .kicker,.section-eyebrow{color:#e2764b;font-size:11px;font-weight:800;letter-spacing:.15em;display:block;margin-bottom:18px}
        .journal-hero h1{font-family:var(--font-display),sans-serif;font-size:clamp(58px,9vw,112px);line-height:.82;text-transform:uppercase;max-width:900px;color:#fffaf2;letter-spacing:-.02em}
        .journal-hero h1 em{font-style:normal;color:#d5c6a5}
        .hero-sub{margin-top:28px;font-size:18px;line-height:1.7;color:#e0ded7;max-width:600px}
        .journal-hero-bottom{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;border-top:1px solid rgba(255,250,242,.26);margin-top:62px;padding-top:18px;color:#e0ded7;font-size:10px;font-weight:800;letter-spacing:.14em}
        .journal-list-section{padding:72px 0}
        .journal-section-heading{display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:end;margin-bottom:40px}
        .journal-section-heading h2{font-size:clamp(38px,5.6vw,66px);line-height:.9}
        .journal-section-heading>p{max-width:420px;color:#5a554e;font-size:16px;line-height:1.75;padding-bottom:4px}
        .journal-tools{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:14px 24px;align-items:center;border-top:1px solid rgba(33,31,29,.18);border-bottom:1px solid rgba(33,31,29,.18);padding:22px 0;margin-bottom:28px}
        .journal-search-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        .journal-search{width:100%;min-height:48px;padding:12px 16px;border:1px solid rgba(33,31,29,.24);background:#fffaf2;color:#211f1d;font-size:14px;border-radius:0}
        .journal-filters{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}
        .journal-filter{border:1px solid rgba(33,31,29,.2);background:transparent;padding:8px 13px;color:#5a554e;font-size:12px;font-weight:700;cursor:pointer}
        .journal-filter:hover{border-color:#211f1d;color:#211f1d}
        .journal-filter.active{background:#1f4b4c;border-color:#1f4b4c;color:#fffaf2}
        .journal-results{justify-self:end;grid-column:2;grid-row:1;color:#6b675f;font-size:12px}
        .posts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
        .post-card{background:#fffaf2;border:1px solid rgba(33,31,29,.13);display:flex;flex-direction:column;min-width:0;overflow:hidden;transition:transform .2s ease,border-color .2s ease}
        .post-card:hover{transform:translateY(-3px);border-color:rgba(33,31,29,.36)}
        .featured-post{grid-column:span 2;display:grid;grid-template-columns:1.1fr 1fr}
        .card-visual-link{display:block;overflow:hidden}
        .card-visual{width:100%;aspect-ratio:16/10;background-color:#1f4b4c;background-size:cover;background-position:center;position:relative;transition:background-size .25s ease}
        .featured-post .card-visual{height:100%;min-height:340px;aspect-ratio:auto}
        .post-cat{position:absolute;bottom:14px;left:16px;max-width:calc(100% - 60px);background:#fffaf2;color:#211f1d;font-size:10px;font-weight:800;padding:7px 10px;letter-spacing:.08em;text-transform:uppercase}
        .visual-index{position:absolute;right:16px;top:16px;color:#fffaf2;font-size:12px;font-weight:800;letter-spacing:.1em;text-shadow:0 1px 8px rgba(0,0,0,.45)}
        .post-content{padding:25px 26px 24px;display:flex;flex-direction:column;flex:1}
        .featured-post .post-content{padding:clamp(28px,4vw,48px)}
        .post-date{font-size:11px;color:#777168;letter-spacing:.02em;margin-bottom:14px}
        .post-date span{padding:0 6px;color:#c1440e}
        .post-content h2{font-family:var(--font-display),sans-serif;font-size:clamp(23px,2.8vw,33px);text-transform:uppercase;line-height:.98;letter-spacing:0;margin-bottom:14px}
        .featured-post .post-content h2{font-size:clamp(30px,4vw,48px)}
        .post-content h2 a:hover{color:#a83a0b}
        .post-content>p{font-size:14px;color:#514c45;line-height:1.75;margin-bottom:24px}
        .post-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:auto;padding-top:16px;border-top:1px solid rgba(33,31,29,.12)}
        .read-link{font-size:12px;font-weight:800;color:#1f4b4c}
        .read-link span{color:#c1440e;padding-left:5px}
        .related-link{font-size:11px;color:#6b675f;text-decoration:underline;text-decoration-color:#c9b790;text-underline-offset:4px}
        .journal-empty{padding:60px 20px;text-align:center;border:1px solid rgba(33,31,29,.14);background:#fffaf2}
        .journal-empty h2{font-size:34px}
        .journal-empty p{margin-top:12px;color:#5a554e}
        .journal-reset{margin-top:20px;padding:10px 16px;border:1px solid #211f1d;background:transparent;font-weight:700;cursor:pointer}
        .journal-cta-box{margin-top:76px;background:#211f1d;color:#fffaf2;padding:clamp(28px,5vw,54px);display:flex;justify-content:space-between;align-items:flex-end;gap:34px}
        .journal-cta-box .section-eyebrow{margin-bottom:12px}
        .journal-cta-box h3{font-family:var(--font-display),sans-serif;font-size:clamp(30px,4vw,46px);line-height:.92;text-transform:uppercase;color:#fffaf2;margin:0;max-width:620px}
        .journal-cta-box p{margin-top:16px;color:#c9c5bc;font-size:14px;line-height:1.7;max-width:600px}
        .journal-cta-actions{display:flex;gap:10px;flex-wrap:wrap;flex-shrink:0}
        .journal-cta-actions .btn-primary,.journal-cta-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 17px;font-size:12px;font-weight:800;white-space:nowrap}
        .journal-cta-actions .btn-primary{background:#c1440e;color:#fffaf2}
        .journal-cta-secondary{border:1px solid rgba(255,250,242,.5);color:#fffaf2}
        @media(max-width:900px){.posts-grid{grid-template-columns:1fr}.featured-post{grid-column:auto;display:flex}.featured-post .card-visual{min-height:0;aspect-ratio:16/9}.journal-section-heading{grid-template-columns:1fr;gap:18px}.journal-cta-box{align-items:flex-start;flex-direction:column}.journal-cta-actions{width:100%}}
        @media(max-width:560px){.journal-hero{padding:64px 0 24px;min-height:500px}.journal-hero h1{font-size:clamp(56px,17vw,80px)}.hero-sub{font-size:16px}.journal-hero-bottom{margin-top:42px}.journal-list-section{padding:48px 0}.journal-tools{grid-template-columns:1fr}.journal-results{grid-column:1;grid-row:auto;justify-self:start}.journal-filters{grid-column:1}.post-content,.featured-post .post-content{padding:23px 20px}.post-content h2,.featured-post .post-content h2{font-size:29px}.journal-cta-actions{flex-direction:column}.journal-cta-actions a{width:100%}}
        @media(prefers-reduced-motion:reduce){.post-card,.card-visual{transition:none}.post-card:hover{transform:none}}
      `}</style>
    </div>
  )
}
