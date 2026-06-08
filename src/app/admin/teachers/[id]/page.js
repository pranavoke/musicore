import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export default async function TeacherDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('assigned_teacher_id', id)
    .order('name')

  const { data: recentLessons } = await supabase
    .from('lessons')
    .select('*, students(name)')
    .eq('teacher_id', id)
    .order('lesson_date', { ascending: false })
    .limit(5)

  if (!teacher) return <div style={{ color: '#fff' }}>Teacher not found.</div>

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin/teachers" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
          ← Back to Teachers
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(232,99,58,0.15)', border: '1px solid rgba(232,99,58,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#E8633A',
          }}>{teacher.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#fff', letterSpacing: '0.02em', margin: '0 0 0.2rem' }}>{teacher.name}</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{teacher.instrument} · {teacher.email}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Assigned Students */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
              Assigned Students ({students?.length ?? 0})
            </p>
            <Link href={`/admin/students/new?teacher=${id}`} style={{ fontSize: '0.8rem', color: '#E8633A' }}>+ Assign Student</Link>
          </div>
          {students && students.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {students.map(s => (
                <Link key={s.id} href={`/admin/students/${s.id}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', padding: '0.9rem 1.2rem',
                }} className="lesson-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.9rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.instrument}</div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>›</span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
              No students assigned yet
            </div>
          )}
        </div>

        {/* Recent Lessons */}
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Recent Lessons
          </p>
          {recentLessons && recentLessons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recentLessons.map(l => (
                <div key={l.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', padding: '0.9rem 1.2rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.9rem' }}>{l.students?.name}</div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{l.lesson_date}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    {l.lesson_format} · {l.duration} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
              No lessons recorded yet
            </div>
          )}
        </div>
      </div>

      <ResetPasswordForm teacherId={id} />
    </div>
  )
}
