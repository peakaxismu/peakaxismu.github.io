import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
async function authorized(){const{data:{user}}=await(await createClient()).auth.getUser();return Boolean(user)}
export async function POST(request:Request){if(!(await authorized()))return NextResponse.json({error:'Unauthorized'},{status:401});const b=await request.json();if(!b.image_url||!b.post_url)return NextResponse.json({error:'Image URL and post URL are required'},{status:400});const{data,error}=await createAdminClient().from('instagram_posts').insert({image_url:b.image_url,post_url:b.post_url,caption:b.caption||'',status:b.status==='draft'?'draft':'published',sort_order:Number(b.sort_order||0)}).select().single();if(error)return NextResponse.json({error:'Failed to create Instagram post'},{status:500});return NextResponse.json({success:true,data})}
