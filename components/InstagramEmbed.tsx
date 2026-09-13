'use client'

import { useEffect } from 'react'

export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const script = document.querySelector('script[data-instgrm-loader]') as HTMLScriptElement | null
    if (script) {
      ;(window as any).instgrm?.Embeds?.process()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://www.instagram.com/embed.js'
    s.async = true
    s.dataset.instgrmLoader = 'true'
    s.onload = () => (window as any).instgrm?.Embeds?.process()
    document.body.appendChild(s)
  }, [url])

  return <blockquote className="instagram-media" data-instgrm-captioned data-instgrm-permalink={url} data-instgrm-version="14" style={{ background: '#FFF', border: 0, borderRadius: 3, boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px auto', maxWidth: 540, minWidth: 326, padding: 0, width: '99.375%' }}><a href={url} target="_blank" rel="noreferrer">View this post on Instagram</a></blockquote>
}
