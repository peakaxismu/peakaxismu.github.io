import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hike } from '@/types/database'
import HikeDetailContent from '@/components/HikeDetailContent'

export const revalidate = 0
type Props = { params: Promise<{ slug: string }> }

const slugify=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'-')

async function getData(slug:string){
  const supabase=await createClient()
  const [{data:hikes},{data:media}]=await Promise.all([
    supabase.from('hikes').select('*').eq('status','published').order('created_at',{ascending:true}),
    supabase.from('hike_media').select('id,hike_id,image_url,is_main,sort_order').order('is_main',{ascending:false}).order('sort_order',{ascending:true}),
  ])
  return {hike:(hikes||[]).find((h:Hike)=>slugify(h.name)===slug) as Hike|undefined,media:media||[]}
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params
  const {hike}=await getData(slug)
  if(!hike)return{title:'Hike not found | Peak Axis'}
  return{title:`${hike.name} | Peak Axis Mauritius`,description:hike.description||`${hike.name} — guided adventure in Mauritius.`}
}

export default async function HikeDetailPage({params}:Props){
  const {slug}=await params
  const {hike,media}=await getData(slug)
  if(!hike)notFound()
  return <HikeDetailContent hike={hike} media={media}/>
}
