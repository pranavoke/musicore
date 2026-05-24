import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AssignDraftSection from './AssignDraftSection'

const STATUS_COLORS = {
  upcoming:    { bg: 'rgba(46,204,113,0.12)',  color: '#2ECC71', border: 'rgba(46,204,113,0.3)' },
  completed:   { bg: 'rgba(74,144,217,0.12)',  color: '#4A90D9', border: 'rgba(74,144,217,0.3)' },
  cancelled:   { bg: 'rgba(220,50,50,0.1)',    color: '#ff6b6b', border: 'rgba(220,50,50,0.3)' },
  rescheduled: { bg: 'rgba(232,99,58,0.12)',   color: '#E8633A', border: 'rgba(232,99,58,0.3)' },
  draft:       { bg: 'rgba(255,200,60,0.1)',   color: '#F5A623', border: 'rgba(255,200,60,0.3)' },
}

export default async function LessonPlansPage() {
  const supabase = await createClient()

  const [{ data: plans }, { data: teachers }] = await Promise.all([
    supabase
      .from('lesson_plans')
      .select('*, teachers(name), students(name)')
      .order('created_at', { ascending: false }),
    supabase.from('teachers').select('id, name, instrument').order('name'),
  ])

  // Split: draft (no teacher assigned) vs. confirmed lesson plans
  const drafts  = (plans || []).filter(p => p.status === 'draft' && !p.teacher_id)
  const regulars = (plans || []).filter(p => !(p.status === 'draft' && !p.teacher_id))

  return (
    <div>
      {/* Page header */}
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

      {/* Pending booking requests — needs interactivity, so client component */}
      <AssignDraftSection drafts={drafts} teachers={teachers || []} />

      {/* Confirmed lesson plans */}
      {regulars.length > 0 ? (
        <>
          {drafts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>All Lesson Plans</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {regulars.map(p => {
              const s = STATUS_COLORS[p.status] || STATUS_COLORS.upcoming
              const displayName = p.status === 'draft'
                ? (p.requester_name || 'Unknown Requester')
                : (p.students?.name || '—')
              return (
                <div key={p.id} className="lesson-row" style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px', padding: '1.2rem 1.6rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{displayName}</span>
                      {p.teachers?.name && (
                        <>
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>with</span>
                          <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{p.teachers.name}</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                      {p.booking_date
                        ? `${p.booking_date} · ${p.booking_time?.slice(0, 5)} · `
                        : (p.preferred_date ? `Prefers ${p.preferred_date} · ` : '')}
                      {p.duration} min · {p.lesson_format} · {p.instrument}
                    </div>
                    {p.admin_notes && (
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        Note: {p.admin_notes}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', padding: '0.28rem 0.8rem', borderRadius: '100px', whiteSpace: 'nowrap',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 500,
                    textTransform: 'capitalize',
                  }}>{p.status}</span>
                </div>
              )
            })}
          </div>
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
