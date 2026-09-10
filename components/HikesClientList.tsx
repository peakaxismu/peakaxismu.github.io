'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Hike } from '@/types/database'

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function HikesClientList({ hikes }: { hikes: Hike[] }) {
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [intensityFilter, setIntensityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const typeOptions = ['all', 'mountain', 'waterfall', 'exploration', 'swim', 'viewpoint']
  const getNumericDifficulty = (value: string) => { const match = value.match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return match ? Number(match[1]) : null }
  const getDiffBadge = (diff: string, numeric: string) => { const d = diff.toLowerCase(); const className = d === 'easy' ? 'diff-easy' : d === 'moderate' ? 'diff-moderate' : 'diff-challenging'; const label = d === 'easy' ? 'Easy' : d === 'moderate' ? 'Moderate' : 'Challenging'; return <span className={`diff ${className}`}>{label} · {numeric}</span> }
  const filteredHikes = useMemo(() => {
    const result = hikes.filter((hike) => { if (difficultyFilter !== 'all' && hike.difficulty.toLowerCase() !== difficultyFilter) return false; if (typeFilter !== 'all' && !hike.hike_type.toLowerCase().includes(typeFilter)) return false; const numeric = getNumericDifficulty(hike.difficulty_numeric); if (intensityFilter === 'easy' && (numeric === null || numeric > 4)) return false; if (intensityFilter === 'moderate' && (numeric === null || numeric < 5 || numeric > 6)) return false; if (intensityFilter === 'challenging' && (numeric === null || numeric < 7)) return false; return true })
    return [...result].sort((a, b) => { if (sortBy === 'overall') return b.overall_rating - a.overall_rating; if (sortBy === 'scenery') return b.scenery_rating - a.scenery_rating; return 0 })
  }, [hikes, difficultyFilter, typeFilter, intensityFilter, sortBy])
  const getSvgVisual = (index: number) => { const paths = ['M0,120 L40,60 L70,90 L110,30 L140,75 L200,50 L200,140 L0,140Z','M0,130 L30,80 L60,110 L100,40 L130,95 L170,60 L200,90 L200,140 L0,140Z','M0,110 L50,50 L80,85 L120,20 L150,70 L200,40 L200,140 L0,140Z','M0,125 L35,70 L65,100 L105,35 L135,80 L200,45 L200,140 L0,140Z','M0,115 L45,55 L75,80 L115,25 L145,65 L200,35 L200,140 L0,140Z']; return <svg viewBox="0 0 200 140" aria-hidden="true"><path d={paths[index % paths.length]} fill="#1F4B4C" /></svg> }

  return <div className="wrap">
    <div className="filters">
      {['all','easy','moderate','challenging'].map((value) => <button key={value} className={`fbtn ${difficultyFilter === value ? 'active' : ''}`} onClick={() => setDifficultyFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
      <select aria-label="Filter by hike type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>{typeOptions.map((type) => <option key={type} value={type}>{type === 'all' ? 'All types' : type[0].toUpperCase() + type.slice(1)}</option>)}</select>
      <select aria-label="Filter by intensity" value={intensityFilter} onChange={(e) => setIntensityFilter(e.target.value)}><option value="all">All intensity</option><option value="easy">1–4 / 10</option><option value="moderate">5–6 / 10</option><option value="challenging">7–10 / 10</option></select>
      <select aria-label="Sort hikes" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="created">Sort: Default</option><option value="overall">Overall rating ↓</option><option value="scenery">Scenery rating ↓</option></select>
    </div>
    <div className="private-banner"><div><h2>Want your own trail, your own date?</h2><p>Book a private hike for your group — choose the trail and preferred date instead of joining a scheduled one.</p></div><Link href="/enquire?interest=private_hike" className="btn-ghost">Book a private hike</Link></div>
    <div className="hike-list" id="hikeList">
      {filteredHikes.map((hike, idx) => { const isLowSpots = (hike.spots_remaining ?? 0) <= 4 && (hike.spots_remaining ?? 0) > 0; const detailHref = `/hikes/${slugify(hike.name)}`; return <div key={hike.id} className="hike-row" data-diff={hike.difficulty.toLowerCase()}>
        <Link href={detailHref} className="hike-visual" aria-label={`View ${hike.name}`} >{getSvgVisual(idx)}</Link>
        <div className="hike-info"><h3><Link href={detailHref}>{hike.name}</Link></h3><div className="hike-meta">{getDiffBadge(hike.difficulty, hike.difficulty_numeric)}<span>🏷️ {hike.hike_type}</span><span>📅 {hike.date}</span><span>⏱ {hike.duration}</span><span>📍 {hike.location}</span></div><div style={{ marginTop: '9px', fontSize: '13px', fontWeight: 700 }}>✨ {hike.main_attraction}</div><div style={{ display: 'flex', gap: '12px', marginTop: '7px', fontSize: '13px' }}><span>🏔️ Scenery: <strong>{hike.scenery_rating}/10</strong></span><span>⭐ Overall: <strong>{hike.overall_rating}/10</strong></span></div>{hike.description && <p style={{ marginTop: '8px', fontSize: '13.5px', color: '#5a564f' }}>{hike.description}</p>}<Link href={detailHref} style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>View hike details →</Link></div>
        <div className="hike-action"><div className="hike-price">From ${hike.price_group_usd}/person</div><div style={{ fontSize: '12px', color: '#5a564f' }}>Solo ${hike.price_solo_usd} · Group (2+) ${hike.price_group_usd}/person</div><div className={`spots ${isLowSpots ? 'low' : ''}`}>{(hike.spots_remaining ?? 0) > 0 ? `${hike.spots_remaining} spots left` : 'Fully booked'}</div><Link href={`/enquire?interest=hike&ref=${encodeURIComponent(hike.name)}`} className="btn-primary">Book your spot</Link></div>
      </div> })}
      {filteredHikes.length === 0 && <p style={{ padding: '40px 0', textAlign: 'center', color: '#5a564f' }}>No hikes match the selected filters.</p>}
    </div>
  </div>
}
