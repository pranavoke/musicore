import { createAdminClient } from '@/lib/supabase/admin'

const BASE = 'https://musicoreuae.com'

export default async function sitemap() {
  const admin = createAdminClient()
  const { data: teachers } = await admin
    .from('teachers')
    .select('slug, updated_at')
    .eq('is_published', true)
    .not('slug', 'is', null)

  const teacherUrls = (teachers || [])
    .filter(t => t.slug)
    .map(t => ({
      url: `${BASE}/teachers/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [
    { url: BASE,                     lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/#teachers`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/#instruments`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#lessons`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#faq`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...teacherUrls,
  ]
}
