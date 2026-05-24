import { createClient } from '@/lib/supabase/server'

const STATUS_COLORS = {
  upcoming:    { bg: 'rgba(46,204,113,0.12)',  color: '#2ECC71', border: 'rgba(46,204,113,0.3)' },
  completed:   { bg: 'rgba(74,144,217,0.12)',  color: '#4A90D9', border: 'rgba(74,144,217,0.3)' },
  cancelled:   { bg: 'rgba(220,50,50,0.1)',    color: '#ff6b6b', border: 'rgba(220,50,50,0.3)'  },
  rescheduled: { bg: 'rgba(232,99,58,0.12)',   color: '#E8633A', border: 'rgba(232,99,58,0.3)'  },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(timeStr) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${ampm}`
}

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, name')
    .eq('user_id', user?.id)
    .single()

  const { data: upcoming } = await supabase
    .from('lesson_plans')
    .select('*, students(name, instrument)')
    .eq('teacher_id', teacher?.id)
    .eq('status', 'upcoming')
    .order('booking_date', { ascending: true })

  const { data: past } = await supabase
    .from('lesson_plans')
    .select('*, students(name, instrument)')
    .eq('teacher_id', teacher?.id)
    .neq('status', 'upcoming')
    .order('booking_date', { ascending: false })
    .limit(20)

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Teacher Portal</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>My Schedule</h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>Lesson plans assigned by admin</p>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Upcoming ({upcoming?.length ?? 0})
        </p>
        {upcoming && upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(plan => {
              const s = STATUS_COLORS[plan.status]
              return (
                <div key={plan.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '1.2rem 1.6rem',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{plan.students?.name}</span>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{plan.students?.instrument || plan.instrument}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📅 {formatDate(plan.booking_date)}</span>
                      <span>🕐 {formatTime(plan.booking_time)}</span>
                      <span>⏱ {plan.duration} min</span>
                      <span>📍 {plan.lesson_format}</span>
                    </div>
                    {plan.admin_notes && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', borderLeft: '2px solid rgba(232,99,58,0.3)', paddingLeft: '0.6rem' }}>
                        Admin: {plan.admin_notes}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', padding: '0.28rem 0.8rem', borderRadius: '100px', whiteSpace: 'nowrap',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 500,
                  }}>Upcoming</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            padding: '2.5rem', textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem',
          }}>
            No upcoming lessons scheduled
          </div>
        )}
      </div>

      {/* Past / Other */}
      {past && past.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Past & Other
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {past.map(plan => {
              const s = STATUS_COLORS[plan.status] || STATUS_COLORS.completed
              return (
                <div key={plan.id} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px', padding: '0.9rem 1.4rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                }}>
                  <div>
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{plan.students?.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.75rem' }}>
                      {formatDate(plan.booking_date)} · {plan.duration} min
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.22rem 0.7rem', borderRadius: '100px',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    textTransform: 'capitalize', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>{plan.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
