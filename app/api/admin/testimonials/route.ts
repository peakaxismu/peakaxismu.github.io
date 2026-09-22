import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

async function authorized(){const s=await createClient();const{data:{user}}=await s.auth.getUser();return isAdminUser(user)}

export async function POST(request:Request){if(!(await authorized()))return NextResponse.json({error:'Forbidden'},{status:403});const b=await request.json();if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Invalid request body'},{status:400});if([b.quote,b.name,b.activity].some(v=>typeof v!=='string'||!v.trim()))return NextResponse.json({error:'Quote, name and activity are required'},{status:400});if(b.status&&!['draft','published'].includes(b.status))return NextResponse.json({error:'Invalid status'},{status:400});const{data,error}=await createAdminClient().from('testimonials').insert({quote:b.quote,name:b.name,activity:b.activity,status:b.status||'published',sort_order:Number(b.sort_order)||0,photo_url:typeof b.photo_url==='string'&&b.photo_url.trim()?b.photo_url.trim():null,photo_position_x:Number.isFinite(Number(b.photo_position_x))?Math.max(0,Math.min(100,Number(b.photo_position_x))):50,photo_position_y:Number.isFinite(Number(b.photo_position_y))?Math.max(0,Math.min(100,Number(b.photo_position_y))):30}).select().single();if(error)return NextResponse.json({error:'Failed to create testimonial'},{status:500});return NextResponse.json({success:true,data})}
