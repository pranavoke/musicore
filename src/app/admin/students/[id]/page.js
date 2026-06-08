import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import ChangeTeacherForm from './ChangeTeacherForm'

export default async function StudentDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: student }, { data: teachers }, { data: lessonPlans }, { data: lessons }] = await Promise.all([
    supabase.from('students').select('*, teachers:assigned_teacher_id(id, name, instrument)').eq('id', id).single(),
    supabase.from('teachers').select('id, name, instrument').order('name'),
    supabase.from('lesson_plans').select('*').eq('student_id', id).order('booking_date', { ascending: true }),
    supabase.from('lessons').select('*').eq('student_id', id).order('lesson_date', { ascending: false }).limit(5),
  ])

  if (!student) return <div style={{ color: '#fff' }}>Student not found.</div>

  const upcoming  = (lessonPlans || []).filter(p => p.status === 'upcoming')
  const completed = (lessonPlans || []).filter(p => p.status === 'completed')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin/students" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', textDecoration: 'none' }}>
          ← Back to Students
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#4A90D9',
            }}>{student.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#fff', letterSpacing: '0.02em', margin: '0 0 0.2rem' }}>{student.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {student.instrument && <span style={{ fontSize: '0.82rem', color: '#E8633A' }}>{student.instrument}</span>}
                {student.whatsapp_number && (
                  <a href={`https://wa.me/${student.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', color: '#25D366', textDecoration: 'none' }}>
                    📱 {student.whatsapp_number}
                  </a>
                )}
                {student.email && <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>✉ {student.email}</span>}
              </div>
            </div>
          </div>
          <DeleteButton endpoint={`/api/admin/students/${id}`} label="Delete Student" redirectTo="/admin/students" />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Current Teacher', value: student.teachers?.name || 'Unassigned', color: '#E8633A' },
          { label: 'Upcoming Sessions', value: upcoming.length, color: '#2ECC71' },
          { label: 'Completed Sessions', value: completed.length, color: '#4A90D9' },
          { label: 'Lessons Logged', value: lessons?.length ?? 0, color: '#9B59B6' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming sessions */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>Upcoming Sessions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcoming.map((p, i) => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.9rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'rgba(232,99,58,0.4)' }}>#{i + 1}</span>
                  <span style={{ fontSize: '0.88rem', color: '#fff' }}>{p.booking_date}{p.booking_time ? ` · ${p.booking_time.slice(0, 5)}` : ''}</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{p.lesson_format} · {p.duration} min</span>
                </div>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: 'rgba(46,204,113,0.12)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.3)' }}>upcoming</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent logged lessons */}
      {lessons && lessons.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>Recent Lessons</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lessons.map(l => (
              <div key={l.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.85rem 1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: l.comments ? '0.4rem' : 0 }}>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>{l.lesson_date}{l.lesson_time ? ` · ${l.lesson_time.slice(0,5)}` : ''} · {l.lesson_format} · {l.duration} min</span>
                  {l.video_url && <a href={l.video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#E8633A', textDecoration: 'none' }}>🎥 Watch</a>}
                </div>
                {l.comments && <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{l.comments}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change teacher */}
      <ChangeTeacherForm
        studentId={id}
        currentTeacherId={student.teachers?.id || null}
        teachers={teachers || []}
        instrument={student.instrument}
      />
    </div>
  )
}
