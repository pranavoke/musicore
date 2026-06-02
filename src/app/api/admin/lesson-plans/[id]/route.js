import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendTeacherAssignment } from '@/lib/email'
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

  const { error } = await admin.from('lesson_plans').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send assignment email when a draft is confirmed with teacher + student
  if (body.status === 'upcoming' && body.teacher_id && body.student_id) {
    try {
      const [{ data: plan }, { data: teacher }, { data: student }] = await Promise.all([
        admin.from('lesson_plans').select('instrument, lesson_format, booking_date, booking_time, duration, plan').eq('id', id).single(),
        admin.from('teachers').select('name, email').eq('id', body.teacher_id).single(),
        admin.from('students').select('name, email').eq('id', body.student_id).single(),
      ])
      if (plan && teacher && student) {
        await sendTeacherAssignment({
          studentEmail: student.email,
          studentName:  student.name,
          teacherEmail: teacher.email,
          teacherName:  teacher.name,
          instrument:   plan.instrument,
          format:       plan.lesson_format,
          bookingDate:  body.booking_date || plan.booking_date,
          bookingTime:  body.booking_time || plan.booking_time,
          duration:     plan.duration,
          plan:         plan.plan,
        })
      }
    } catch (e) { console.error('[Assignment email]', e.message) }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin.from('lesson_plans').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
