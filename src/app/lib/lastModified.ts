import generated from '@/generated/last-modified.json'

export type RouteKey = 'home' | 'about' | 'work' | 'writing' | 'contact'

export const LAST_MODIFIED: Record<RouteKey, string> = {
  home: generated.home,
  about: generated.about,
  work: generated.work,
  writing: generated.writing,
  contact: generated.contact,
}

for (const [key, value] of Object.entries(LAST_MODIFIED)) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid lastModified date for ${key}: expected YYYY-MM-DD, got ${String(value)}`)
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatUpdated(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
