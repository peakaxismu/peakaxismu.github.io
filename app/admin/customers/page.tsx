import { redirect } from 'next/navigation'
import CustomerManager from '@/components/admin/CustomerManager'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')

  const admin = createAdminClient()
  const { data, error } = await admin.from('customers').select('id,full_name,email,phone,created_at').order('full_name')
  if (error) throw new Error('Unable to load customer records')

  return <CustomerManager initialCustomers={data ?? []} />
}
