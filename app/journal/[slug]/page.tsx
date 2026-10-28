import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { journalImage, journalRelatedLink, journalSlug, type JournalPost } from '@/lib/journal'

export const revalidate = 0

type Params = Promise<{ slug: string }>

async function getPost(slug: string): Promise<JournalPost | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('journal_posts').select('id,title,category,summary,content,status,created_at,updated_at').eq('status', 'published')
  return ((data || []) as JournalPost[]).find((post) => journalSlug(post.title) === slug) || null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Field Note Not Found | Peak Axis' }
  const canonical = `/journal/${journalSlug(post.title)}`
  const image = journalImage(post.title)
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical },
    openGraph: { type: 'article', title: post.title, description: post.summary, url: canonical, publishedTime: post.created_at, modifiedTime: post.updated_at || post.created_at, images: [{ url: image, width: 1400, height: 900, alt: post.title }] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary, images: [image] },
  }
}

function editorialNotes(post: JournalPost) {
  const title = post.title.toLowerCase()
  if (title.includes('waterfall')) return {
    heading: 'Before you follow the water',
    intro: 'Waterfall routes can change quickly after rain. Treat the conditions on the day as part of the route plan, not an afterthought.',
    bullets: ['Check recent and forecast rainfall before setting out.', 'Use footwear with dependable grip and keep both hands free where the path is uneven.', 'Do not enter fast-flowing water or approach pool edges when the rocks are slick.', 'Follow local guidance and turn back if water levels or footing look unsafe.'],
  }
  if (title.includes('pack')) return {
    heading: 'A practical packing check',
    intro: 'Use the final route plan and forecast to tune your pack. These basics are a starting point, not a substitute for the organiser’s equipment list.',
    bullets: ['Broken-in hiking shoes and a waterproof outer layer.', 'Warm layers and a headlamp for early starts or overnight sections.', 'Sun protection, enough drinking water and food for the planned day plus a sensible delay buffer.', 'Personal medication, a small first-aid kit and dry protection for essential items.'],
  }
  if (title.includes('time of year') || title.includes('weather')) return {
    heading: 'Plan around conditions, not just the calendar',
    intro: 'Seasonal patterns are useful for planning, but they do not guarantee conditions on a particular trail or summit.',
    bullets: ['Check a current forecast for the actual elevation and area you plan to visit.', 'Allow flexibility for cloud, wind, heat, heavy rain and trail closures.', 'Confirm access and local advisories shortly before departure.', 'Be ready to change the route or postpone when conditions are unsuitable.'],
  }
  return {
    heading: 'Choosing the right mountain objective',
    intro: 'The best route is the one that matches your time, fitness, experience and the conditions on the day.',
    bullets: ['Compare the full ascent and descent, not only the summit elevation.', 'Ask about terrain, expected duration, start time and the pace required.', 'Check the forecast and any current access restrictions before departure.', 'Confirm logistics and equipment with your guide or trip organiser in advance.'],
  }
}

