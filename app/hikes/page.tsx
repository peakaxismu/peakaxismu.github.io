import { createClient } from '@/lib/supabase/server'
import HikesClientList from '@/components/HikesClientList'

export const revalidate = 0

export default async function HikesPage() {
  const supabase = await createClient()

  const { data: hikes } = await supabase
    .from('hikes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  return (
    <div id="view-hikes" className="view active" style={{ display: 'block' }}>
      <section className="pagehead">
        <div className="wrap">
          <h1>Group Hikes</h1>
          <p>
            No group of your own? Join one of ours. Every hike runs with a guide, a fixed group size, and a route chosen for the season.
          </p>
        </div>
      </section>

      <HikesClientList hikes={hikes || []} />
    </div>
  )
}
