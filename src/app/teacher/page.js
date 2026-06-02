import { createClient } from '@/lib/supabase/server'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  const { data: upcomingRaw } = await supabase
    .from('lesson_plans')
    .select('*, students(name, instrument)')
    .eq('teacher_id', teacher?.id)
    .eq('status', 'upcoming')
    .order('booking_date', { ascending: true })

  // Group by student — show each student once with next session + count
  const studentMap = {}
  for (const p of upcomingRaw || []) {
    const sid = p.student_id
    if (!studentMap[sid]) studentMap[sid] = { student: p.students, next: p, count: 0, plan: p.plan }
    studentMap[sid].count++
  }
  const upcoming = Object.values(studentMap)

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
    { label: 'Upcoming Lessons', value: upcomingRaw?.length ?? 0, icon: '📅', color: '#2ECC71' },
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

      {/* Upcoming — grouped by student */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Students with Upcoming Sessions
        </p>
        {upcoming && upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(({ student, next, count, plan }) => (
              <div key={next.student_id} className="lesson-row" style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '1rem 1.4rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                transition: 'background 0.15s',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.93rem' }}>{student?.name}</span>
                    {student?.instrument && (
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', padding: '0.1rem 0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>{student.instrument}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Next: {next.booking_date}{next.booking_time ? ` · ${next.booking_time.slice(0, 5)}` : ''} · {next.duration} min
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <a href="/teacher/schedule" style={{
                    padding: '0.4rem 1rem', background: '#E8633A', color: '#fff',
                    borderRadius: '7px', fontSize: '0.8rem', fontWeight: 500,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>Log Lesson</a>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    {count} session{count !== 1 ? 's' : ''} left{plan ? ` · ${plan}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>No upcoming lessons scheduled.</div>
        )}
      </div>

      <a href="/teacher/schedule" className="cta-btn" style={{
        display: 'inline-block', padding: '0.75rem 1.6rem', borderRadius: '8px',
        background: '#E8633A', color: '#fff', fontSize: '0.9rem', fontWeight: 500,
        transition: 'filter 0.2s',
      }}>📅 View My Sessions</a>
    </div>
  )
}
