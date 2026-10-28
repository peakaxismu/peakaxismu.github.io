const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
}

/** Extract the start date from an advertised expedition range for date validation/storage. */
export function parseExpeditionDepartureStart(label?: string | null): string {
  if (!label) return ''
  const value = label.trim()
  const iso = value.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (iso) return isRealDate(iso[0]) ? iso[0] : ''

  const dayFirst = value.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:[–—-]\s*\d{1,2}(?:st|nd|rd|th)?\s*)?([A-Za-z]+)\s*,?\s+(\d{4})/i)
  if (dayFirst) {
    const month = monthIndex(dayFirst[2])
    if (month < 0) return ''
    return buildDate(Number(dayFirst[3]), month, Number(dayFirst[1]))
  }

  const monthFirst = value.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*[–—-]\s*\d{1,2}(?:st|nd|rd|th)?)?\s*,?\s+(\d{4})/i)
  if (monthFirst) {
    const month = monthIndex(monthFirst[1])
    if (month < 0) return ''
    return buildDate(Number(monthFirst[3]), month, Number(monthFirst[2]))
  }

  return ''
}

function monthIndex(value: string): number {
  return MONTHS[value.toLowerCase()] ?? MONTHS[value.slice(0, 3).toLowerCase()] ?? -1
}

function buildDate(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return ''
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isRealDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number)
  return buildDate(year, month - 1, day) === value
}
