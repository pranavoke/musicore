import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendLessonLogged, sendRenewalReminder, sendTrialFollowUp } from '@/lib/email'
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

  // Mark the specific lesson_plan slot as completed + send emails
  if (lesson_plan_id) {
    await admin.from('lesson_plans')
      .update({ status: 'completed' })
      .eq('id', lesson_plan_id)
      .eq('teacher_id', teacher.id)

    try {
      // Fetch context for emails
      const [{ data: plan }, { data: student }, { data: teacherRecord }] = await Promise.all([
        admin.from('lesson_plans').select('group_id, plan, instrument, lesson_format, duration').eq('id', lesson_plan_id).single(),
        admin.from('students').select('name, email').eq('id', student_id).single(),
        admin.from('teachers').select('name, email').eq('id', teacher.id).single(),
      ])

      // Count progress if part of a group
      let sessionNum = null, totalSessions = null
      if (plan?.group_id) {
        const [{ count: total }, { count: completed }] = await Promise.all([
          admin.from('lesson_plans').select('*', { count: 'exact', head: true }).eq('group_id', plan.group_id),
          admin.from('lesson_plans').select('*', { count: 'exact', head: true }).eq('group_id', plan.group_id).eq('status', 'completed'),
        ])
        totalSessions = total
        sessionNum    = completed
      }

      // Email #3 — lesson logged
      await sendLessonLogged({
        studentEmail: student?.email,
        teacherEmail: teacherRecord?.email,
        studentName:  student?.name,
        teacherName:  teacherRecord?.name,
        lessonDate:   lesson_date,
        lessonTime:   lesson_time,
        format:       lesson_format,
        duration,
        comments,
        videoUrl:     video_url,
        sessionNum,
        totalSessions,
      })

      // Count all upcoming sessions left for this student (across all plans)
      const { count: upcomingLeft } = await admin.from('lesson_plans')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student_id)
        .eq('status', 'upcoming')

      // Email #4a — no upcoming sessions left → trial/single follow-up
      if (upcomingLeft === 0) {
        await sendTrialFollowUp({
          studentEmail: student?.email,
          studentName:  student?.name,
          teacherName:  teacherRecord?.name,
          instrument:   plan?.instrument,
        })
      }
      // Email #4b — exactly 1 session left in a group → renewal reminder
      else if (upcomingLeft === 1 && plan?.group_id) {
        await sendRenewalReminder({
          studentEmail: student?.email,
          studentName:  student?.name,
          plan:         plan?.plan,
          instrument:   plan?.instrument,
        })
      }
    } catch (e) { console.error('[Lesson email]', e.message) }
  }

  return NextResponse.json({ success: true, lesson: data })
}
