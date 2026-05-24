import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'

export default async function TeachersPage() {
  const supabase = await createClient()
  const { data: teachers } = await supabase
    .from('teachers')
    .select('*, students(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Manage</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Teachers</h1>
        </div>
        <Link href="/admin/teachers/new" style={{
          padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#E8633A',
          color: '#fff', fontSize: '0.88rem', fontWeight: 500, display: 'inline-block',
        }}>+ Add Teacher</Link>
      </div>

      {teachers && teachers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {teachers.map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '1.2rem 1.6rem',
            }}>
              {/* Left — avatar + info (clickable) */}
              <Link href={`/admin/teachers/${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1 }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'rgba(232,99,58,0.15)', border: '1px solid rgba(232,99,58,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#E8633A',
                  flexShrink: 0,
                }}>{t.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{t.email}</div>
                </div>
              </Link>

              {/* Right — meta + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Instrument</div>
                  <div style={{ fontSize: '0.88rem', color: '#E8633A', fontWeight: 500 }}>{t.instrument}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Students</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 500 }}>{t.students?.[0]?.count ?? 0}</div>
                </div>
                <DeleteButton
                  endpoint={`/api/admin/teachers/${t.id}`}
                  label="Delete"
                  redirectTo="/admin/teachers"
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
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
          <p style={{ marginBottom: '1.2rem' }}>No teachers yet</p>
          <Link href="/admin/teachers/new" style={{ color: '#E8633A', fontSize: '0.88rem' }}>+ Add your first teacher</Link>
        </div>
      )}
    </div>
  )
}
