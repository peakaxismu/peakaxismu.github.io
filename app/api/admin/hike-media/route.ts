import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const BUCKET = 'hike-media'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdminUser(user)
}

export async function GET(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const hikeId = new URL(request.url).searchParams.get('hikeId')
    if (!hikeId) return NextResponse.json({ error: 'hikeId is required' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('hike_media')
      .select('*')
      .eq('hike_id', hikeId)
      .order('is_main', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Hike media GET failed:', error)
    return NextResponse.json({ error: 'Unable to load hike photos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const form = await request.formData()
    const hikeId = String(form.get('hikeId') || '')
    const isMain = String(form.get('isMain') || 'false') === 'true'
    const file = form.get('file')

    if (!hikeId || !(file instanceof File)) {
      return NextResponse.json({ error: 'hikeId and an image file are required' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'Images must be 12 MB or smaller' }, { status: 400 })

    const admin = createAdminClient()
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `hikes/${hikeId}/${crypto.randomUUID()}.${extension}`
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    })
    if (uploadError) throw uploadError

    if (isMain) {
      const { error: resetError } = await admin.from('hike_media').update({ is_main: false }).eq('hike_id', hikeId).eq('is_main', true)
      if (resetError) throw resetError
    }

    const { data: existing } = await admin.from('hike_media').select('sort_order').eq('hike_id', hikeId).order('sort_order', { ascending: false }).limit(1)
    const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1
    const { data, error: insertError } = await admin.from('hike_media').insert({
      hike_id: hikeId,
      storage_path: path,
      image_url: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
      is_main: isMain,
      sort_order: sortOrder,
    }).select().single()

    if (insertError) {
      await admin.storage.from(BUCKET).remove([path])
      throw insertError
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Hike media POST failed:', error)
    return NextResponse.json({ error: 'Unable to upload image' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json() as { id?: string }
    if (!body.id) return NextResponse.json({ error: 'Media id is required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: media, error: lookupError } = await admin.from('hike_media').select('*').eq('id', body.id).single()
    if (lookupError || !media) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    const { error: removeError } = await admin.storage.from(BUCKET).remove([media.storage_path])
    if (removeError) console.warn('Storage delete failed:', removeError)
    const { error: deleteError } = await admin.from('hike_media').delete().eq('id', body.id)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hike media DELETE failed:', error)
    return NextResponse.json({ error: 'Unable to delete image' }, { status: 500 })
  }
}
