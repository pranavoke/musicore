import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const admin = createAdminClient()

  const { error } = await admin.from('teachers').update({
    slug: body.slug || null,
    subtitle: body.subtitle || null,
    bio: body.bio || null,
    photo_url: body.photo_url || null,
    tags: body.tags || [],
    learn_items: body.learn_items || [],
    languages: body.languages || null,
    instruments_text: body.instruments_text || null,
    experience: body.experience || null,
    is_published: !!body.is_published,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
