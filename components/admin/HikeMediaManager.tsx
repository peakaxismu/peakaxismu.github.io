'use client'

import { useEffect, useState } from 'react'

interface Media { id: string; image_url: string; is_main: boolean; created_at: string }

export default function HikeMediaManager({ hikeId }: { hikeId: string }) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hike-media?hikeId=${encodeURIComponent(hikeId)}`)
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Could not load photos')
      setMedia(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load photos')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [hikeId]) // eslint-disable-line react-hooks/set-state-in-effect

  const upload = async (files: FileList | null, isMain: boolean) => {
    if (!files?.length) return
    setUploading(true); setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('hikeId', hikeId)
        form.append('isMain', String(isMain))
        form.append('file', file)
        const response = await fetch('/api/admin/hike-media', { method: 'POST', body: form })
        const json = await response.json()
        if (!response.ok) throw new Error(json.error || 'Upload failed')
        if (isMain) isMain = false
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this photo?')) return
    setError('')
    const response = await fetch('/api/admin/hike-media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) setError(json.error || 'Could not delete photo')
    else setMedia((current) => current.filter((item) => item.id !== id))
  }

  return <section style={{ marginTop: 22, borderTop: '1px solid var(--sand-line)', paddingTop: 18 }}>
    <h3 style={{ margin: '0 0 5px', fontSize: 18, textTransform: 'uppercase' }}>Photos</h3>
    <p style={{ margin: '0 0 14px', color: '#777168', fontSize: 12 }}>Upload one main cover image and as many gallery photos as you need. JPG, PNG or WebP up to 12 MB.</p>
    {error && <div style={{ marginBottom: 12, padding: 10, background: '#f7e7df', color: '#8f3215', fontSize: 12 }}>{error}</div>}
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <label style={buttonStyle}>{uploading ? 'Uploading…' : 'Upload main image'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={(e) => { void upload(e.target.files, true); e.currentTarget.value = '' }} /></label>
      <label style={buttonStyle}>{uploading ? 'Uploading…' : 'Add gallery photos'}<input hidden multiple type="file" accept="image/*" disabled={uploading} onChange={(e) => { void upload(e.target.files, false); e.currentTarget.value = '' }} /></label>
    </div>
    {loading ? <p style={{ fontSize: 12, color: '#777168' }}>Loading photos…</p> : media.length === 0 ? <p style={{ fontSize: 12, color: '#777168' }}>No photos uploaded yet.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
      {media.map((item) => <div key={item.id} style={{ border: '1px solid var(--sand-line)', background: '#f3f0e8' }}>
        <img src={item.image_url} alt="" style={{ display: 'block', width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{item.is_main ? 'Main image' : 'Gallery'}</span>
          <button type="button" onClick={() => void remove(item.id)} style={{ border: 0, background: 'transparent', color: 'var(--ember)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>)}
    </div>}
  </section>
}

const buttonStyle = { display: 'inline-flex', alignItems: 'center', padding: '10px 13px', background: 'var(--ember)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }
