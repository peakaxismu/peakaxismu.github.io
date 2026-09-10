'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Hike { id: string; name: string; difficulty: string; date: string; duration: string; location: string; price: string; spots_remaining: number }
interface Expedition { id: string; slug: string; name: string; destination: string; duration_days: number; price_from: string; next_departure: string; description: string }
interface TeamBuilding { id: string; name: string; type: string; description: string }

export default function HomeClientPillars({ hikes, expedition, teamBuilding }: { hikes: Hike[]; expedition: Expedition | null; teamBuilding: TeamBuilding[] }) {
  const [activeTab, setActiveTab] = useState<'hikes' | 'expeditions' | 'team' | 'activities'>('hikes')
  const outdoorTeam = teamBuilding.filter((t) => t.type === 'outdoor')
  const indoorActivities = teamBuilding.filter((t) => t.type === 'indoor')

  const tabs = [
    ['hikes', '01', 'GROUP HIKES'],
    ['expeditions', '02', 'EXPEDITIONS'],
    ['team', '03', 'TEAM BUILDING'],
    ['activities', '04', 'ACTIVITIES'],
  ] as const

  return (
    <section className="pillars">
      <div className="wrap">
        <div className="tab-row" role="tablist" aria-label="Experience Pillars">
          {tabs.map(([tab, number, label]) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="code">{number}</span> {label}
            </button>
          ))}
        </div>

        <div id="panel-hikes" role="tabpanel" aria-labelledby="tab-hikes" className={`panel ${activeTab === 'hikes' ? 'active' : ''}`} hidden={activeTab !== 'hikes'}>
          <div className="p-left">
            <h2>Group hikes across Mauritius, most weekends.</h2>
            <p>Join guided group walks through Mauritius’ mountain ranges and nature reserves. We handle navigation, safety, and pacing so you can focus on the trail.</p>
            <div className="p-ctas"><Link href="/hikes" className="btn-primary">View all upcoming hikes</Link><Link href="/enquire?interest=private_hike" className="btn-ghost">Book a private hike</Link></div>
          </div>
          <div className="p-right"><div className="card-list">{hikes.slice(0, 3).map((hike) => <div key={hike.id} className="mini-card"><div className="tag">SCHEDULED</div><h3>{hike.name}</h3><div className="meta"><span>{hike.date}</span> · <span>{hike.duration}</span> · <span>{hike.price}</span></div></div>)}</div></div>
        </div>

        <div id="panel-expeditions" role="tabpanel" aria-labelledby="tab-expeditions" className={`panel ${activeTab === 'expeditions' ? 'active' : ''}`} hidden={activeTab !== 'expeditions'}>
          <div className="p-left">
            <h2>Réunion&apos;s volcanoes, one expedition at a time.</h2>
            <p>Multi-day wilderness journeys beyond Mauritius. Crossing active calderas, lava fields, and high altitude trails with full mountain logistics and certified guides.</p>
            <div className="p-ctas"><Link href="/expeditions/piton-de-la-fournaise" className="btn-primary">Explore Piton de la Fournaise</Link></div>
          </div>
          <div className="p-right">{expedition && <div className="feat-box"><span className="badge">NEXT EXPEDITION</span><h3>{expedition.name}</h3><div className="dest">{expedition.destination} · {expedition.duration_days} days</div><p className="desc">{expedition.description?.substring(0, 140)}...</p><div className="foot"><span>Departure: {expedition.next_departure}</span><span className="price">From {expedition.price_from}</span></div></div>}</div>
        </div>

        <div id="panel-team" role="tabpanel" aria-labelledby="tab-team" className={`panel ${activeTab === 'team' ? 'active' : ''}`} hidden={activeTab !== 'team'}>
          <div className="p-left"><h2>Teams work better after they&apos;ve climbed something together.</h2><p>Custom outdoor challenges designed for company teams. From ridge walks to orientering tasks that build trust, clear minds, and test problem-solving outside the office.</p><div className="p-ctas"><Link href="/enquire?interest=team" className="btn-primary">Enquire for your team</Link></div></div><div className="p-right"><div className="card-list">{outdoorTeam.slice(0, 3).map((pkg) => <div key={pkg.id} className="mini-card"><div className="tag">OUTDOOR</div><h3>{pkg.name}</h3><div className="meta">{pkg.description}</div></div>)}</div></div>
        </div>

        <div id="panel-activities" role="tabpanel" aria-labelledby="tab-activities" className={`panel ${activeTab === 'activities' ? 'active' : ''}`} hidden={activeTab !== 'activities'}>
          <div className="p-left"><h2>Indoor and outdoor, for any group.</h2><p>Tailored group experiences — half-day workshops, nature walks, and adventure sessions for schools, clubs, or private gatherings.</p><div className="p-ctas"><Link href="/enquire?interest=activity" className="btn-primary">Plan a custom activity</Link></div></div><div className="p-right"><div className="card-list">{indoorActivities.slice(0, 3).map((act) => <div key={act.id} className="mini-card"><div className="tag">INDOOR / OUTDOOR</div><h3>{act.name}</h3><div className="meta">{act.description}</div></div>)}</div></div>
        </div>
      </div>
    </section>
  )
}
