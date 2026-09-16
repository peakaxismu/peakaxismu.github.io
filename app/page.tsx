import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HomeClientPillars from '@/components/HomeClientPillars'
import InstagramEmbed from '@/components/InstagramEmbed'

export const metadata: Metadata = {
  title: 'Peak Axis — Adventure without borders',
  description: 'Guided hikes in Mauritius, La Réunion volcano expeditions, team terrain days, and outdoor adventures with Peak Axis.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Peak Axis — Adventure without borders',
    description: 'Guided hikes in Mauritius, La Réunion volcano expeditions, team terrain days, and outdoor adventures with Peak Axis.',
    url: '/',
  },
}

export const revalidate = 0
export default async function HomePage(){
 const supabase=await createClient()
 const [{data:hikesData},{data:expedition},{data:teamData},{data:content},{data:settings},{data:testimonials},{data:instagramPosts}]=await Promise.all([
  supabase.from('hikes').select('id,name,difficulty,date,duration,location,price,spots_remaining,booking_type').eq('status','published').order('created_at',{ascending:true}),
  supabase.from('expeditions').select('id,slug,name,destination,duration_days,price_from,next_departure,description').eq('status','published').order('created_at',{ascending:true}).limit(1).maybeSingle(),
  supabase.from('team_building_packages').select('id,name,type,description').eq('status','published'),
  supabase.from('homepage_content').select('*').eq('id',true).maybeSingle(),
  supabase.from('site_settings').select('instagram_handle,instagram_url').eq('id',true).maybeSingle(),
  supabase.from('testimonials').select('id,quote,name,activity').eq('status','published').order('sort_order',{ascending:true}).order('created_at',{ascending:true}).limit(6),
  supabase.from('instagram_posts').select('id,image_url,post_url,embed_code,caption').eq('status','published').order('sort_order',{ascending:true}).order('created_at',{ascending:true}).limit(6),
 ])
 const c=content || {}; const s=settings || {instagram_handle:'peak.axis',instagram_url:'https://www.instagram.com/peak.axis'}; const reviews=testimonials||[]; const posts=instagramPosts||[]
 return <div id="view-home">
