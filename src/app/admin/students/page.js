import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: students } = await supabase
    .from('students')
    .select('*, teachers(name)')
    .order('name')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Manage</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Students</h1>
        </div>
        <Link href="/admin/students/new" style={{
          padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#E8633A',
          color: '#fff', fontSize: '0.88rem', fontWeight: 500, display: 'inline-block',
        }}>+ Add Student</Link>
      </div>

      {students && students.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {students.map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '1.2rem 1.6rem',
            }} className="lesson-row">
              <Link href={`/admin/students/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', textDecoration: 'none', flex: 1 }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#4A90D9', flexShrink: 0,
                }}>{s.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {s.whatsapp_number || 'No WhatsApp number'}
                  </div>
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Instrument</div>
                  <div style={{ fontSize: '0.88rem', color: '#E8633A', fontWeight: 500 }}>{s.instrument || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teacher</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>{s.teachers?.name || '—'}</div>
                </div>
                {s.whatsapp_number && (
                  <a href={`https://wa.me/${s.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.78rem', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '6px', padding: '0.3rem 0.7rem' }}>
                    WhatsApp
                  </a>
                )}
                <DeleteButton
                  endpoint={`/api/admin/students/${s.id}`}
                  label="Delete"
                  redirectTo="/admin/students"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
          <p style={{ marginBottom: '1.2rem' }}>No students yet</p>
          <Link href="/admin/students/new" style={{ color: '#E8633A', fontSize: '0.88rem' }}>+ Add your first student</Link>
        </div>
      )}
    </div>
  )
}
