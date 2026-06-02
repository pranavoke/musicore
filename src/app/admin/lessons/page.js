import { createClient } from '@/lib/supabase/server'

export default async function AdminLessonsPage() {
  const supabase = await createClient()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, teachers(name), students(name, instrument)')
    .order('lesson_date', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>All Teachers</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Lessons Logged</h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
          {lessons?.length ?? 0} lesson{lessons?.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {lessons && lessons.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessons.map(l => (
            <div key={l.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', overflow: 'hidden',
            }}>
              {/* Main row */}
              <div style={{ padding: '1.2rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{l.students?.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>taught by</span>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)' }}>{l.teachers?.name}</span>
                    {l.students?.instrument && (
                      <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.15rem 0.6rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                        {l.students.instrument}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: l.comments ? '0.6rem' : 0 }}>
                    <span>📅 {l.lesson_date}{l.lesson_time ? ` · ${l.lesson_time.slice(0, 5)}` : ''}</span>
                    <span>{l.lesson_format}</span>
                    <span>{l.duration} min</span>
                  </div>
                  {l.comments && (
                    <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '580px', margin: 0 }}>
                      {l.comments}
                    </p>
                  )}
                </div>

                <span style={{
                  fontSize: '0.72rem', padding: '0.25rem 0.7rem', borderRadius: '100px', flexShrink: 0,
                  background: l.status === 'submitted' ? 'rgba(46,204,113,0.12)' : 'rgba(255,200,60,0.1)',
                  color: l.status === 'submitted' ? '#2ECC71' : '#F5A623',
                  border: `1px solid ${l.status === 'submitted' ? 'rgba(46,204,113,0.3)' : 'rgba(255,200,60,0.3)'}`,
                  fontWeight: 500, textTransform: 'capitalize',
                }}>{l.status}</span>
              </div>

              {/* Video section — shown only when a video exists */}
              {l.video_url && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.6rem', background: 'rgba(0,0,0,0.2)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    🎥 Lesson Recording
                  </p>
                  <video
                    controls
                    style={{ width: '100%', maxWidth: '640px', borderRadius: '8px', background: '#000', display: 'block' }}
                    preload="metadata"
                  >
                    <source src={l.video_url} />
                    Your browser does not support video playback.
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <p>No lessons logged yet</p>
        </div>
      )}
    </div>
  )
}
