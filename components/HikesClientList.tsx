'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Hike {
  id: string
  name: string
  difficulty: string
  date: string
  duration: string
  location: string
  price: string
  spots_total: number
  spots_remaining: number
  description: string | null
}

export default function HikesClientList({ hikes }: { hikes: Hike[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filteredHikes = hikes.filter((hike) => {
    if (filter === 'all') return true
    return hike.difficulty.toLowerCase() === filter.toLowerCase()
  })

  // Helper for difficulty class and label
  const getDiffBadge = (diff: string) => {
    const d = diff.toLowerCase()
    if (d === 'easy') return <span className="diff diff-easy">Easy</span>
    if (d === 'moderate') return <span className="diff diff-moderate">Moderate</span>
    return <span className="diff diff-challenging">Challenging</span>
  }

  // Helper for mountain SVG background visual based on name or index
  const getSvgVisual = (index: number) => {
    const paths = [
      'M0,120 L40,60 L70,90 L110,30 L140,75 L200,50 L200,140 L0,140Z',
      'M0,130 L30,80 L60,110 L100,40 L130,95 L170,60 L200,90 L200,140 L0,140Z',
      'M0,110 L50,50 L80,85 L120,20 L150,70 L200,40 L200,140 L0,140Z',
      'M0,125 L35,70 L65,100 L105,35 L135,80 L200,45 L200,140 L0,140Z',
      'M0,115 L45,55 L75,80 L115,25 L145,65 L200,35 L200,140 L0,140Z',
    ]
    const path = paths[index % paths.length]
    return (
      <svg viewBox="0 0 200 140">
        <path d={path} fill="#1F4B4C" />
      </svg>
    )
  }

  return (
    <div className="wrap">
      <div className="filters">
        <button
          className={`fbtn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`fbtn ${filter === 'easy' ? 'active' : ''}`}
          onClick={() => setFilter('easy')}
        >
          Easy
        </button>
        <button
          className={`fbtn ${filter === 'moderate' ? 'active' : ''}`}
          onClick={() => setFilter('moderate')}
        >
          Moderate
        </button>
        <button
          className={`fbtn ${filter === 'challenging' ? 'active' : ''}`}
          onClick={() => setFilter('challenging')}
        >
          Challenging
        </button>
      </div>

      <div className="private-banner">
        <div>
          <h3>Want your own trail, your own date?</h3>
          <p>
            Book a private hike for your group — choose the trail and preferred date instead of joining a scheduled one.
          </p>
        </div>
        <Link href="/enquire?interest=private_hike" className="btn-ghost">
          Book a private hike
        </Link>
      </div>

      <div className="hike-list" id="hikeList">
        {filteredHikes.map((hike, idx) => {
          const isLowSpots = hike.spots_remaining <= 4 && hike.spots_remaining > 0
          return (
            <div key={hike.id} className="hike-row" data-diff={hike.difficulty.toLowerCase()}>
              <div className="hike-visual">{getSvgVisual(idx)}</div>
              <div className="hike-info">
                <h3>{hike.name}</h3>
                <div className="hike-meta">
                  {getDiffBadge(hike.difficulty)}
                  <span>📅 {hike.date}</span>
                  <span>⏱ {hike.duration}</span>
                  <span>📍 {hike.location}</span>
                </div>
                {hike.description && (
                  <p style={{ marginTop: '8px', fontSize: '13.5px', color: '#5a564f' }}>
                    {hike.description}
                  </p>
                )}
              </div>
              <div className="hike-action">
                <div className="hike-price">{hike.price}</div>
                <div className={`spots ${isLowSpots ? 'low' : ''}`}>
                  {hike.spots_remaining > 0 ? `${hike.spots_remaining} spots left` : 'Fully booked'}
                </div>
                <Link
                  href={`/enquire?interest=hike&ref=${encodeURIComponent(hike.name)}`}
                  className="btn-primary"
                >
                  Book your spot
                </Link>
              </div>
            </div>
          )
        })}

        {filteredHikes.length === 0 && (
          <p style={{ padding: '40px 0', textAlign: 'center', color: '#5a564f' }}>
            No hikes match the selected difficulty level.
          </p>
        )}
      </div>
    </div>
  )
}
