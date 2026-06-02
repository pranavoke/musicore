import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get teacher profile
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })

  const body = await request.json()
  const { student_id, lesson_format, lesson_date, lesson_time, duration, comments, video_url, status, lesson_plan_id } = body

  const admin = createAdminClient()
  const { data, error } = await admin.from('lessons').insert({
    teacher_id: teacher.id,
    student_id,
    lesson_format,
    lesson_date,
    lesson_time: lesson_time || null,
    duration: parseInt(duration),
    comments,
    status: status || 'submitted',
    video_url: video_url || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Mark the specific lesson_plan slot as completed
  if (lesson_plan_id) {
    await admin.from('lesson_plans')
      .update({ status: 'completed' })
      .eq('id', lesson_plan_id)
      .eq('teacher_id', teacher.id) // safety: teacher can only complete their own plans
  }

  return NextResponse.json({ success: true, lesson: data })
}
