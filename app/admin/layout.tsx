import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')
  if (!isAdminUser(user)) redirect('/admin/login?error=forbidden')

  return <AdminLayout>{children}</AdminLayout>
}
