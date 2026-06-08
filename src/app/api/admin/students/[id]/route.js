import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendTeacherChanged } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { new_teacher_id } = await request.json()
  if (!new_teacher_id) return NextResponse.json({ error: 'new_teacher_id required' }, { status: 400 })

  const admin = createAdminClient()

  // Fetch current student + old teacher + new teacher for emails
  const [{ data: student }, { data: newTeacher }] = await Promise.all([
    admin.from('students').select('*, teachers:assigned_teacher_id(name, email)').eq('id', id).single(),
    admin.from('teachers').select('name, email').eq('id', new_teacher_id).single(),
  ])

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // Count + reassign upcoming lesson_plans
  const { data: upcomingPlans } = await admin
    .from('lesson_plans')
    .select('id')
    .eq('student_id', id)
    .eq('status', 'upcoming')

  if (upcomingPlans?.length) {
    await admin.from('lesson_plans')
      .update({ teacher_id: new_teacher_id })
      .eq('student_id', id)
      .eq('status', 'upcoming')
  }

  // Update student's assigned teacher
  const { error } = await admin.from('students').update({ assigned_teacher_id: new_teacher_id }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send emails
  try {
    await sendTeacherChanged({
      studentEmail:    student.email,
      studentName:     student.name,
      oldTeacherEmail: student.teachers?.email,
      oldTeacherName:  student.teachers?.name || 'Previous teacher',
      newTeacherEmail: newTeacher?.email,
      newTeacherName:  newTeacher?.name,
      instrument:      student.instrument,
      upcomingSessions: upcomingPlans?.length || 0,
    })
  } catch (e) { console.error('[Teacher change email]', e.message) }

  return NextResponse.json({ success: true, reassigned: upcomingPlans?.length || 0 })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin.from('students').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
