import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const baseUrl = 'https://peakaxis.mu'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '/',
    '/hikes',
    '/waterfalls',
    '/expeditions',
    '/expeditions/piton-de-la-fournaise',
    '/journal',
    '/enquire',
  ]

  const supabase = await createClient()
  const [{ data: hikes }, { data: waterfalls }, { data: journalPosts }, { data: expeditions }] =
    await Promise.all([
      supabase.from('hikes').select('id, updated_at:created_at, status').eq('status', 'published'),
      supabase.from('waterfalls').select('id, updated_at').eq('status', 'published'),
      supabase.from('journal_posts').select('id, updated_at').eq('status', 'published'),
      supabase.from('expeditions').select('slug, created_at, status').eq('status', 'published'),
    ])

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/enquire' ? 0.9 : 0.8,
  }))

  return [
    ...entries,
    ...(expeditions ?? []).filter((item) => item.slug).map((item) => ({
      url: `${baseUrl}/expeditions/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(hikes ?? []).map((item) => ({
      url: `${baseUrl}/hikes/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(waterfalls ?? []).map((item) => ({
      url: `${baseUrl}/waterfalls/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...(journalPosts ?? []).map((item) => ({
      url: `${baseUrl}/journal/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
