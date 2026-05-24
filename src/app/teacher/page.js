import { createClient } from '@/lib/supabase/server'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  const { data: upcoming } = await supabase
    .from('lesson_plans')
    .select('*, students(name)')
    .eq('teacher_id', teacher?.id)
    .eq('status', 'upcoming')
    .order('booking_date', { ascending: true })
    .limit(5)

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher?.id)

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_teacher_id', teacher?.id)

  const stats = [
    { label: 'My Students', value: studentCount ?? 0, icon: '👤', color: '#4A90D9' },
    { label: 'Lessons Recorded', value: totalLessons ?? 0, icon: '📋', color: '#E8633A' },
    { label: 'Upcoming Lessons', value: upcoming?.length ?? 0, icon: '📅', color: '#2ECC71' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Welcome back</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: '0 0 0.2rem' }}>
          {teacher?.name ?? 'Teacher'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{teacher?.instrument}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '1.6rem 1.8rem', transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{s.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.6rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming lessons */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>Upcoming Lessons</p>
        {upcoming && upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(lesson => (
              <div key={lesson.id} className="lesson-row" style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '1rem 1.4rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.15s',
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.93rem' }}>{lesson.students?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {lesson.booking_date} · {lesson.booking_time?.slice(0, 5)} · {lesson.duration} min
                  </div>
                </div>
                <span style={{
                  fontSize: '0.72rem', padding: '0.25rem 0.7rem', borderRadius: '100px',
                  background: 'rgba(46,204,113,0.12)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.25)',
                }}>{lesson.lesson_format}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>No upcoming lessons scheduled.</div>
        )}
      </div>

      <a href="/teacher/attendance" className="cta-btn" style={{
        display: 'inline-block', padding: '0.75rem 1.6rem', borderRadius: '8px',
        background: '#E8633A', color: '#fff', fontSize: '0.9rem', fontWeight: 500,
        transition: 'filter 0.2s',
      }}>✏️ Log Today's Lesson</a>
    </div>
  )
}
