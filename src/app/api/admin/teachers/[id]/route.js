import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  const { id } = await params

  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Get the teacher's auth user_id before deleting
  const { data: teacher } = await admin.from('teachers').select('user_id').eq('id', id).single()

  // Delete teacher record (cascades to lessons, lesson_plans, whatsapp_groups)
  const { error: teacherError } = await admin.from('teachers').delete().eq('id', id)
  if (teacherError) return NextResponse.json({ error: teacherError.message }, { status: 400 })

  // Delete the auth user if linked
  if (teacher?.user_id) {
    await admin.auth.admin.deleteUser(teacher.user_id)
  }

  return NextResponse.json({ success: true })
}
