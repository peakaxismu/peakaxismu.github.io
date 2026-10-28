'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'peakaxis-attribution-v1'
const TRACKING_CODE = /^[a-z0-9]{8,16}$/

export type Attribution = {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
  referrer_host: string | null
  landing_path: string | null
  tracking_link_code: string | null
}

function limited(value: string | null, maxLength: number) {
  return value?.trim().slice(0, maxLength) || null
}

export default function AttributionTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/api/')) return

    try {
      const params = new URLSearchParams(window.location.search)
      const source = limited(params.get('utm_source'), 80)
      const medium = limited(params.get('utm_medium'), 80)
      const campaign = limited(params.get('utm_campaign'), 120)
      const content = limited(params.get('utm_content'), 120)
      const rawCode = (params.get('trk') || '').toLowerCase()
      const trackingCode = TRACKING_CODE.test(rawCode) ? rawCode : null

      let referrerHost: string | null = null
      if (document.referrer) {
        try {
          const referrer = new URL(document.referrer)
          if (referrer.protocol.startsWith('http') && referrer.hostname !== window.location.hostname) {
            referrerHost = limited(referrer.hostname.toLowerCase(), 253)
          }
        } catch {
          // Ignore non-URL referrer values.
        }
      }

      let existing: Attribution | null = null
      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') existing = parsed as Attribution
      }

      // A new tagged campaign link wins. Ordinary internal navigation keeps the
      // current source; an external referrer is saved only if nothing is set yet.
      if (source || medium || campaign || trackingCode) {
        const attribution: Attribution = {
          source,
          medium,
          campaign,
          content,
          referrer_host: referrerHost,
          landing_path: limited(window.location.pathname, 200),
          tracking_link_code: trackingCode,
        }
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
      } else if (!existing && referrerHost) {
        const guessedSource = referrerHost.replace(/^www\./, '')
        const attribution: Attribution = {
          source: guessedSource,
          medium: 'referral',
          campaign: null,
          content: null,
          referrer_host: referrerHost,
          landing_path: limited(window.location.pathname, 200),
          tracking_link_code: null,
        }
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
      }
    } catch {
      // Attribution is optional; blocked browser storage must not affect site use.
    }
  }, [])

  return null
}

export function readAttribution(): Attribution | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const row = parsed as Record<string, unknown>
    const validText = (value: unknown, max: number) =>
      typeof value === 'string' ? value.trim().slice(0, max) || null : null
    const code = validText(row.tracking_link_code, 16)
    return {
      source: validText(row.source, 80),
      medium: validText(row.medium, 80),
      campaign: validText(row.campaign, 120),
      content: validText(row.content, 120),
      referrer_host: validText(row.referrer_host, 253),
      landing_path: validText(row.landing_path, 200),
      tracking_link_code: code && TRACKING_CODE.test(code) ? code : null,
    }
  } catch {
    return null
  }
}
