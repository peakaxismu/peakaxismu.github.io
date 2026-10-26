import { redirect } from 'next/navigation'
import BookingManager from '@/components/admin/BookingManager'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')

  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const [customersResult, bookingsResult, departuresResult, hikesResult, expeditionsResult] = await Promise.all([
    admin.from('customers').select('id,full_name,email').order('full_name'),
    admin.from('bookings').select('*').order('booking_date', { ascending: false }),
    admin.from('scheduled_hikes').select('id,hike_id,date,price,spots_remaining,status').eq('status', 'published').gte('date', today).gt('spots_remaining', 0).order('date'),
    admin.from('hikes').select('id,name'),
    admin.from('expeditions').select('id,name,next_departure,status').eq('status', 'published').order('name'),
  ])

  if (customersResult.error || bookingsResult.error || departuresResult.error || hikesResult.error || expeditionsResult.error) {
    throw new Error('Unable to load booking workspace. Confirm the CRM database migration has been applied.')
  }
  const hikeNames = new Map((hikesResult.data ?? []).map(hike => [hike.id, hike.name]))
  const departures = (departuresResult.data ?? []).map(departure => ({
    id: departure.id,
    hike_id: departure.hike_id,
    date: departure.date,
    price: departure.price,
    spots_remaining: departure.spots_remaining,
    hike_name: hikeNames.get(departure.hike_id) ?? 'Scheduled hike',
  }))

  return <BookingManager initialBookings={bookingsResult.data ?? []} customers={customersResult.data ?? []} departures={departures} expeditions={expeditionsResult.data ?? []} />
}
