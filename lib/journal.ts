export interface JournalPost {
  id: string
  title: string
  category: string
  summary: string
  content: string | null
  created_at: string
  updated_at?: string
}

export function journalSlug(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function journalImage(title: string) {
  const value = title.toLowerCase()
  if (value.includes('waterfall')) return 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1400&q=85'
  if (value.includes('pack')) return 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=85'
  if (value.includes('time of year') || value.includes('weather')) return 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85'
  if (value.includes('fournaise') || value.includes('volcano') || value.includes('neiges')) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85'
  return 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1400&q=85'
}

export function journalRelatedLink(post: Pick<JournalPost, 'title' | 'category'>) {
  const value = `${post.title} ${post.category}`.toLowerCase()
  if (value.includes('fournaise') || value.includes('neiges') || value.includes('expedition') || value.includes('volcano') || value.includes('réunion')) {
    return { href: '/expeditions', label: 'Explore expeditions' }
  }
  if (value.includes('waterfall') || value.includes('trail') || value.includes('mauritius')) {
    return { href: '/hikes', label: 'Explore guided hikes' }
  }
  return { href: '/enquire', label: 'Plan an adventure' }
}
