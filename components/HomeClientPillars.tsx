'use client'

import { useState } from 'react'
import Link from 'next/link'
interface Hike { id:string; name:string; difficulty:string; date:string; duration:string; location:string; price:string; spots_remaining:number }
interface Expedition { id:string; slug:string; name:string; destination:string; duration_days:number; price_from:string; next_departure:string; description:string }
interface TeamBuilding { id:string; name:string; type:string; description:string }
interface Copy { hikes_title:string; hikes_body:string; hikes_primary_cta:string; hikes_primary_url:string; hikes_secondary_cta:string; hikes_secondary_url:string; expeditions_title:string; expeditions_body:string; expeditions_cta:string; expeditions_url:string; team_title:string; team_body:string; team_cta:string; team_url:string; activities_title:string; activities_body:string; activities_cta:string; activities_url:string }
export default function HomeClientPillars({ hikes, expedition, teamBuilding, copy }: { hikes:Hike[]; expedition:Expedition|null; teamBuilding:TeamBuilding[]; copy:Copy }) {
  const [activeTab,setActiveTab]=useState<'hikes'|'expeditions'|'team'|'activities'>('hikes')
  const outdoorTeam=teamBuilding.filter(t=>t.type==='outdoor'), indoorActivities=teamBuilding.filter(t=>t.type==='indoor')
  const tabs=[['hikes','01','GROUP HIKES'],['expeditions','02','EXPEDITIONS'],['team','03','TEAM BUILDING'],['activities','04','ACTIVITIES']] as const
  const panels=[
    ['hikes',copy.hikes_title,copy.hikes_body,copy.hikes_primary_cta,copy.hikes_primary_url,copy.hikes_secondary_cta,copy.hikes_secondary_url],
    ['expeditions',copy.expeditions_title,copy.expeditions_body,copy.expeditions_cta,copy.expeditions_url,'',''],
    ['team',copy.team_title,copy.team_body,copy.team_cta,copy.team_url,'',''],
    ['activities',copy.activities_title,copy.activities_body,copy.activities_cta,copy.activities_url,'',''],
  ] as const
  return <section className="pillars"><div className="wrap"><div className="tab-row" role="tablist" aria-label="Experience Pillars">{tabs.map(([tab,number,label])=><button key={tab} id={`tab-${tab}`} role="tab" aria-selected={activeTab===tab} aria-controls={`panel-${tab}`} className={`tab-btn ${activeTab===tab?'active':''}`} onClick={()=>setActiveTab(tab)}><span className="code">{number}</span> {label}</button>)}</div>
    {panels.map(([tab,title,body,cta,url,secondary,secondaryUrl])=><div key={tab} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={`panel ${activeTab===tab?'active':''}`} hidden={activeTab!==tab}><div className="p-left"><h2>{title}</h2><p>{body}</p><div className="p-ctas"><Link href={url} className="btn-primary">{cta}</Link>{secondary&&<Link href={secondaryUrl} className="btn-ghost">{secondary}</Link>}</div></div><div className="p-right">{tab==='hikes'&&<div className="card-list">{hikes.slice(0,3).map(h=><div key={h.id} className="mini-card"><div className="tag">SCHEDULED</div><h3>{h.name}</h3><div className="meta"><span>{h.date}</span> · <span>{h.duration}</span> · <span>{h.price}</span></div></div>)}</div>}{tab==='expeditions'&&expedition&&<div className="feat-box"><span className="badge">NEXT EXPEDITION</span><h3>{expedition.name}</h3><div className="dest">{expedition.destination} · {expedition.duration_days} days</div><p className="desc">{expedition.description?.substring(0,140)}{expedition.description?.length>140?'...':''}</p><div className="foot"><span>Departure: {expedition.next_departure}</span><span className="price">From {expedition.price_from}</span></div></div>}{tab==='team'&&<div className="card-list">{outdoorTeam.slice(0,3).map(p=><div key={p.id} className="mini-card"><div className="tag">OUTDOOR</div><h3>{p.name}</h3><div className="meta">{p.description}</div></div>)}</div>}{tab==='activities'&&<div className="card-list">{indoorActivities.slice(0,3).map(p=><div key={p.id} className="mini-card"><div className="tag">INDOOR / OUTDOOR</div><h3>{p.name}</h3><div className="meta">{p.description}</div></div>)}</div>}</div></div>)}
  </div></section>
}
