'use client'

import { useEffect, useMemo, useState } from 'react'

type Post = { id: string; image_url: string; post_url: string; embed_code?: string; caption: string; status: 'draft' | 'published'; sort_order: number }
type Testimonial = { id: string; quote: string; name: string; activity: string; status: 'draft' | 'published'; sort_order: number }
type Content = Record<string, string>

const sections = [
  ['Hero', ['hero_title','hero_emphasis','hero_title_suffix','hero_subtitle','hero_primary_cta','hero_primary_url','hero_secondary_cta','hero_secondary_url','elevation_1_value','elevation_1_label','elevation_2_value','elevation_2_label','elevation_3_value','elevation_3_label']],
  ['Intro', ['intro_title','intro_body']],
  ['Experience pillars', ['hikes_title','hikes_body','hikes_primary_cta','hikes_primary_url','hikes_secondary_cta','hikes_secondary_url','expeditions_title','expeditions_body','expeditions_cta','expeditions_url','team_title','team_body','team_cta','team_url','activities_title','activities_body','activities_cta','activities_url']],
  ['Featured expedition', ['featured_expedition_label','featured_expedition_description','featured_expedition_elevation','featured_expedition_elevation_label','featured_expedition_duration_label','featured_expedition_departure_label','featured_expedition_cta']],
  ['Why Peak Axis', ['positioning_title','positioning_prefix','positioning_emphasis','why_1_title','why_1_body','why_2_title','why_2_body','why_3_title','why_3_body','why_4_title','why_4_body']],
  ['Testimonials section', ['testimonials_kicker','testimonials_title','testimonials_subtitle']],
  ['Instagram section', ['instagram_kicker','instagram_title_prefix','instagram_subtitle','instagram_overlay_cta']],
  ['Final CTA', ['cta_title','cta_body','cta_button','cta_url']],
] as const

const label = (key: string) => key.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
const blankPost: Partial<Post> = { image_url: '', post_url: '', embed_code: '', caption: '', status: 'draft', sort_order: 0 }

