import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

async function authorized(){const s=await createClient();const{data:{user}}=await s.auth.getUser();return isAdminUser(user)}

export async function POST(request:Request){
  if(!(await authorized())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const form=await request.formData()
  const file=form.get('file')
  if(!(file instanceof File)) return NextResponse.json({error:'Photo file is required'},{status:400})
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) return NextResponse.json({error:'Only JPG, PNG, WEBP or GIF images are allowed'},{status:400})
  if(file.size>5*1024*1024) return NextResponse.json({error:'Photo must be 5MB or smaller'},{status:400})
  const ext={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif' }[file.type]
  const path=`testimonials/${crypto.randomUUID()}.${ext}`
  const admin=createAdminClient()
  const {error}=await admin.storage.from('testimonial-media').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,upsert:false,cacheControl:'31536000'})
  if(error) return NextResponse.json({error:'Failed to upload photo'},{status:500})
  const {data}=admin.storage.from('testimonial-media').getPublicUrl(path)
  return NextResponse.json({success:true,url:data.publicUrl})
}