export default async function JournalArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const related = journalRelatedLink(post)
  const notes = editorialNotes(post)
  const supabase = await createClient()
  const { data: allPosts } = await supabase.from('journal_posts').select('id,title,category,summary,created_at').eq('status', 'published').neq('id', post.id).order('created_at', { ascending: false }).limit(3)
  const relatedPosts = (allPosts || []) as Pick<JournalPost, 'id' | 'title' | 'category' | 'summary' | 'created_at'>[]
  const publishedDate = new Date(post.created_at).toLocaleDateString('en-MU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Indian/Mauritius' })
  const image = journalImage(post.title)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    image,
    author: { '@type': 'Organization', name: 'Peak Axis' },
    publisher: { '@type': 'Organization', name: 'Peak Axis', url: 'https://peakaxis.mu' },
    mainEntityOfPage: `https://peakaxis.mu/journal/${journalSlug(post.title)}`,
  }

  return (
    <article className="journal-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="article-hero">
        <div className="article-hero-photo" role="img" aria-label={`Landscape photograph for ${post.title}`} style={{ backgroundImage: `linear-gradient(90deg,rgba(15,28,27,.92),rgba(15,28,27,.25)),url("${image}")` }} />
        <div className="article-hero-inner">
          <Link className="article-back" href="/journal">← All field notes</Link>
          <span className="article-category">{post.category || 'FIELD NOTES'}</span>
          <h1>{post.title}</h1>
          <p className="article-summary">{post.summary}</p>
          <div className="article-byline"><span>PEAK AXIS FIELD NOTES</span><span>Published {publishedDate}</span></div>
        </div>
      </section>
      <div className="article-layout">
        <aside className="article-sidebar">
          <span className="sidebar-label">IN THIS FIELD NOTE</span>
          <a href="#overview">Overview</a><a href="#field-checklist">Field checklist</a><a href="#plan-next">Plan your next route</a>
          <div className="article-side-cta"><strong>Going out soon?</strong><p>Check your route plan and ask us about guided options.</p><Link href={related.href}>{related.label} ↗</Link></div>
        </aside>
        <div className="article-body">
          <section id="overview" className="article-copy">
            <span className="article-section-number">01 / THE OVERVIEW</span>
            <p className="article-lead">{post.content || post.summary}</p>
            <p>{post.summary} Use this note as a starting point, then confirm the details that matter for your chosen route and date.</p>
          </section>
          <section id="field-checklist" className="article-checklist">
            <span className="article-section-number">02 / PRACTICAL NOTES</span>
            <h2>{notes.heading}</h2><p>{notes.intro}</p>
            <ul>{notes.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <aside className="article-safety"><span>FIELD REMINDER</span><p>Weather, access and trail conditions can change. Check current local guidance before departure, follow your guide’s instructions and be prepared to change plans when conditions are unsafe.</p></aside>
          <section id="plan-next" className="article-next">
            <span className="article-section-number">03 / TAKE IT OUTSIDE</span>
            <h2>Good preparation makes room for the adventure.</h2>
            <p>Want help choosing a route or planning your next outing? Explore the Peak Axis options or send us your questions.</p>
            <div className="article-next-actions"><Link href={related.href} className="article-primary-link">{related.label} ↗</Link><Link href="/enquire" className="article-text-link">Ask Peak Axis a question</Link></div>
          </section>
          <section className="article-related">
            <div className="article-related-head"><span className="article-section-number">KEEP READING</span><Link href="/journal">Browse all field notes ↗</Link></div>
            <div className="related-post-grid">{relatedPosts.map((item) => <Link className="related-post" href={`/journal/${journalSlug(item.title)}`} key={item.id}><span>{item.category}</span><strong>{item.title}</strong><small>Read field note ↗</small></Link>)}</div>
          </section>
        </div>
      </div>
      <style>{`
        .journal-article{background:#f5f1e8;color:#211f1d;padding-bottom:80px}
        .article-hero{position:relative;isolation:isolate;overflow:hidden;background:#172a29;color:#fffaf2;min-height:530px;display:flex;align-items:flex-end;padding:76px max(32px,calc((100vw - 1180px)/2)) 54px}
        .article-hero-photo{position:absolute;inset:0;z-index:-1;background-size:cover;background-position:center 48%}
        .article-hero-inner{width:100%;max-width:1000px}
        .article-back{display:inline-block;color:#eee5d4;font-size:12px;font-weight:700;margin-bottom:38px;border-bottom:1px solid rgba(255,250,242,.4);padding-bottom:5px}
        .article-category{display:block;color:#ef9b78;font-size:10px;font-weight:800;letter-spacing:.15em;margin-bottom:18px}
        .article-hero h1{font-size:clamp(44px,7vw,82px);line-height:.9;max-width:1000px;letter-spacing:-.01em}
        .article-summary{margin-top:20px;max-width:700px;color:#e0ded7;font-size:17px;line-height:1.7}
        .article-byline{display:flex;gap:24px;flex-wrap:wrap;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,250,242,.26);font-size:10px;font-weight:800;letter-spacing:.1em;color:#e0ded7}
        .article-layout{width:min(1180px,calc(100% - 64px));margin:0 auto;display:grid;grid-template-columns:220px minmax(0,760px);gap:80px;padding-top:72px;justify-content:space-between}
        .article-sidebar{align-self:start;position:sticky;top:100px;display:flex;flex-direction:column;gap:14px}
        .sidebar-label,.article-section-number{color:#c1440e;font-size:10px;font-weight:800;letter-spacing:.13em}
        .article-sidebar>a:not(.article-side-cta a){font-size:13px;color:#555047;padding-bottom:10px;border-bottom:1px solid rgba(33,31,29,.12)}
        .article-sidebar>a:hover{color:#c1440e}
        .article-side-cta{margin-top:24px;background:#e8e0d1;padding:20px}
        .article-side-cta strong{font-family:var(--font-display),sans-serif;font-size:23px;text-transform:uppercase;line-height:.95}
        .article-side-cta p{margin-top:10px;font-size:12px;line-height:1.6;color:#555047}
        .article-side-cta a{display:inline-block;margin-top:14px;color:#1f4b4c;font-size:11px;font-weight:800;text-decoration:underline;text-underline-offset:4px}
        .article-body{min-width:0}
        .article-copy,.article-checklist,.article-next{padding-bottom:54px;border-bottom:1px solid rgba(33,31,29,.14);margin-bottom:48px}
        .article-lead{font-size:clamp(21px,2.4vw,28px);line-height:1.55;color:#302d28;margin:22px 0}
        .article-copy>p:not(.article-lead),.article-checklist>p,.article-next>p{font-size:15px;line-height:1.85;color:#555047;margin-top:18px}
        .article-checklist h2,.article-next h2{font-size:clamp(34px,4.5vw,52px);line-height:.92;margin-top:18px}
        .article-checklist ul{padding:0;list-style:none;margin:24px 0 0}
        .article-checklist li{position:relative;padding:15px 0 15px 28px;border-bottom:1px solid rgba(33,31,29,.1);font-size:14px;line-height:1.7;color:#403c35}
        .article-checklist li:before{content:'↗';position:absolute;left:0;top:15px;color:#c1440e;font-weight:800}
        .article-safety{padding:24px 28px;background:#1f4b4c;color:#fffaf2;margin:-4px 0 52px}
        .article-safety span{font-size:10px;letter-spacing:.14em;font-weight:800;color:#d5c6a5}
        .article-safety p{font-size:14px;line-height:1.75;margin-top:10px;color:#e1e8e5}
        .article-next-actions{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-top:24px}
        .article-primary-link{background:#c1440e;color:#fffaf2;padding:13px 18px;font-size:12px;font-weight:800}
        .article-text-link{font-size:12px;font-weight:800;text-decoration:underline;text-decoration-color:#c9b790;text-underline-offset:5px}
        .article-related{margin-top:10px}
        .article-related-head{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:20px}
        .article-related-head>a{font-size:11px;font-weight:800;color:#1f4b4c}
        .related-post-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .related-post{display:flex;flex-direction:column;gap:13px;min-height:150px;padding:20px;background:#fffaf2;border:1px solid rgba(33,31,29,.12)}
        .related-post>span{font-size:9px;color:#c1440e;font-weight:800;letter-spacing:.08em}
        .related-post strong{font-family:var(--font-display),sans-serif;font-size:22px;text-transform:uppercase;line-height:.95}
        .related-post small{margin-top:auto;font-size:10px;font-weight:800;color:#1f4b4c}
        @media(max-width:900px){.article-layout{grid-template-columns:1fr;gap:28px}.article-sidebar{position:static;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sidebar-label{grid-column:1/-1}.article-side-cta{grid-column:1/-1;margin-top:10px}.article-hero{min-height:490px}}
        @media(max-width:560px){.article-hero{padding:54px 20px 32px;min-height:510px}.article-hero h1{font-size:clamp(42px,13vw,60px)}.article-summary{font-size:15px}.article-layout{width:calc(100% - 40px);padding-top:42px}.article-sidebar{grid-template-columns:1fr}.article-sidebar>a:not(.article-side-cta a){padding:8px 0}.article-side-cta{margin-top:12px}.article-copy,.article-checklist,.article-next{padding-bottom:38px;margin-bottom:36px}.related-post-grid{grid-template-columns:1fr}.article-safety{padding:22px}}
      `}</style>
    </article>
  )
}
