import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://peakaxismu-github-io.vercel.app'
  const routes = [
    '/',
    '/hikes',
    '/expeditions',
    '/expeditions/piton-de-la-fournaise',
    '/enquire',
  ]

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/enquire' ? 0.9 : 0.8,
  }))
}
