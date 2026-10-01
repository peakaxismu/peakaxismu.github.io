import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HikeDetailContent from '@/components/HikeDetailContent'

export const revalidate = 0
type Props = { params: Promise<{ id: string }> }

const formatDate=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString('en-MU',{weekday:'long',day:'numeric',month:'long',year:'numeric'})

async function getDeparture(id:string){
  const supabase=await createClient()
  const {data}=await supabase.from('scheduled_hikes').select('id,hike_id,date,price,spots_total,spots_remaining,status,trail_condition_status,trail_condition_note,hikes!inner(*)').eq('id',id).eq('status','published').eq('hikes.status','published').maybeSingle()
  if(!data)return null
  const hike=Array.isArray(data.hikes)?data.hikes[0]:data.hikes
  if(!hike)return null
  const {data:media}=await supabase.from('hike_media').select('id,hike_id,image_url,is_main,sort_order').eq('hike_id',data.hike_id).order('is_main',{ascending:false}).order('sort_order',{ascending:true})
  return {...data,hike,media:media||[]}
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {id}=await params
  const departure=await getDeparture(id)
  if(!departure)return{title:'Scheduled hike not found | Peak Axis'}
  return{title:`${departure.hike.name} — ${formatDate(departure.date)} | Peak Axis Mauritius`,description:`Scheduled group hike: ${departure.hike.name} on ${formatDate(departure.date)}.`}
}

export default async function ScheduledHikePage({params}:Props){
  const {id}=await params
  const departure=await getDeparture(id)
  if(!departure)notFound()
  return <HikeDetailContent hike={departure.hike} media={departure.media} scheduled={{id:departure.id,date:departure.date,price:departure.price,spots_total:departure.spots_total,spots_remaining:departure.spots_remaining,trail_condition_status:departure.trail_condition_status,trail_condition_note:departure.trail_condition_note}}/>
}