export default function SiteContentAdminPage() {
  const [homepage, setHomepage] = useState<Content>({})
  const [settings, setSettings] = useState({ instagram_handle: 'peak.axis', instagram_url: 'https://www.instagram.com/peak.axis' })
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null)
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/site-content', { cache: 'no-store' })
      const j = await r.json(); if (!r.ok) throw Error(j.error || 'Failed to load')
      setHomepage(j.homepage || {}); setSettings(j.settings || settings); setTestimonials(j.testimonials || []); setPosts(j.instagram_posts || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const saveHomepage = async () => {
    setSaving(true); setMessage(''); setError('')
    try {
      const r = await fetch('/api/admin/site-content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ homepage, instagram_handle: settings.instagram_handle, instagram_url: settings.instagram_url }) })
      const j = await r.json(); if (!r.ok) throw Error(j.error || 'Failed to save')
      setHomepage(j.homepage || homepage); setMessage('Site content saved.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save') } finally { setSaving(false) }
  }

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingTestimonial) return; setSaving(true); setMessage(''); setError('')
    try {
      const id = editingTestimonial.id
      const r = await fetch(id ? `/api/admin/testimonials/${id}` : '/api/admin/testimonials', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingTestimonial) })
      const j = await r.json(); if (!r.ok) throw Error(j.error || 'Failed to save testimonial')
      setEditingTestimonial(null); await load(); setMessage('Testimonial saved.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save testimonial') } finally { setSaving(false) }
  }

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingPost) return; setSaving(true); setMessage(''); setError('')
    try {
      const id = editingPost.id
      const r = await fetch(id ? `/api/admin/instagram-posts/${id}` : '/api/admin/instagram-posts', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPost) })
      const j = await r.json(); if (!r.ok) throw Error(j.error || 'Failed to save Instagram post')
      setEditingPost(null); await load(); setMessage('Instagram post saved.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save Instagram post') } finally { setSaving(false) }
  }

  const remove = async (url: string) => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    setSaving(true); setError('')
    try { const r = await fetch(url, { method: 'DELETE' }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Failed to delete'); await load(); setMessage('Deleted.') }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to delete') } finally { setSaving(false) }
  }

  const postCount = useMemo(() => posts.filter(p => p.status === 'published').length, [posts])
  if (loading) return <div className="state">Loading Site Content…</div>

  return <div className="page">
    <header className="page-head"><div><div className="eyebrow">CONTENT MANAGEMENT</div><h1>Site Content</h1><p>Edit the public homepage, testimonials, and Instagram content without touching code.</p></div><a className="live" href="/" target="_blank" rel="noreferrer">Preview live site ↗</a></header>
    {(message || error) && <div className={error ? 'notice error' : 'notice'} role="status">{error || message}</div>}

    <section className="card intro-card"><div><h2>Homepage</h2><p>These fields control the wording visitors see on the homepage. Changes are saved together.</p></div><button className="primary" onClick={saveHomepage} disabled={saving}>{saving ? 'Saving…' : 'Save homepage'}</button></section>
    <div className="sections">{sections.map(([title, fields]) => <details key={title} open={title === 'Hero'} className="card section-card"><summary><span>{title}</span><small>{fields.length} editable fields</small></summary><div className="field-grid">{fields.map(k => <label key={k} className={k.includes('body') || k.includes('subtitle') || k.includes('description') ? 'wide' : ''}>{label(k)}{k.includes('body') || k.includes('subtitle') || k.includes('description') ? <textarea rows={4} value={homepage[k] || ''} onChange={e => setHomepage({ ...homepage, [k]: e.target.value })} /> : <input value={homepage[k] || ''} onChange={e => setHomepage({ ...homepage, [k]: e.target.value })} />}</label>)}</div></details>)}</div>

    <section className="card"><div className="section-head"><div><div className="eyebrow">SOCIAL PROFILE</div><h2>Instagram profile</h2><p>Set the account used by the Instagram section.</p></div></div><div className="field-grid compact"><label>Handle<input value={settings.instagram_handle} onChange={e => setSettings({ ...settings, instagram_handle: e.target.value.replace(/^@/, '') })} /></label><label>Profile URL<input type="url" value={settings.instagram_url} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} /></label></div><button className="primary" onClick={saveHomepage} disabled={saving}>{saving ? 'Saving…' : 'Save Instagram profile'}</button></section>

    <section className="card"><div className="section-head"><div><div className="eyebrow">SOCIAL PROOF</div><h2>Testimonials</h2><p>Only publish genuine customer feedback. Drafts stay off the public site.</p></div><button className="secondary" onClick={() => setEditingTestimonial({ quote: '', name: '', activity: '', status: 'draft', sort_order: testimonials.length })}>+ Add testimonial</button></div><div className="items">{testimonials.length === 0 ? <div className="empty">No testimonials yet. Add genuine customer feedback when you have it.</div> : testimonials.map(t => <div className="item" key={t.id}><div><strong>{t.name}</strong><span>{t.activity} · {t.status === 'published' ? 'Published' : 'Draft'}</span><p>{t.quote}</p></div><div className="item-actions"><button onClick={() => setEditingTestimonial({ ...t })}>Edit</button><button className="danger" onClick={() => remove(`/api/admin/testimonials/${t.id}`)}>Delete</button></div></div>)}</div></section>

    <section className="card"><div className="section-head"><div><div className="eyebrow">INSTAGRAM CONTENT</div><h2>Instagram posts <span className="count">{postCount} published</span></h2><p>Paste Instagram&apos;s official embed code to display the real post. The public site does not fabricate images.</p></div><button className="secondary" onClick={() => setEditingPost({ ...blankPost })}>+ Add Instagram post</button></div><div className="items">{posts.length === 0 ? <div className="empty">No Instagram posts configured yet. Add a post using its embed code.</div> : posts.map(p => <div className="item" key={p.id}><div><strong>{p.caption || 'Instagram post'}</strong><span>{p.status === 'published' ? 'Published' : 'Draft'} · Order {p.sort_order}</span><p className="url">{p.post_url || 'Embed only'}</p></div><div className="item-actions"><button onClick={() => setEditingPost({ ...p })}>Edit</button><button className="danger" onClick={() => remove(`/api/admin/instagram-posts/${p.id}`)}>Delete</button></div></div>)}</div></section>

    {editingTestimonial && <div className="modal"><form onSubmit={saveTestimonial} className="modal-card"><div className="modal-head"><div><div className="eyebrow">TESTIMONIAL</div><h2>{editingTestimonial.id ? 'Edit testimonial' : 'Add testimonial'}</h2></div><button type="button" className="icon" onClick={() => setEditingTestimonial(null)}>×</button></div><label>Quote<textarea required rows={6} value={editingTestimonial.quote || ''} onChange={e => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })} /></label><label>Name<input required value={editingTestimonial.name || ''} onChange={e => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} /></label><label>Activity<input required value={editingTestimonial.activity || ''} onChange={e => setEditingTestimonial({ ...editingTestimonial, activity: e.target.value })} /></label><div className="field-grid compact"><label>Status<select value={editingTestimonial.status || 'draft'} onChange={e => setEditingTestimonial({ ...editingTestimonial, status: e.target.value as 'draft' | 'published' })}><option value="draft">Draft</option><option value="published">Published</option></select></label><label>Display order<input type="number" min="0" value={editingTestimonial.sort_order ?? 0} onChange={e => setEditingTestimonial({ ...editingTestimonial, sort_order: Number(e.target.value) })} /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={() => setEditingTestimonial(null)}>Cancel</button><button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save testimonial'}</button></div></form></div>}

    {editingPost && <div className="modal"><form onSubmit={savePost} className="modal-card wide-modal"><div className="modal-head"><div><div className="eyebrow">INSTAGRAM</div><h2>{editingPost.id ? 'Edit Instagram post' : 'Add Instagram post'}</h2></div><button type="button" className="icon" onClick={() => setEditingPost(null)}>×</button></div><div className="helper">Instagram embed code is preferred. Paste the complete <code>&lt;blockquote class=&quot;instagram-media&quot;…&gt;</code> block copied from Instagram. We extract the post URL and safely render the embed on the public site.</div><label>Instagram embed code<textarea required rows={8} placeholder="Paste the complete Instagram embed code here…" value={editingPost.embed_code || ''} onChange={e => setEditingPost({ ...editingPost, embed_code: e.target.value })} /></label><div className="field-grid compact"><label>Post URL <span className="optional">optional if included in embed</span><input type="url" placeholder="https://www.instagram.com/p/.../" value={editingPost.post_url || ''} onChange={e => setEditingPost({ ...editingPost, post_url: e.target.value })} /></label><label>Image URL <span className="optional">optional for fallback</span><input type="url" value={editingPost.image_url || ''} onChange={e => setEditingPost({ ...editingPost, image_url: e.target.value })} /></label></div><label>Caption <span className="optional">optional</span><input value={editingPost.caption || ''} onChange={e => setEditingPost({ ...editingPost, caption: e.target.value })} /></label><div className="field-grid compact"><label>Status<select value={editingPost.status || 'draft'} onChange={e => setEditingPost({ ...editingPost, status: e.target.value as 'draft' | 'published' })}><option value="draft">Draft</option><option value="published">Published</option></select></label><label>Display order<input type="number" min="0" value={editingPost.sort_order ?? 0} onChange={e => setEditingPost({ ...editingPost, sort_order: Number(e.target.value) })} /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={() => setEditingPost(null)}>Cancel</button><button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save Instagram post'}</button></div></form></div>}

    <style>{`*{box-sizing:border-box}.page{max-width:1180px;margin:0 auto;padding-bottom:60px}.page-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:26px}.page-head h1{font-family:'Big Shoulders Display',sans-serif;font-size:48px;line-height:.95;text-transform:uppercase;margin:5px 0 10px}.page-head p,.card p{color:#625d55;margin:0;line-height:1.55}.eyebrow{font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--ember)}.live{border:1px solid var(--ink);padding:10px 14px;font-size:13px;font-weight:700;white-space:nowrap}.card{background:var(--warm-white);border:1px solid var(--sand-line);padding:26px;margin-bottom:16px;box-shadow:0 1px 0 rgba(0,0,0,.02)}.intro-card{display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--teal);color:var(--warm-white)}.intro-card p{color:#e8e1d5}.intro-card h2{margin:4px 0 5px}.section-card{padding:0;overflow:hidden}.section-card summary{cursor:pointer;list-style:none;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;font-weight:800}.section-card summary::-webkit-details-marker{display:none}.section-card summary:after{content:'+';font-size:20px}.section-card[open] summary:after{content:'−'}.section-card summary small{margin-left:auto;margin-right:20px;color:#756f66;font-weight:500}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:0 24px 24px}.field-grid.compact{padding:0;margin-bottom:16px}.field-grid label.wide{grid-column:1/-1}label{display:block;font-size:12px;font-weight:800;color:#403c36}input,textarea,select{display:block;width:100%;margin-top:7px;padding:11px 12px;border:1px solid #cfc8bc;background:#fff;font:inherit;font-size:14px;color:var(--ink);border-radius:2px}textarea{resize:vertical;line-height:1.5}input:focus,textarea:focus,select:focus{outline:2px solid rgba(193,68,14,.2);border-color:var(--ember)}button{font:inherit;cursor:pointer;border-radius:2px}button:disabled{opacity:.6;cursor:wait}.primary,.secondary,.danger{padding:10px 15px;border:1px solid var(--ink);font-weight:800;font-size:13px}.primary{background:var(--ember);color:#fff;border-color:var(--ember)}.secondary{background:transparent;color:var(--ink)}.danger{border-color:#b52f2f;color:#9c2929;background:transparent}.section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:20px}.section-head h2{margin:4px 0 5px}.count{font-size:11px;font-weight:700;background:#e8e1d5;padding:5px 8px;margin-left:7px;vertical-align:middle}.items{display:grid;gap:10px}.item{border:1px solid var(--sand-line);padding:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;background:#fff}.item strong{display:block;font-size:14px}.item span{display:block;color:#756f66;font-size:12px;margin-top:3px}.item p{margin-top:9px;font-size:13px;max-width:760px}.item .url{font-family:monospace;font-size:11px;overflow-wrap:anywhere}.item-actions{display:flex;gap:8px;flex:0 0 auto}.item-actions button{border:1px solid var(--sand-line);background:transparent;padding:7px 10px;font-size:12px;font-weight:700}.empty{border:1px dashed var(--sand-line);padding:28px;text-align:center;color:#716b62;font-size:13px}.notice{position:sticky;top:82px;z-index:20;background:#e8f2e9;border:1px solid #b8d1ba;padding:11px 14px;margin-bottom:16px;font-size:13px;font-weight:700}.notice.error{background:#f8e8e5;border-color:#dfb8b0;color:#8c2d21}.state{padding:60px;text-align:center;color:#6b675f}.modal{position:fixed;inset:0;background:rgba(20,19,17,.62);display:flex;align-items:center;justify-content:center;padding:20px;z-index:100}.modal-card{background:var(--warm-white);padding:28px;width:100%;max-width:650px;max-height:90vh;overflow:auto;display:grid;gap:16px}.wide-modal{max-width:820px}.modal-head{display:flex;justify-content:space-between;align-items:flex-start}.modal-head h2{margin:4px 0 0;font-size:28px}.icon{border:0;background:transparent;font-size:28px;line-height:1;padding:0 4px}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:4px}.helper{background:#f5f1e8;border-left:3px solid var(--ember);padding:12px 14px;font-size:13px;line-height:1.5;color:#514c45}.helper code{font-family:monospace}.optional{font-weight:500;color:#7c766e;margin-left:4px}@media(max-width:760px){.page{padding-bottom:30px}.page-head,.intro-card,.section-head{align-items:stretch;flex-direction:column}.page-head h1{font-size:40px}.live{text-align:center}.field-grid{grid-template-columns:1fr}.field-grid label.wide{grid-column:auto}.section-card summary{padding:18px}.section-card summary small{display:none}.card{padding:20px}.item{flex-direction:column}.item-actions{width:100%}.item-actions button{flex:1}.modal-card{padding:20px}}`}</style>
  </div>
}
