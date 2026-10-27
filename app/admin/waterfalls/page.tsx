'use client'

import { useEffect, useMemo, useState } from 'react'

type WaterfallStatus = 'draft' | 'published'
type Waterfall = {
  id: string
  name: string
  location: string
  duration: string
  status: WaterfallStatus
  short_line: string | null
}

type WaterfallForm = Partial<Waterfall>
type ApiResult<T> = { success?: boolean; data?: T; error?: string }

const EMPTY_FORM: WaterfallForm = {
  name: '',
  location: '',
  duration: '3 hrs',
  status: 'draft',
  short_line: '',
}

async function readResponse<T>(response: Response): Promise<ApiResult<T>> {
  return response.json().catch(() => ({}))
}

export default function AdminWaterfallsPage() {
  const [items, setItems] = useState<Waterfall[]>([])
  const [editing, setEditing] = useState<WaterfallForm | null>(null)
  const [originalEditing, setOriginalEditing] = useState<WaterfallForm | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Waterfall | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | WaterfallStatus>('all')

  useEffect(() => {
    let active = true

    async function loadInitialItems() {
      try {
        const response = await fetch('/api/admin/waterfalls', { cache: 'no-store' })
        const result = await readResponse<Waterfall[]>(response)
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Unable to load waterfall routes.')
        }
        if (active) setItems(result.data ?? [])
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load waterfall routes.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialItems()
    return () => { active = false }
  }, [])

  async function refreshItems() {
    const response = await fetch('/api/admin/waterfalls', { cache: 'no-store' })
    const result = await readResponse<Waterfall[]>(response)
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'The route was saved, but the list could not be refreshed.')
    }
    setItems(result.data ?? [])
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return items.filter(item => {
      const matchesQuery = !normalizedQuery ||
        (item.name + ' ' + item.location + ' ' + (item.short_line ?? '')).toLowerCase().includes(normalizedQuery)
      const matchesStatus = status === 'all' || item.status === status
      return matchesQuery && matchesStatus
    })
  }, [items, query, status])

  const counts = {
    total: items.length,
    published: items.filter(item => item.status === 'published').length,
    draft: items.filter(item => item.status === 'draft').length,
  }
  const hasFilters = query.trim().length > 0 || status !== 'all'
  const hasUnsavedChanges = Boolean(
    editing && originalEditing && JSON.stringify(editing) !== JSON.stringify(originalEditing)
  )

  function openNewForm() {
    const form = { ...EMPTY_FORM }
    setEditing(form)
    setOriginalEditing({ ...form })
    setFormError('')
    setError('')
    setNotice('')
  }

  function openEditForm(item: Waterfall) {
    const form = { ...item }
    setEditing(form)
    setOriginalEditing({ ...form })
    setFormError('')
    setError('')
    setNotice('')
  }

  function closeEditor() {
    if (hasUnsavedChanges) {
      setConfirmDiscard(true)
      return
    }
    setEditing(null)
    setOriginalEditing(null)
    setFormError('')
    setConfirmDiscard(false)
  }

  function discardEditor() {
    setEditing(null)
    setOriginalEditing(null)
    setFormError('')
    setConfirmDiscard(false)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return

    const name = typeof editing.name === 'string' ? editing.name.trim() : ''
    const location = typeof editing.location === 'string' ? editing.location.trim() : ''
    const duration = typeof editing.duration === 'string' ? editing.duration.trim() : ''
    const shortLine = typeof editing.short_line === 'string' ? editing.short_line.trim() : ''

    if (!name || !location || !duration) {
      setFormError('Complete the route name, location and duration before saving.')
      return
    }

    setSaving(true)
    setFormError('')
    setError('')
    setNotice('')

    try {
      const isEdit = Boolean(editing.id)
      const response = await fetch(
        isEdit ? '/api/admin/waterfalls/' + editing.id : '/api/admin/waterfalls',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            location,
            duration,
            short_line: shortLine,
            status: editing.status || 'draft',
          }),
        },
      )
      const result = await readResponse<Waterfall[]>(response)
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to save this route.')
      }

      setEditing(null)
      setOriginalEditing(null)
      setNotice(isEdit ? 'Waterfall route updated.' : 'Waterfall route created.')
      try {
        await refreshItems()
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : 'The route was saved, but the list could not be refreshed.')
      }
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save this route.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(item: Waterfall) {
    const nextStatus: WaterfallStatus = item.status === 'published' ? 'draft' : 'published'
    setBusyId(item.id)
    setError('')
    setNotice('')

    try {
      const response = await fetch('/api/admin/waterfalls/' + item.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: nextStatus }),
      })
      const result = await readResponse<Waterfall[]>(response)
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to update publishing status.')
      }

      setItems(previous => previous.map(route =>
        route.id === item.id ? { ...route, status: nextStatus } : route
      ))
      setNotice(nextStatus === 'published'
        ? 'Route published on the public site.'
        : 'Route moved to drafts.')
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update publishing status.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeItem() {
    if (!deleteTarget) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch('/api/admin/waterfalls/' + deleteTarget.id, { method: 'DELETE' })
      const result = await readResponse<unknown>(response)
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to delete this route.')
      }

      const deletedName = deleteTarget.name
      setDeleteTarget(null)
      setNotice('“' + deletedName + '” was deleted.')
      await refreshItems()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this route.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="waterfalls-admin" onKeyDown={event => {
      if (event.key !== 'Escape') return
      if (deleteTarget) setDeleteTarget(null)
      else if (confirmDiscard) setConfirmDiscard(false)
      else if (editing) closeEditor()
    }}>
      <header className="page-header">
        <div className="eyebrow">SITE CONTENT <span aria-hidden="true">/</span> ROUTES</div>
        <div className="page-heading-row">
          <div className="heading-copy">
            <h1>Waterfall routes</h1>
            <p>Manage the routes visitors see on the public Waterfalls page.</p>
          </div>
          <div className="header-actions">
            <a className="button secondary" href="/waterfalls" target="_blank" rel="noreferrer">
              Preview public page <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="button primary" onClick={openNewForm}>
              <span aria-hidden="true">+</span> Add route
            </button>
          </div>
        </div>
      </header>

      <section className="summary-grid" aria-label="Waterfall route summary">
        <article className="summary-card">
          <span className="summary-label">Total routes</span>
          <strong>{counts.total}</strong>
          <span className="summary-caption">All routes in the system</span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Published</span>
          <strong>{counts.published}</strong>
          <span className="summary-caption">Visible on the public site</span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Drafts</span>
          <strong>{counts.draft}</strong>
          <span className="summary-caption">Hidden until published</span>
        </article>
      </section>

      {notice && <div className="feedback success" role="status"><span aria-hidden="true">✓</span>{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      {error && <div className="feedback failure" role="alert"><span aria-hidden="true">!</span>{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}

      <section className="routes-section" aria-label="Waterfall route list">
        <div className="list-header">
          <div>
            <h2>Routes <span className="count-pill">{filtered.length}</span></h2>
            <p>Search, edit and control which routes are published.</p>
          </div>
          <span className="list-total">{filtered.length} of {items.length} routes</span>
        </div>

        <div className="toolbar">
          <label className="search-field">
            <span className="sr-only">Search routes</span>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search route, location or description"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            {query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
          </label>
          <label className="status-filter">
            <span>Status</span>
            <select value={status} onChange={event => setStatus(event.target.value as typeof status)}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </label>
          {hasFilters && <button type="button" className="reset-filters" onClick={() => { setQuery(''); setStatus('all') }}>Clear filters</button>}
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading-state" role="status"><span className="spinner" />Loading waterfall routes…</div>
          ) : filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th scope="col">Route</th>
                  <th scope="col">Location</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="route-name">{item.name}</div>
                      {item.short_line && <p className="route-description">{item.short_line}</p>}
                    </td>
                    <td className="location-cell">{item.location}</td>
                    <td className="duration-cell">{item.duration}</td>
                    <td><span className={'status-badge ' + item.status}><span className="status-dot" />{item.status === 'published' ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="action-button edit" onClick={() => openEditForm(item)}>Edit</button>
                        <button
                          type="button"
                          className="action-button publish"
                          disabled={saving || busyId === item.id}
                          onClick={() => void toggleStatus(item)}
                        >
                          {busyId === item.id ? 'Updating…' : item.status === 'published' ? 'Move to draft' : 'Publish'}
                        </button>
                        <button type="button" className="action-button delete" disabled={saving || busyId === item.id} onClick={() => setDeleteTarget(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">{hasFilters ? '⌕' : '◇'}</div>
              <h3>{hasFilters ? 'No routes match your filters' : 'No waterfall routes yet'}</h3>
              <p>{hasFilters ? 'Try a different search or clear the current filters.' : 'Add your first route to begin managing waterfall experiences.'}</p>
              {hasFilters
                ? <button type="button" className="button secondary" onClick={() => { setQuery(''); setStatus('all') }}>Clear filters</button>
                : <button type="button" className="button primary" onClick={openNewForm}>Add first route</button>}
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && <div className="list-footer">Showing {filtered.length} route{filtered.length === 1 ? '' : 's'}</div>}
      </section>

      <div className="mobile-route-list" aria-label="Waterfall routes for mobile">
        {loading ? <div className="loading-state"><span className="spinner" />Loading waterfall routes…</div> : filtered.length > 0 ? filtered.map(item => (
          <article className="mobile-route-card" key={item.id}>
            <div className="mobile-card-top">
              <span className={'status-badge ' + item.status}><span className="status-dot" />{item.status === 'published' ? 'Published' : 'Draft'}</span>
              <span className="mobile-location">{item.location}</span>
            </div>
            <h3>{item.name}</h3>
            {item.short_line && <p className="mobile-description">{item.short_line}</p>}
            <div className="mobile-meta"><span>Duration</span><strong>{item.duration}</strong></div>
            <div className="mobile-actions">
              <button type="button" className="action-button edit" onClick={() => openEditForm(item)}>Edit</button>
              <button type="button" className="action-button publish" disabled={saving || busyId === item.id} onClick={() => void toggleStatus(item)}>
                {busyId === item.id ? 'Updating…' : item.status === 'published' ? 'Move to draft' : 'Publish'}
              </button>
              <button type="button" className="action-button delete" disabled={saving || busyId === item.id} onClick={() => setDeleteTarget(item)}>Delete</button>
            </div>
          </article>
        )) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">{hasFilters ? '⌕' : '◇'}</div>
            <h3>{hasFilters ? 'No routes match your filters' : 'No waterfall routes yet'}</h3>
            <p>{hasFilters ? 'Try another search or clear the current filters.' : 'Add your first route to begin managing waterfall experiences.'}</p>
            {hasFilters
              ? <button type="button" className="button secondary" onClick={() => { setQuery(''); setStatus('all') }}>Clear filters</button>
              : <button type="button" className="button primary" onClick={openNewForm}>Add first route</button>}
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor() }}>
          <form className="editor-modal" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="waterfall-editor-title">
            <header className="modal-header">
              <div>
                <div className="eyebrow">ROUTE DETAILS</div>
                <h2 id="waterfall-editor-title">{editing.id ? 'Edit waterfall route' : 'Add waterfall route'}</h2>
                <p>Keep the details clear so visitors know what to expect.</p>
              </div>
              <button type="button" className="close-button" aria-label="Close editor" onClick={closeEditor}>×</button>
            </header>

            {formError && <div className="feedback failure form-feedback" role="alert">{formError}</div>}

            <div className="form-grid">
              <label className="form-field">
                <span>Route name <b>*</b></span>
                <input autoFocus required maxLength={160} value={editing.name ?? ''} onChange={event => setEditing(previous => previous ? { ...previous, name: event.target.value } : previous)} placeholder="e.g. Tamarind Falls" />
              </label>
              <label className="form-field">
                <span>Location <b>*</b></span>
                <input required maxLength={160} value={editing.location ?? ''} onChange={event => setEditing(previous => previous ? { ...previous, location: event.target.value } : previous)} placeholder="e.g. Henrietta, Mauritius" />
              </label>
              <label className="form-field">
                <span>Typical duration <b>*</b></span>
                <input required maxLength={80} value={editing.duration ?? ''} onChange={event => setEditing(previous => previous ? { ...previous, duration: event.target.value } : previous)} placeholder="e.g. 3–4 hours" />
                <small>Use the format visitors will understand.</small>
              </label>
              <label className="form-field">
                <span>Publishing status</span>
                <select value={editing.status ?? 'draft'} onChange={event => setEditing(previous => previous ? { ...previous, status: event.target.value as WaterfallStatus } : previous)}>
                  <option value="draft">Draft — hidden from visitors</option>
                  <option value="published">Published — visible on the site</option>
                </select>
              </label>
              <label className="form-field full-width">
                <span>Short description <small>Optional</small></span>
                <textarea rows={4} maxLength={500} value={editing.short_line ?? ''} onChange={event => setEditing(previous => previous ? { ...previous, short_line: event.target.value } : previous)} placeholder="Describe the route highlights and what makes it distinctive." />
                <small>{(editing.short_line ?? '').length}/500 characters</small>
              </label>
            </div>

            <div className="modal-note"><span aria-hidden="true">i</span><p><strong>No pricing is managed here.</strong> Waterfall enquiries are handled on request, so pricing is intentionally kept out of this form.</p></div>

            <footer className="modal-footer">
              <button type="button" className="button secondary" onClick={closeEditor} disabled={saving}>Cancel</button>
              <button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving route…' : editing.id ? 'Save changes' : 'Create route'}</button>
            </footer>
          </form>
        </div>
      )}

      {confirmDiscard && editing && (
        <div className="modal-backdrop discard-backdrop" role="presentation">
          <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-description">
            <div className="confirm-icon" aria-hidden="true">!</div>
            <h2 id="discard-title">Discard unsaved changes?</h2>
            <p id="discard-description">Your edits haven&apos;t been saved. You can return to the form or discard them.</p>
            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={() => setConfirmDiscard(false)}>Keep editing</button>
              <button type="button" className="button destructive" onClick={discardEditor}>Discard changes</button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop discard-backdrop" role="presentation">
          <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
            <div className="confirm-icon delete-icon" aria-hidden="true">!</div>
            <h2 id="delete-title">Delete this route?</h2>
            <p id="delete-description">“{deleteTarget.name}” will be permanently removed from route management. This cannot be undone.</p>
            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={() => setDeleteTarget(null)} disabled={saving}>Keep route</button>
              <button type="button" className="button destructive" onClick={() => void removeItem()} disabled={saving}>{saving ? 'Deleting…' : 'Delete route'}</button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .waterfalls-admin{--panel:#fffaf2;--panel-border:#e4ddd0;--muted:#6b665e;--surface:#f5f1e8;--ink:#211f1d;--accent:#c1440e;color:var(--ink);max-width:1180px;margin:0 auto;padding-bottom:64px}
        .page-header{margin-bottom:28px}.eyebrow{font-size:10px;letter-spacing:.14em;font-weight:800;color:var(--accent);text-transform:uppercase}
        .eyebrow span{color:#a59b8c;margin:0 7px}.page-heading-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-top:8px}
        .heading-copy h1{margin:0;font-family:'Big Shoulders Display',sans-serif;font-size:clamp(38px,4.6vw,54px);line-height:.98;text-transform:uppercase;letter-spacing:-.015em}
        .heading-copy p{margin:10px 0 0;max-width:620px;color:var(--muted);font-size:14px;line-height:1.6}
        .header-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
        .button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 15px;border:1px solid transparent;border-radius:3px;text-decoration:none;font-size:13px;font-weight:750;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}
        .button:focus-visible,.action-button:focus-visible,.close-button:focus-visible{outline:3px solid rgba(193,68,14,.3);outline-offset:2px}
        .button:disabled,.action-button:disabled{opacity:.55;cursor:not-allowed}
        .button.primary{background:var(--accent);color:#fffaf2}.button.primary:hover:not(:disabled){background:#a9380b}
        .button.secondary{background:var(--panel);border-color:#d4ccbf;color:var(--ink)}.button.secondary:hover:not(:disabled){background:#f0e9dc}
        .button.destructive{background:#a52f25;border-color:#a52f25;color:#fff}.button.destructive:hover:not(:disabled){background:#85251d}
        .summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .summary-card{position:relative;display:grid;gap:5px;align-content:start;min-height:124px;padding:19px 20px;background:var(--panel);border:1px solid var(--panel-border);border-radius:4px}
        .summary-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#b7ab97}.summary-card:nth-child(2):before{background:#23645c}.summary-card:nth-child(3):before{background:#8a8175}
        .summary-label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800}
        .summary-card strong{font-size:31px;line-height:1.1;font-weight:850;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
        .summary-caption{font-size:12px;color:var(--muted);line-height:1.45}
        .feedback{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;margin-bottom:14px;border-radius:3px;font-size:13px;line-height:1.5}
        .feedback>span:first-child{font-weight:900;flex:0 0 auto}.feedback button{margin-left:auto;border:0;background:transparent;color:inherit;font-size:18px;line-height:1;cursor:pointer}
        .feedback.success{background:#eaf3ed;border:1px solid #c6ddcc;color:#255940}.feedback.failure{background:#fbebe7;border:1px solid #e6c3bb;color:#8c2d21}
        .routes-section{background:var(--panel);border:1px solid var(--panel-border);border-radius:4px;overflow:hidden}
        .list-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px 18px;border-bottom:1px solid var(--panel-border)}
        .list-header h2{display:flex;align-items:center;gap:9px;font-size:20px;line-height:1.2;font-weight:850;margin:0}
        .list-header p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
        .count-pill{display:inline-flex;align-items:center;justify-content:center;min-width:25px;height:25px;padding:0 7px;border-radius:99px;background:#eee7db;color:#554d42;font-size:12px;font-weight:800}
        .list-total{color:var(--muted);font-size:12px;white-space:nowrap}
        .toolbar{display:grid;grid-template-columns:minmax(230px,1fr) minmax(170px,220px) auto;align-items:end;gap:12px;padding:16px 24px;background:#faf6ee;border-bottom:1px solid var(--panel-border)}
        .search-field{display:flex;align-items:center;gap:9px;min-width:0;height:44px;padding:0 12px;border:1px solid #d6cec1;border-radius:3px;background:white}
        .search-icon{font-size:22px;line-height:1;color:#81796d;transform:rotate(-15deg)}.search-field input{width:100%;min-width:0;border:0;outline:0!important;box-shadow:none!important;margin:0;padding:0;background:transparent;font-size:13px;color:var(--ink)}
        .search-field input::placeholder{color:#8b8479}.clear-search{border:0;background:transparent;font-size:18px;color:var(--muted);cursor:pointer}
        .status-filter{display:grid;gap:5px;font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.05em}
        .status-filter select{height:44px;width:100%;padding:0 11px;border:1px solid #d6cec1;border-radius:3px;background:#fff;color:var(--ink);font-size:13px;text-transform:none;letter-spacing:normal}
        .reset-filters{height:42px;padding:0 4px;border:0;background:transparent;color:#6a3827;text-decoration:underline;text-underline-offset:3px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}
        .table-wrap{width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}
        thead{background:#f8f4ec}th{padding:12px 18px;border-bottom:1px solid var(--panel-border);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#6b665e;font-weight:850;white-space:nowrap}
        td{padding:17px 18px;border-bottom:1px solid #eee7dc;vertical-align:middle;font-size:13px}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#fffdf8}
        td:first-child{min-width:240px;width:35%}td:last-child{width:1%;white-space:nowrap}
        .route-name{font-weight:800;font-size:14px;line-height:1.4}.route-description{max-width:440px;margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.5}
        .location-cell{color:#47423b;min-width:130px}.duration-cell{font-weight:650;white-space:nowrap}
        .status-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 9px;border:1px solid transparent;border-radius:99px;white-space:nowrap;font-size:10px;font-weight:850;letter-spacing:.035em}
        .status-badge.published{background:#e8f1eb;border-color:#d0e2d5;color:#245b41}.status-badge.draft{background:#eee9df;border-color:#ded5c7;color:#5d554a}
        .status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor}
        .row-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px}
        .action-button{padding:7px 10px;border:1px solid #d8d0c3;border-radius:3px;background:transparent;color:#34302a;font-size:11px;font-weight:750;white-space:nowrap;cursor:pointer;transition:background .15s}
        .action-button:hover:not(:disabled){background:#f3ede3}.action-button.publish{border-color:#bfd4c6;color:#225b41;background:#f7fbf8}.action-button.publish:hover:not(:disabled){background:#e7f2eb}
        .action-button.delete{border-color:#e4c5be;color:#9c3328}.action-button.delete:hover:not(:disabled){background:#fbebe7}
        .loading-state{min-height:220px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--muted);font-size:13px}
        .spinner{width:16px;height:16px;border:2px solid #d7ccbd;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .empty-state{display:flex;align-items:center;flex-direction:column;text-align:center;padding:60px 24px}
        .empty-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;background:#eee7dc;color:#766b5c;font-size:26px}
        .empty-state h3{margin:15px 0 0;font-size:17px;font-weight:850}.empty-state p{max-width:390px;margin:7px 0 18px;color:var(--muted);font-size:13px;line-height:1.55}
        .list-footer{padding:11px 24px;border-top:1px solid var(--panel-border);background:#faf6ee;color:var(--muted);font-size:11px}
        .mobile-route-list{display:none}
        .modal-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(24,22,19,.62);backdrop-filter:blur(3px)}
        .editor-modal,.confirm-modal{width:100%;max-height:min(90vh,900px);overflow:auto;background:var(--panel);border:1px solid #e3d9ca;border-radius:5px;box-shadow:0 24px 80px rgba(0,0,0,.24)}
        .editor-modal{max-width:720px;padding:28px}
        .modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-bottom:20px;border-bottom:1px solid var(--panel-border)}
        .modal-header h2{margin:6px 0 0;font-size:26px;line-height:1.1;font-weight:900;letter-spacing:-.025em}
        .modal-header p{margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
        .close-button{flex:0 0 auto;width:36px;height:36px;border:1px solid #d8d0c3;border-radius:3px;background:transparent;color:var(--ink);font-size:23px;line-height:1;cursor:pointer}
        .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 16px;padding:22px 0}
        .form-field{display:grid;align-content:start;gap:7px;color:#39352f;font-size:12px;font-weight:800}
        .form-field>span{display:flex;align-items:center;gap:6px}.form-field b{color:var(--accent)}.form-field small{font-size:11px;font-weight:500;color:var(--muted);line-height:1.45}
        .form-field input,.form-field select,.form-field textarea{width:100%;margin:0;padding:11px 12px;border:1px solid #d1c8ba;border-radius:3px;background:white;color:var(--ink);font:inherit;font-size:13px;font-weight:500;min-height:43px}
        .form-field textarea{resize:vertical;line-height:1.5}.form-field input:focus-visible,.form-field select:focus-visible,.form-field textarea:focus-visible{outline:3px solid rgba(193,68,14,.18);border-color:var(--accent)}
        .full-width{grid-column:1/-1}
        .modal-note{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:#f0e9dc;border-left:3px solid #b8a27b;color:#62594c}
        .modal-note>span{display:grid;place-items:center;flex:0 0 auto;width:19px;height:19px;border-radius:50%;background:#d5c7ac;color:#4f4432;font-size:12px;font-weight:900}
        .modal-note p{margin:0;font-size:12px;line-height:1.55}.modal-note strong{color:#433b30}
        .modal-footer{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;padding-top:20px;margin-top:20px;border-top:1px solid var(--panel-border)}
        .form-feedback{margin-top:18px;margin-bottom:0}
        .confirm-modal{max-width:440px;padding:26px}
        .confirm-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#f0e4d0;color:#75551c;font-weight:900}
        .confirm-icon.delete-icon{background:#f8e8e5;color:#9c3328}
        .confirm-modal h2{margin:16px 0 0;font-size:22px;font-weight:900}.confirm-modal p{margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.6;overflow-wrap:anywhere}
        .discard-backdrop{z-index:120}.confirm-modal .modal-footer{margin-top:22px}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:900px){.page-heading-row{align-items:flex-start;flex-direction:column}.header-actions{justify-content:flex-start}.toolbar{grid-template-columns:minmax(0,1fr) 200px}.reset-filters{justify-self:start}.row-actions{justify-content:flex-start;flex-wrap:wrap}}
        @media(max-width:680px){
          .waterfalls-admin{padding-bottom:36px}.page-header{margin-bottom:22px}.page-heading-row{gap:16px}.heading-copy h1{font-size:40px}.heading-copy p{font-size:13px}
          .header-actions{width:100%;display:grid;grid-template-columns:1fr 1fr}.header-actions .button{width:100%;padding-inline:10px}
          .summary-grid{gap:8px;margin-bottom:16px}.summary-card{min-height:100px;padding:14px 11px;gap:4px}.summary-label{font-size:9px;letter-spacing:.05em}.summary-card strong{font-size:26px}.summary-caption{font-size:10px;line-height:1.35}
          .routes-section{display:block;background:transparent;border:0;overflow:visible}.routes-section .list-header{padding:18px 0;border:0}.routes-section .table-wrap,.routes-section .list-footer{display:none}.mobile-route-list{display:grid;gap:12px}.toolbar{grid-template-columns:1fr;gap:11px;padding:14px;background:var(--panel);border:1px solid var(--panel-border);border-radius:4px}.search-field{height:46px}.status-filter{grid-template-columns:62px 1fr;align-items:center}.status-filter select{height:42px}.reset-filters{margin-top:-2px}
          .mobile-route-card{padding:17px;background:var(--panel);border:1px solid var(--panel-border);border-radius:4px;min-width:0}
          .mobile-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.mobile-location{font-size:11px;color:var(--muted);font-weight:650;text-align:right}
          .mobile-route-card h3{font-size:18px;line-height:1.35;margin:13px 0 0;font-weight:850}.mobile-description{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.6}
          .mobile-meta{display:flex;justify-content:space-between;gap:12px;padding:12px 0;margin-top:12px;border-top:1px solid var(--panel-border);border-bottom:1px solid var(--panel-border);font-size:12px}.mobile-meta span{color:var(--muted)}.mobile-meta strong{font-weight:800}
          .mobile-actions{display:flex;gap:6px;margin-top:13px}.mobile-actions .action-button{flex:1;padding:9px 6px;text-align:center;font-size:10px}
          .editor-modal{padding:20px;max-height:94vh}.modal-header h2{font-size:23px}.form-grid{grid-template-columns:1fr;gap:15px;padding:18px 0}.full-width{grid-column:auto}.modal-note{padding:11px}.modal-footer .button{flex:1}
          .confirm-modal{padding:22px}.confirm-modal .modal-footer{display:grid;grid-template-columns:1fr 1fr}.confirm-modal .button{padding-inline:10px;font-size:12px}
        }
        @media(prefers-reduced-motion:reduce){.spinner{animation:none}.button,.action-button{transition:none}}
      `}</style>
    </div>
  )
}
