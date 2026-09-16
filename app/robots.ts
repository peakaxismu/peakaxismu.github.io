import type { MetadataRoute } from 'next'

const siteUrl = 'https://peakaxis.mu'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
