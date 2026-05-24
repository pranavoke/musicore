import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, instrument, whatsapp_number } = await request.json()

  const admin = createAdminClient()

  // 1. Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // 2. Insert teacher profile
  const { error: teacherError } = await admin.from('teachers').insert({
    user_id: authUser.user.id, name, email, instrument, whatsapp_number,
  })
  if (teacherError) return NextResponse.json({ error: teacherError.message }, { status: 400 })

  // 3. Assign teacher role
  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: authUser.user.id, role: 'teacher',
  })
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
