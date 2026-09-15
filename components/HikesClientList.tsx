'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Hike } from '@/types/database'

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const getNumericDifficulty = (value?: string | null) => { const match = value?.match(/(\d+(?:\.\d+)?)\s*\/\s*10/); return match ? Number(match[1]) : null }
const getDurationHours = (value?: string | null) => { const match = value?.match(/(\d+(?:\.\d+)?)\s*(?:–|-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:hr|hour)/i); return match ? Number(match[2] || match[1]) : null }

export default function HikesClientList({ hikes }: { hikes: Hike[] }) {
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')

  const typeOptions = useMemo(() => ['all', ...Array.from(new Set(hikes.flatMap(h => h.experience_types || []).filter(Boolean)))], [hikes])
  const regionOptions = useMemo(() => ['all', ...Array.from(new Set(hikes.map(h => h.region).filter(Boolean) as string[]))], [hikes])

  const getDiffBadge = (diff: string, numeric?: string) => {
    const label = diff.charAt(0).toUpperCase() + diff.slice(1)
    const className = diff === 'easy' ? 'diff-easy' : diff === 'moderate' ? 'diff-moderate' : 'diff-challenging'
    return <span className={`diff ${className}`}>{label}{numeric ? ` · ${numeric}` : ''}</span>
  }

  const filteredHikes = useMemo(() => {
    const result = hikes.filter((hike) => {
      if (difficultyFilter !== 'all' && hike.difficulty.toLowerCase() !== difficultyFilter) return false
      if (typeFilter !== 'all' && !(hike.experience_types || []).includes(typeFilter)) return false
      if (regionFilter !== 'all' && hike.region !== regionFilter) return false
      const hours = getDurationHours(hike.duration)
      if (durationFilter === 'short' && (hours === null || hours > 2)) return false
      if (durationFilter === 'half' && (hours === null || hours <= 2 || hours > 4)) return false
      if (durationFilter === 'long' && (hours === null || hours <= 4)) return false
      return true
    })
    return [...result].sort((a, b) => sortBy === 'overall' ? (b.overall_rating ?? 0) - (a.overall_rating ?? 0) : sortBy === 'scenery' ? (b.scenery_rating ?? 0) - (a.scenery_rating ?? 0) : 0)
  }, [hikes, difficultyFilter, typeFilter, durationFilter, regionFilter, sortBy])

  const getSvgVisual = (index: number) => {
    const paths = ['M0,120 L40,60 L70,90 L110,30 L140,75 L200,50 L200,140 L0,140Z','M0,130 L30,80 L60,110 L100,40 L130,95 L170,60 L200,90 L200,140 L0,140Z','M0,110 L50,50 L80,85 L120,20 L150,70 L200,40 L200,140 L0,140Z','M0,125 L35,70 L65,100 L105,35 L135,80 L200,45 L200,140 L0,140Z','M0,115 L45,55 L75,80 L115,25 L145,65 L200,35 L200,140 L0,140Z']
    return <svg viewBox="0 0 200 140" aria-hidden="true"><path d={paths[index % paths.length]} fill="#1F4B4C" /></svg>
  }

  return <div className="wrap">
    <section className="hike-intro-grid" aria-label="How Peak Axis hikes work">
      <div><span>01</span><strong>Choose your terrain</strong><p>Filter by difficulty, experience, duration or region and find a route that fits your day.</p></div>
      <div><span>02</span><strong>Check the essentials</strong><p>Every listing shows practical route information where Peak Axis has confirmed it.</p></div>
      <div><span>03</span><strong>Ask or book</strong><p>Choose a scheduled group hike when a date is published, or enquire for an on-demand or private route.</p></div>
    </section>

    <div className="filters">
      {['all', 'easy', 'moderate', 'challenging'].map(value => <button key={value} className={`fbtn ${difficultyFilter === value ? 'active' : ''}`} onClick={() => setDifficultyFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
      <select aria-label="Filter by experience" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>{typeOptions.map(type => <option key={type} value={type}>{type === 'all' ? 'All experiences' : type}</option>)}</select>
      <select aria-label="Filter by duration" value={durationFilter} onChange={e => setDurationFilter(e.target.value)}><option value="all">All durations</option><option value="short">Up to 2 hours</option><option value="half">2–4 hours</option><option value="long">Over 4 hours</option></select>
      <select aria-label="Filter by region" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>{regionOptions.map(region => <option key={region} value={region}>{region === 'all' ? 'All regions' : region}</option>)}</select>
      <select aria-label="Sort hikes" value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="created">Sort: Default</option><option value="overall">Peak Axis rating ↓</option><option value="scenery">Scenery rating ↓</option></select>
    </div>

    <div className="private-banner"><div><span className="banner-kicker">PRIVATE ADVENTURE</span><h2>Want your own trail, your own date?</h2><p>Book a private hike for your group — choose the trail and preferred date instead of joining a scheduled group.</p></div><Link href="/enquire?interest=private_hike" className="btn-ghost">Book a private hike</Link></div>

    <div className="hike-list" id="hikeList">
      {filteredHikes.map((hike, idx) => {
        const isLowSpots = (hike.spots_remaining ?? 0) <= 4 && (hike.spots_remaining ?? 0) > 0
        const detailHref = `/hikes/${slugify(hike.name)}`
        const available = hike.booking_type !== 'scheduled_group' || (hike.spots_remaining ?? 0) > 0
        const bookingLabel = hike.booking_type === 'scheduled_group' ? 'Scheduled group hike' : hike.booking_type === 'private' ? 'Private / on-demand' : 'On-demand hike'
        return <article key={hike.id} className="hike-row">
          <Link href={detailHref} className="hike-visual" aria-label={`View ${hike.name}`}>{getSvgVisual(idx)}</Link>
          <div className="hike-info"><div className="hike-info-top"><span className="hike-kicker">MAURITIUS · GUIDED HIKE</span>{isLowSpots && <span className="availability-hot">Limited places</span>}</div>
            <h3><Link href={detailHref}>{hike.name}</Link></h3>
            <div className="hike-meta">{getDiffBadge(hike.difficulty, hike.difficulty_numeric)}<span>{hike.hike_type}</span><span>{hike.duration}</span><span>{hike.location}</span></div>
            <div className="booking-label">{bookingLabel}</div>
            {hike.main_attraction && <p className="hike-attraction">{hike.main_attraction}</p>}
            {hike.description && <p className="hike-description">{hike.description}</p>}
            {(hike.overall_rating != null || hike.scenery_rating != null) && <div className="hike-ratings">{hike.scenery_rating != null && <span>Scenery <strong>{hike.scenery_rating}/10</strong></span>}{hike.overall_rating != null && <span>{hike.rating_label || 'Peak Axis rating'} <strong>{hike.overall_rating}/10</strong></span>}</div>}
            <Link href={detailHref} className="detail-link">View hike details →</Link>
          </div>
          <div className="hike-action"><span className="action-label">GROUP RATE</span><div className="hike-price">{hike.price_group_usd != null ? `$${hike.price_group_usd}` : hike.price}<span>{hike.price_group_usd != null ? '/person' : ''}</span></div>{hike.price_solo_usd != null && <div className="solo-rate">Solo ${hike.price_solo_usd}</div>}{hike.booking_type === 'scheduled_group' && <div className={`spots ${isLowSpots ? 'low' : ''}`}>{available ? `${hike.spots_remaining} spots left` : 'Fully booked'}</div>}<Link href={available ? `/enquire?interest=hike&ref=${encodeURIComponent(hike.name)}` : '/enquire?interest=private_hike'} className="btn-primary">{available ? 'Enquire / book' : 'Ask about a private hike'}</Link></div>
        </article>
      })}
      {filteredHikes.length === 0 && <p className="hike-empty">No hikes match the selected filters.</p>}
    </div>

    <style>{`.hike-intro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--sand-line);border:1px solid var(--sand-line);margin:54px 0 34px}.hike-intro-grid>div{background:var(--warm-white);padding:24px}.hike-intro-grid span{display:block;color:var(--ember);font:800 12px/1 var(--font-display),sans-serif;letter-spacing:.12em;margin-bottom:18px}.hike-intro-grid strong{display:block;font:700 20px/1.1 var(--font-display),sans-serif;text-transform:uppercase}.hike-intro-grid p{margin:10px 0 0;color:#5a564f;font-size:13.5px;line-height:1.55}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 22px}.filters select,.fbtn{border:1px solid var(--sand-line);background:var(--warm-white);padding:10px 13px;font:600 12px/1.1 inherit;cursor:pointer}.fbtn.active{background:var(--teal);color:var(--warm-white);border-color:var(--teal)}.private-banner{display:flex;align-items:center;justify-content:space-between;gap:28px;background:var(--teal);color:var(--warm-white);padding:28px 30px;margin-bottom:30px}.banner-kicker,.hike-kicker,.action-label{display:block;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.banner-kicker{color:#d9caa8;margin-bottom:8px}.private-banner h2{font:700 27px/1 var(--font-display),sans-serif;text-transform:uppercase}.private-banner p{margin:8px 0 0;color:#d7d9d1;max-width:620px;font-size:13.5px;line-height:1.5}.private-banner .btn-ghost{white-space:nowrap;border-color:#d9caa8;color:var(--warm-white)}.hike-row{display:grid;grid-template-columns:180px minmax(0,1fr) 190px;gap:24px;padding:24px 0;border-top:1px solid var(--sand-line);align-items:stretch}.hike-visual{display:block;background:#e7e1d2;min-height:150px;overflow:hidden}.hike-visual svg{width:100%;height:100%;display:block}.hike-info-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.hike-kicker{color:var(--ember)}.availability-hot{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--ember)}.hike-info h3{margin:7px 0 10px;font:700 clamp(28px,3vw,40px)/.95 var(--font-display),sans-serif;text-transform:uppercase}.hike-info h3 a{text-decoration:none;color:inherit}.hike-meta{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12px;color:#625e56}.diff{font-weight:800}.diff-easy{color:var(--teal)}.diff-moderate{color:#9a700d}.diff-challenging{color:var(--ember)}.booking-label{display:inline-block;margin-top:10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#5a564f}.hike-attraction{margin:9px 0 0;font-size:14px;font-weight:700}.hike-description{margin:7px 0 0;color:#5a564f;font-size:13.5px;line-height:1.55}.hike-ratings{display:flex;gap:18px;margin-top:11px;font-size:11px;color:#716c63;text-transform:uppercase;letter-spacing:.04em}.hike-ratings strong{color:#2f2c28}.detail-link{display:inline-block;margin-top:13px;font-size:12px;font-weight:800;color:inherit}.hike-action{border-left:1px solid var(--sand-line);padding-left:22px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}.action-label{color:#716c63}.hike-price{font:700 34px/1 var(--font-display),sans-serif;margin-top:6px}.hike-price span{font:500 12px/1 inherit}.solo-rate{font-size:11px;color:#6a655d;margin-top:5px}.spots{margin-top:14px;font-size:11px;font-weight:700;color:#6a655d}.spots.low{color:var(--ember)}.hike-action .btn-primary{margin-top:12px;width:100%;text-align:center}.hike-empty{text-align:center;color:#5a564f;padding:50px 0;border-top:1px solid var(--sand-line)}@media(max-width:900px){.hike-row{grid-template-columns:140px minmax(0,1fr)}.hike-action{grid-column:2;border-left:0;border-top:1px solid var(--sand-line);padding:16px 0 0;display:grid;grid-template-columns:1fr 1fr;column-gap:16px}.hike-action .action-label,.hike-action .hike-price,.hike-action .solo-rate,.hike-action .spots{grid-column:1}.hike-action .btn-primary{grid-column:2;grid-row:1/5;margin-top:0;align-self:center}.hike-intro-grid{grid-template-columns:1fr}}@media(max-width:620px){.hike-row{grid-template-columns:1fr;gap:15px}.hike-visual{min-height:125px}.hike-action{grid-column:1;grid-template-columns:1fr}.hike-action .btn-primary{grid-column:1;grid-row:auto;margin-top:12px}.private-banner{align-items:flex-start;flex-direction:column;padding:24px}.hike-info h3{font-size:31px}.hike-ratings{gap:12px}.filters{overflow:auto;flex-wrap:nowrap;padding-bottom:4px}.fbtn{flex:0 0 auto}.filters select{flex:0 0 auto}}`}</style>
  </div>
}
