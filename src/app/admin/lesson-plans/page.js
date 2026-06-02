import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AssignDraftSection from './AssignDraftSection'
import LessonPlanGroups from './LessonPlanGroups'

export default async function LessonPlansPage() {
  const supabase = await createClient()

  const [{ data: plans }, { data: teachers }] = await Promise.all([
    supabase
      .from('lesson_plans')
      .select('*, teachers(name), students(name)')
      .order('booking_date', { ascending: true }),
    supabase.from('teachers').select('id, name, instrument').order('name'),
  ])

  const drafts   = (plans || []).filter(p => p.status === 'draft' && !p.teacher_id)
  const regulars = (plans || []).filter(p => !(p.status === 'draft' && !p.teacher_id))

  // Group regulars by group_id — singles (no group_id) stay as individual items
  const groupMap = {}
  const grouped  = []
  for (const plan of regulars) {
    if (plan.group_id) {
      if (!groupMap[plan.group_id]) {
        groupMap[plan.group_id] = {
          group_id: plan.group_id,
          student:  plan.students,
          teacher:  plan.teachers,
          plan:     plan.plan,
          instrument: plan.instrument,
          lesson_format: plan.lesson_format,
          duration: plan.duration,
          sessions: [],
        }
        grouped.push(groupMap[plan.group_id])
      }
      groupMap[plan.group_id].sessions.push(plan)
    } else {
      grouped.push({
        group_id: null,
        student:  plan.students,
        teacher:  plan.teachers,
        plan:     plan.plan,
        instrument: plan.instrument,
        lesson_format: plan.lesson_format,
        duration: plan.duration,
        sessions: [plan],
      })
    }
  }

  // Sort sessions within each group by date
  for (const g of grouped) {
    g.sessions.sort((a, b) => (a.booking_date || '').localeCompare(b.booking_date || ''))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Manage</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Lesson Plans</h1>
        </div>
        <Link href="/admin/lesson-plans/new" style={{
          padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#E8633A',
          color: '#fff', fontSize: '0.88rem', fontWeight: 500, display: 'inline-block',
        }}>+ Create Lesson Plan</Link>
      </div>

      <AssignDraftSection drafts={drafts} teachers={teachers || []} />

      {grouped.length > 0 ? (
        <>
          {drafts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>All Lesson Plans</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>
          )}
          <LessonPlanGroups grouped={grouped} />
        </>
      ) : drafts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
          <p style={{ marginBottom: '1.2rem' }}>No lesson plans yet</p>
          <Link href="/admin/lesson-plans/new" style={{ color: '#E8633A', fontSize: '0.88rem' }}>+ Create your first lesson plan</Link>
        </div>
      ) : null}
    </div>
  )
}
