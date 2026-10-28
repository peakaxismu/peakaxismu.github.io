'use client'

import { useEffect, useMemo, useState } from 'react'

type Platform = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp' | 'email' | 'other'
type MarketingLink = {
  id: string
  code: string
  label: string
  platform: Platform
  account_handle: string | null
  campaign: string
  destination_path: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string | null
  is_active: boolean
  click_count: number
  enquiry_count: number
  last_clicked_at: string | null
  created_at: string
}

const PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other / partner' },
]

const initialForm = {
  label: '',
  platform: 'instagram' as Platform,
  account_handle: '',
  campaign: 'general',
  destination_path: '/enquire',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--warm-white)',
  border: '1px solid var(--sand-line)',
  padding: 20,
}

function formatDate(value: string | null) {
  if (!value) return 'No clicks yet'
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function getConversionRate(link: MarketingLink) {
  return link.click_count ? Math.round((link.enquiry_count / link.click_count) * 1000) / 10 : 0
}

export default function MarketingLinksManager() {
  const [links, setLinks] = useState<MarketingLink[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [origin, setOrigin] = useState('https://peakaxis.mu')

  async function loadLinks() {
    const response = await fetch('/api/admin/marketing-links', { cache: 'no-store' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || 'Unable to load marketing links.')
    setLinks(payload.data ?? [])
  }

  useEffect(() => {
    setOrigin(window.location.origin)
    loadLinks()
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load marketing links.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return links.filter(link => {
      const matchesText = !term || [link.label, link.platform, link.account_handle || '', link.campaign, link.destination_path]
        .join(' ').toLowerCase().includes(term)
      const matchesFilter = filter === 'all' || (filter === 'active' ? link.is_active : !link.is_active)
      return matchesText && matchesFilter
    })
  }, [links, query, filter])

  const totals = useMemo(() => ({
    links: links.length,
    active: links.filter(link => link.is_active).length,
    clicks: links.reduce((sum, link) => sum + Number(link.click_count || 0), 0),
    enquiries: links.reduce((sum, link) => sum + Number(link.enquiry_count || 0), 0),
  }), [links])

  function urlFor(link: MarketingLink) {
    return origin.replace(/\/$/, '') + '/go/' + link.code
  }

  async function copyLink(link: MarketingLink) {
    try {
      await navigator.clipboard.writeText(urlFor(link))
      setNotice('Tracking link copied: ' + link.label)
      setError('')
    } catch {
      setError('Could not copy automatically. Select the link shown in the row and copy it manually.')
    }
  }

  async function createLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreating(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/marketing-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Unable to create tracking link.')
      setLinks(current => [payload.data, ...current])
      setForm(initialForm)
      setShowForm(false)
      setNotice('Tracking link created. Copy it and use it on the selected channel.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create tracking link.')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(link: MarketingLink) {
    setBusyId(link.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/marketing-links/' + link.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !link.is_active }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Unable to update tracking link.')
      setLinks(current => current.map(item => item.id === link.id ? { ...item, ...payload.data, enquiry_count: item.enquiry_count } : item))
      setNotice(link.is_active ? 'Link paused. New visits will no longer be redirected.' : 'Link activated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update tracking link.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="marketing-manager">
      <style jsx>{`
        .marketing-manager{max-width:1180px;margin:0 auto;color:var(--ink)}
        .eyebrow{font-size:10px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;color:var(--ember)}
        .header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}
        h1{margin:5px 0 7px;font-family:'Big Shoulders Display',sans-serif;font-size:clamp(36px,5vw,48px);font-weight:900;text-transform:uppercase;line-height:1}
        .sub{margin:0;max-width:700px;color:#5a564f;font-size:14px;line-height:1.6}
        button{font:inherit;cursor:pointer}
        .btn{min-height:40px;padding:9px 13px;border:1px solid var(--ink);background:transparent;color:var(--ink);font-size:12px;font-weight:800}
        .btn.primary{background:var(--ember);border-color:var(--ember);color:var(--warm-white)}
        .btn.primary:hover{background:#a9380b}.btn:disabled{opacity:.55;cursor:not-allowed}
        .metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
        .metric{background:var(--warm-white);border:1px solid var(--sand-line);padding:16px 18px;min-width:0;}
        .metric-label{font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.05em;color:#655f56}
        .metric-value{font-size:30px;font-weight:900;line-height:1.2;margin-top:6px;font-variant-numeric:tabular-nums}
        .note{background:#f1ecdf;border-left:3px solid #b8a27b;padding:13px 15px;color:#534b40;font-size:12px;line-height:1.65;margin-bottom:18px}
        .feedback{margin-bottom:12px;padding:12px 14px;border:1px solid #d4ccbf;font-size:13px;line-height:1.5}
        .feedback.success{background:#eaf3ed;border-color:#c6ddcc;color:#255940}.feedback.error{background:#fbebe7;border-color:#e6c3bb;color:#8c2d21}
        .toolbar{display:grid;grid-template-columns:minmax(230px,1fr) 170px auto;gap:10px;align-items:center;padding:14px;margin-bottom:12px;background:var(--warm-white);border:1px solid var(--sand-line)}
        input,select{width:100%;min-height:42px;padding:10px 11px;border:1px solid #d1c8ba;background:#fffdf9;color:var(--ink);font:inherit;font-size:13px;min-width:0}
        input:focus-visible,select:focus-visible{outline:2px solid rgba(193,68,14,.3);border-color:var(--ember)}
        .link-list{display:grid;gap:10px}
        .link-card{background:var(--warm-white);border:1px solid var(--sand-line);padding:17px;min-width:0}
        .link-top{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}
        .link-title{font-weight:850;font-size:16px;overflow-wrap:anywhere}.link-meta{margin-top:5px;color:#655f56;font-size:12px;line-height:1.5}
        .state{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:99px;font-size:10px;font-weight:850;text-transform:uppercase;white-space:nowrap}
        .state.active{background:#e8f1eb;color:#245b41}.state.paused{background:#eee9df;color:#5d554a}
        .dot{width:6px;height:6px;border-radius:50%;background:currentColor}
        .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:15px;padding-top:13px;border-top:1px solid #eee7dc}
        .metric-mini label{display:block;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:.05em;color:#655f56}
        .metric-mini strong{display:block;font-size:18px;margin-top:4px;font-variant-numeric:tabular-nums}
        .link-url{display:flex;gap:8px;align-items:center;min-width:0;margin-top:13px;padding:9px 10px;background:#f5f1e8;border:1px solid #e4ddd0}
        .link-url code{flex:1;min-width:0;overflow-wrap:anywhere;font-size:12px;color:#36312a}
        .link-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        .empty{padding:34px 20px;text-align:center;background:var(--warm-white);border:1px solid var(--sand-line);color:#655f56;font-size:13px}
        .form-card{margin-bottom:16px;padding:20px;background:var(--warm-white);border:1px solid var(--sand-line)}
        .form-card h2{font-size:20px;font-weight:900;margin:0 0 6px}.form-intro{font-size:12px;color:#655f56;margin:0 0 17px;line-height:1.5}
        .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .field{display:grid;gap:6px;min-width:0}.field label{font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.field small{font-size:11px;color:#655f56;line-height:1.4}
        .form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:17px}
        .loading{padding:35px;text-align:center;color:#655f56;font-size:13px}
        @media(max-width:760px){.header{align-items:flex-start;flex-direction:column}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.link-top{align-items:flex-start}.link-url{align-items:flex-start}.link-url .btn{flex:0 0 auto;padding-inline:8px}}
      `}</style>

      <header className="header">
        <div>
          <div className="eyebrow">MARKETING · ATTRIBUTION</div>
          <h1>Trackable links</h1>
          <p className="sub">Create a separate link for each platform, social account, creator or campaign. See clicks and the enquiries associated with each link.</p>
        </div>
        <button className="btn primary" type="button" onClick={() => { setShowForm(value => !value); setError(''); setNotice('') }}>
          {showForm ? 'Cancel' : '+ Create tracking link'}
        </button>
      </header>

      <section className="metric-grid" aria-label="Tracking link summary">
        <div className="metric"><div className="metric-label">Total links</div><div className="metric-value">{totals.links}</div></div>
        <div className="metric"><div className="metric-label">Active links</div><div className="metric-value">{totals.active}</div></div>
        <div className="metric"><div className="metric-label">Tracked clicks</div><div className="metric-value">{totals.clicks.toLocaleString()}</div></div>
        <div className="metric"><div className="metric-label">Enquiries attributed</div><div className="metric-value">{totals.enquiries.toLocaleString()}</div></div>
      </section>

      <div className="note">
        <strong>What this tracks:</strong> the shared link, channel/account label, campaign, aggregate clicks and enquiries submitted in the same browser session. It does not identify a visitor's personal social profile, capture IP addresses or fingerprint devices. Some link-preview bots are excluded from click counts.
      </div>

      {notice && <div className="feedback success" role="status">{notice}</div>}
      {error && <div className="feedback error" role="alert">{error}</div>}

      {showForm && (
        <section className="form-card" aria-labelledby="create-link-title">
          <h2 id="create-link-title">New tracking link</h2>
          <p className="form-intro">Use one link per placement—for example, Instagram bio, an Instagram Story, a TikTok post, or a partner/creator account.</p>
          <form onSubmit={createLink}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="link-label">Link name *</label>
                <input id="link-label" required maxLength={120} value={form.label} onChange={e => setForm(current => ({ ...current, label: e.target.value }))} placeholder="Instagram bio — October campaign" />
              </div>
              <div className="field">
                <label htmlFor="link-platform">Platform *</label>
                <select id="link-platform" value={form.platform} onChange={e => setForm(current => ({ ...current, platform: e.target.value as Platform }))}>
                  {PLATFORMS.map(platform => <option key={platform.value} value={platform.value}>{platform.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="link-account">Account / creator label</label>
                <input id="link-account" maxLength={100} value={form.account_handle} onChange={e => setForm(current => ({ ...current, account_handle: e.target.value }))} placeholder="@peak.axis or creator name" />
                <small>This is your label for the account or placement, not an identity lookup.</small>
              </div>
              <div className="field">
                <label htmlFor="link-campaign">Campaign *</label>
                <input id="link-campaign" required maxLength={120} value={form.campaign} onChange={e => setForm(current => ({ ...current, campaign: e.target.value }))} placeholder="October waterfall launch" />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="link-destination">Destination page *</label>
                <input id="link-destination" required maxLength={300} value={form.destination_path} onChange={e => setForm(current => ({ ...current, destination_path: e.target.value }))} placeholder="/enquire" />
                <small>Use a page path on this website, e.g. /enquire, /waterfalls or /hikes.</small>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={creating}>{creating ? 'Creating…' : 'Create link'}</button>
            </div>
          </form>
        </section>
      )}

      <section aria-label="Marketing links">
        <div className="toolbar">
          <input aria-label="Search links" placeholder="Search links, campaign, platform…" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="Filter active links" value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
            <option value="all">All links</option><option value="active">Active only</option><option value="paused">Paused only</option>
          </select>
          <span style={{ fontSize: 12, color: '#655f56' }}>{visible.length} of {links.length} links</span>
        </div>

        {loading ? <div className="loading" role="status">Loading marketing links…</div> : visible.length ? (
          <div className="link-list">
            {visible.map(link => (
              <article className="link-card" key={link.id}>
                <div className="link-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="link-title">{link.label}</div>
                    <div className="link-meta">
                      {PLATFORMS.find(p => p.value === link.platform)?.label || link.platform}
                      {link.account_handle ? ' · ' + link.account_handle : ''}
                      {' · Campaign: '}{link.campaign}
                      {' · Destination: '}{link.destination_path}
                    </div>
                  </div>
                  <span className={'state ' + (link.is_active ? 'active' : 'paused')}><span className="dot" />{link.is_active ? 'Active' : 'Paused'}</span>
                </div>

                <div className="link-url">
                  <code>{urlFor(link)}</code>
                  <button type="button" className="btn" onClick={() => void copyLink(link)}>Copy link</button>
                </div>

                <div className="metrics">
                  <div className="metric-mini"><label>Clicks</label><strong>{Number(link.click_count).toLocaleString()}</strong></div>
                  <div className="metric-mini"><label>Enquiries</label><strong>{Number(link.enquiry_count).toLocaleString()}</strong></div>
                  <div className="metric-mini"><label>Enquiry rate</label><strong>{getConversionRate(link)}%</strong></div>
                  <div className="metric-mini"><label>Last click</label><strong style={{ fontSize: 12, lineHeight: 1.4 }}>{formatDate(link.last_clicked_at)}</strong></div>
                </div>

                <div className="link-actions">
                  <button type="button" className="btn" onClick={() => void copyLink(link)}>Copy again</button>
                  <button type="button" className="btn" disabled={busyId === link.id} onClick={() => void toggleActive(link)}>{busyId === link.id ? 'Updating…' : link.is_active ? 'Pause link' : 'Activate link'}</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            {links.length === 0 ? 'No tracking links yet. Create your first link for Instagram, TikTok, WhatsApp or a campaign.' : 'No links match these filters.'}
          </div>
        )}
      </section>
    </div>
  )
}
