import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const baseUrl = 'https://peakaxis.mu'
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '/',
    '/hikes',
    '/waterfalls',
    '/expeditions',
    '/expeditions/piton-de-la-fournaise',
    '/journal',
    '/enquire',
    '/privacy-policy',
    '/cookie-policy',
  ]

  const supabase = await createClient()
  const [{ data: hikes }, { data: expeditions }] = await Promise.all([
    supabase.from('hikes').select('name, created_at, status').eq('status', 'published'),
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
    ...(hikes ?? []).filter((item) => item.name).map((item) => ({
      url: `${baseUrl}/hikes/${slugify(item.name)}`,
      lastModified: item.created_at ? new Date(item.created_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
