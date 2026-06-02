import { createClient } from '@/lib/supabase/server'
import TeacherSessionsClient from './TeacherSessionsClient'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, name')
    .eq('user_id', user?.id)
    .single()

  const { data: plans } = await supabase
    .from('lesson_plans')
    .select('*, students(id, name, instrument)')
    .eq('teacher_id', teacher?.id)
    .order('booking_date', { ascending: true })

  // Group by group_id — singles stay individual
  const groupMap = {}
  const grouped  = []
  for (const plan of plans || []) {
    if (plan.group_id) {
      if (!groupMap[plan.group_id]) {
        groupMap[plan.group_id] = {
          group_id:      plan.group_id,
          student:       plan.students,
          plan:          plan.plan,
          instrument:    plan.instrument,
          lesson_format: plan.lesson_format,
          duration:      plan.duration,
          sessions:      [],
        }
        grouped.push(groupMap[plan.group_id])
      }
      groupMap[plan.group_id].sessions.push(plan)
    } else {
      grouped.push({
        group_id:      null,
        student:       plan.students,
        plan:          plan.plan,
        instrument:    plan.instrument,
        lesson_format: plan.lesson_format,
        duration:      plan.duration,
        sessions:      [plan],
      })
    }
  }

  for (const g of grouped) {
    g.sessions.sort((a, b) => (a.booking_date || '').localeCompare(b.booking_date || ''))
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Teacher Portal</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>My Sessions</h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
          Click on a session to log it
        </p>
      </div>
      <TeacherSessionsClient grouped={grouped} />
    </div>
  )
}
