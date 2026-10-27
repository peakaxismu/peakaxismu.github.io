import { redirect } from 'next/navigation'
import TaskManager from '@/components/admin/TaskManager'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')
  const admin = createAdminClient()
  const [tasksResult, customersResult] = await Promise.all([
    admin.from('crm_tasks').select('id,title,description,customer_id,due_at,priority,status,source,created_at,completed_at').order('due_at', { ascending: true, nullsFirst: false }),
    admin.from('customers').select('id,full_name,email').order('full_name'),
  ])
  if (tasksResult.error || customersResult.error) throw new Error('Unable to load tasks. Confirm the CRM database migration has been applied.')
  return <TaskManager initialTasks={tasksResult.data ?? []} customers={customersResult.data ?? []} />
}
