import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: teacherCount }, { count: studentCount }, { count: upcomingCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('lesson_plans').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
    supabase.from('lesson_plans').select('*', { count: 'exact', head: true }).eq('status', 'draft').is('teacher_id', null),
  ])

  const stats = [
    { label: 'Teachers', value: teacherCount ?? 0, icon: '🎓', color: '#4A90D9' },
    { label: 'Students', value: studentCount ?? 0, icon: '👤', color: '#E8633A' },
    { label: 'Upcoming Lessons', value: upcomingCount ?? 0, icon: '📅', color: '#2ECC71' },
    { label: 'Pending Requests', value: pendingCount ?? 0, icon: '🔔', color: '#F5A623', href: '/admin/lesson-plans' },
  ]

  const actions = [
    { label: '+ Add Teacher', href: '/admin/teachers/new', color: '#4A90D9' },
    { label: '+ Add Student', href: '/admin/students/new', color: '#E8633A' },
    { label: '+ Create Lesson Plan', href: '/admin/lesson-plans/new', color: '#9B59B6' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Overview</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
        {stats.map(s => {
          const inner = (
            <>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.6rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', letterSpacing: '0.04em' }}>{s.label}</div>
              {s.value > 0 && s.href && (
                <div style={{ fontSize: '0.72rem', color: s.color, marginTop: '0.6rem', opacity: 0.8 }}>→ Review now</div>
              )}
            </>
          )
          const cardStyle = {
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.href && s.value > 0 ? s.color + '55' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '14px', padding: '1.6rem 1.8rem', transition: 'border-color 0.2s',
            textDecoration: 'none', display: 'block',
          }
          return s.href ? (
            <Link key={s.label} href={s.href} className="stat-card" style={cardStyle}>{inner}</Link>
          ) : (
            <div key={s.label} className="stat-card" style={cardStyle}>{inner}</div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {actions.map(a => (
            <a key={a.href} href={a.href} className="quick-action" style={{
              padding: '0.7rem 1.4rem', borderRadius: '8px',
              border: `1px solid ${a.color}55`, color: a.color,
              fontSize: '0.88rem', fontWeight: 500, background: `${a.color}11`,
              transition: 'opacity 0.2s', display: 'inline-block',
            }}>{a.label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
