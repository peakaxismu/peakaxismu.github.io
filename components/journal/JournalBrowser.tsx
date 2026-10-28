'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { journalImage, journalRelatedLink, journalSlug, type JournalPost } from '@/lib/journal'

export default function JournalBrowser({ posts }: { posts: JournalPost[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All topics')
  const categories = useMemo(() => ['All topics', ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))], [posts])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCategory = category === 'All topics' || post.category === category
      const matchesQuery = !term || [post.title, post.summary, post.category, post.content || ''].some((value) => value.toLowerCase().includes(term))
      return matchesCategory && matchesQuery
    })
  }, [posts, query, category])

  return (
    <>
      <div className="journal-tools" aria-label="Filter journal articles">
        <label className="journal-search-label" htmlFor="journal-search">Find a field note</label>
        <input id="journal-search" className="journal-search" type="search" placeholder="Search trails, gear, weather…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="journal-filters" aria-label="Topics">
          {categories.map((item) => <button type="button" key={item} className={category === item ? 'journal-filter active' : 'journal-filter'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <p className="journal-results" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'field note' : 'field notes'}</p>
      </div>
      {filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map((post, index) => {
            const related = journalRelatedLink(post)
            return (
              <article key={post.id} className={index === 0 ? 'post-card featured-post' : 'post-card'}>
                <Link href={`/journal/${journalSlug(post.title)}`} className="card-visual-link" aria-label={`Read ${post.title}`}>
                  <div className="card-visual" role="img" aria-label={`Landscape photograph for ${post.title}`} style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(13,29,29,.72)), url("${journalImage(post.title)}")` }}>
                    <span className="post-cat">{post.category || 'FIELD NOTES'}</span>
                    <span className="visual-index">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </Link>
                <div className="post-content">
                  <div className="post-date">{new Date(post.created_at).toLocaleDateString('en-MU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Indian/Mauritius' })} <span>·</span> Peak Axis Field Notes</div>
                  <h2><Link href={`/journal/${journalSlug(post.title)}`}>{post.title}</Link></h2>
                  <p>{post.summary}</p>
                  <div className="post-actions">
                    <Link className="read-link" href={`/journal/${journalSlug(post.title)}`}>Read field note <span aria-hidden="true">↗</span></Link>
                    <Link className="related-link" href={related.href}>{related.label}</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="journal-empty"><h2>No field notes found.</h2><p>Try another search or choose a different topic.</p><button type="button" className="journal-reset" onClick={() => { setQuery(''); setCategory('All topics') }}>Clear filters</button></div>
      )}
    </>
  )
}
