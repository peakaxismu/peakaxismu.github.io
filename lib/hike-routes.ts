export const slugifyHikeName = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const getOnDemandHikeHref = (hikeName: string) =>
  `/hikes/${slugifyHikeName(hikeName)}`

export const getScheduledHikeHref = (scheduledHikeId: string) =>
  `/hikes/scheduled/${scheduledHikeId}`
