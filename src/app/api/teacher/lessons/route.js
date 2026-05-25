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
  const { student_id, lesson_format, lesson_date, duration, comments, video_url, status } = body

  const admin = createAdminClient()
  const { data, error } = await admin.from('lessons').insert({
    teacher_id: teacher.id,
    student_id,
    lesson_format,
    lesson_date,
    duration: parseInt(duration),
    comments,
    status: status || 'submitted',
    video_url: video_url || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, lesson: data })
}
