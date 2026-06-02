'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// ── Inline video uploader ─────────────────────────────────────────────────────
function VideoUpload({ onUploadComplete }) {
  const [status,   setStatus]   = useState('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  async function uploadFile(file) {
    if (!file || !file.type.startsWith('video/')) { setStatus('error'); setFileName('Videos only'); return }
    if (file.size > 100 * 1024 * 1024) { setStatus('error'); setFileName('Max 100MB'); return }
    setFileName(file.name); setStatus('uploading'); setProgress(0)
    const fd = new FormData()
    fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET); fd.append('resource_type', 'video')
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)) }
    xhr.onload = () => {
      const d = JSON.parse(xhr.responseText)
      if (xhr.status === 200 && d.secure_url) { setStatus('done'); onUploadComplete(d.secure_url) }
      else { setStatus('error'); setFileName(d.error?.message || 'Upload failed') }
    }
    xhr.onerror = () => { setStatus('error'); setFileName('Network error') }
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
    xhr.send(fd)
  }

  const s = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }

  if (status === 'done') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(46,204,113,0.07)', border: '1px solid rgba(46,204,113,0.25)', borderRadius: '8px' }}>
      <span>🎥</span>
      <span style={{ fontSize: '0.82rem', color: '#2ECC71', flex: 1 }}>✓ {fileName}</span>
      <button type="button" onClick={() => { setStatus('idle'); setFileName(''); onUploadComplete('') }} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
    </div>
  )
  if (status === 'uploading') return (
    <div style={{ padding: '0.8rem 1rem', background: 'rgba(232,99,58,0.05)', border: '1px solid rgba(232,99,58,0.2)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{fileName}</span>
        <span style={{ color: '#E8633A', fontWeight: 600 }}>{progress}%</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#E8633A', borderRadius: '100px', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
  return (
    <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
      style={{ border: `1px dashed ${dragOver ? '#E8633A' : status === 'error' ? 'rgba(220,50,50,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(232,99,58,0.04)' : 'transparent', transition: 'all 0.2s' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>🎥</div>
      <div style={{ fontSize: '0.78rem', color: status === 'error' ? '#ff6b6b' : 'rgba(255,255,255,0.4)' }}>
        {status === 'error' ? (fileName || 'Invalid file') : 'Drop video or click to upload'}
      </div>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0])} />
    </div>
  )
}

// ── Inline log form ────────────────────────────────────────────────────────────
function LogForm({ session, onDone }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    lesson_date: today,
    lesson_time: '',
    comments: '',
    video_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit() {
    if (!form.lesson_date) { setError('Date is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id:     session.student_id,
          lesson_format:  session.lesson_format,
          lesson_date:    form.lesson_date,
          lesson_time:    form.lesson_time || null,
          duration:       session.duration,
          comments:       form.comments,
          video_url:      form.video_url || null,
          status:         'submitted',
          lesson_plan_id: session.id, // marks this plan slot as completed
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to log')
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', colorScheme: 'dark', width: '100%', boxSizing: 'border-box' }
  const label = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', letterSpacing: '0.04em', textTransform: 'uppercase' }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.2rem 1.6rem', background: '#0D0B09' }}>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Log this session
      </p>

      {/* Pre-filled info (read-only) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[session.lesson_format, `${session.duration} min`, session.instrument].filter(Boolean).map(t => (
          <span key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{t}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={label}>Date Conducted *</label>
          <input type="date" style={inputStyle} value={form.lesson_date} onChange={e => set('lesson_date', e.target.value)} />
        </div>
        <div>
          <label style={label}>Time</label>
          <input type="time" style={inputStyle} value={form.lesson_time} onChange={e => set('lesson_time', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={label}>Notes / Comments</label>
        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          placeholder="What was covered, student performance, homework assigned..."
          value={form.comments} onChange={e => set('comments', e.target.value)} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={label}>Lesson Video <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>(optional)</span></label>
        <VideoUpload onUploadComplete={url => set('video_url', url)} />
      </div>

      {error && (
        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button onClick={submit} disabled={loading} style={{ padding: '0.65rem 1.4rem', background: '#E8633A', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 500, fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : '✓ Mark as Done'}
        </button>
        <button onClick={() => onDone(false)} style={{ padding: '0.65rem 1rem', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TeacherSessionsClient({ grouped }) {
  const router = useRouter()
  const [expanded,  setExpanded]  = useState({})
  const [logging,   setLogging]   = useState(null) // session.id being logged

  const toggle = key => setExpanded(e => ({ ...e, [key]: !e[key] }))

  function handleLogged() {
    setLogging(null)
    router.refresh()
  }

  if (!grouped || grouped.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
      No sessions assigned yet. Check back after your admin sets up your schedule.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {grouped.map((group, gi) => {
        const key       = group.group_id || `s-${gi}`
        const isOpen    = expanded[key]
        const total     = group.sessions.length
        const completed = group.sessions.filter(s => s.status === 'completed').length
        const progress  = total > 0 ? (completed / total) * 100 : 0
        const isGroup   = total > 1
        const next      = group.sessions.find(s => s.status === 'upcoming')

        return (
          <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>

            {/* Group header */}
            <div
              style={{ padding: '1.2rem 1.6rem', cursor: isGroup ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              onClick={() => isGroup && toggle(key)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{group.student?.name}</span>
                  {[group.instrument, group.lesson_format].filter(Boolean).map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.15rem 0.55rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{t}</span>
                  ))}
                  {group.plan && (
                    <span style={{ background: 'rgba(232,99,58,0.1)', border: '1px solid rgba(232,99,58,0.2)', borderRadius: '100px', padding: '0.15rem 0.55rem', fontSize: '0.7rem', color: '#E8633A' }}>{group.plan} Plan</span>
                  )}
                </div>

                {next && !isOpen && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Next: {next.booking_date}{next.booking_time ? ` · ${next.booking_time.slice(0, 5)}` : ''}
                  </div>
                )}

                {/* Progress bar */}
                {isGroup && (
                  <div style={{ marginTop: '0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>PROGRESS</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: completed === total ? '#2ECC71' : '#E8633A' }}>
                        {completed}/{total} sessions
                      </span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', maxWidth: '260px' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: completed === total ? '#2ECC71' : 'linear-gradient(to right, #E8633A, #f0854d)', borderRadius: '100px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                {/* Single session — show Log button directly */}
                {!isGroup && group.sessions[0].status === 'upcoming' && logging !== group.sessions[0].id && (
                  <button
                    onClick={e => { e.stopPropagation(); setLogging(group.sessions[0].id) }}
                    style={{ padding: '0.45rem 1rem', background: '#E8633A', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit' }}>
                    Log Lesson
                  </button>
                )}
                {!isGroup && (
                  <span style={{ fontSize: '0.72rem', padding: '0.22rem 0.65rem', borderRadius: '100px', background: group.sessions[0].status === 'completed' ? 'rgba(74,144,217,0.12)' : 'rgba(46,204,113,0.12)', color: group.sessions[0].status === 'completed' ? '#4A90D9' : '#2ECC71', border: `1px solid ${group.sessions[0].status === 'completed' ? 'rgba(74,144,217,0.3)' : 'rgba(46,204,113,0.3)'}`, textTransform: 'capitalize' }}>
                    {group.sessions[0].status}
                  </span>
                )}
                {isGroup && (
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>{isOpen ? '▲' : '▼'}</span>
                )}
              </div>
            </div>

            {/* Single session log form */}
            {!isGroup && logging === group.sessions[0].id && (
              <LogForm session={{ ...group.sessions[0], instrument: group.instrument }} onDone={handleLogged} />
            )}

            {/* Expanded group sessions */}
            {isGroup && isOpen && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {group.sessions.map((session, si) => {
                  const isDone = session.status === 'completed'
                  return (
                    <div key={session.id}>
                      <div style={{
                        padding: '0.85rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                        borderBottom: (si < group.sessions.length - 1 || logging === session.id) ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: si % 2 ? 'rgba(255,255,255,0.01)' : 'transparent',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: isDone ? 'rgba(74,144,217,0.5)' : 'rgba(232,99,58,0.4)', width: '24px', flexShrink: 0 }}>
                            {String(si + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: isDone ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {session.booking_date || 'No date'}{session.booking_time ? ` · ${session.booking_time.slice(0, 5)}` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {!isDone && logging !== session.id && (
                            <button
                              onClick={() => setLogging(session.id)}
                              style={{ padding: '0.35rem 0.85rem', background: '#E8633A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, fontFamily: 'inherit' }}>
                              Log
                            </button>
                          )}
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: isDone ? 'rgba(74,144,217,0.12)' : 'rgba(46,204,113,0.12)', color: isDone ? '#4A90D9' : '#2ECC71', border: `1px solid ${isDone ? 'rgba(74,144,217,0.3)' : 'rgba(46,204,113,0.3)'}`, textTransform: 'capitalize' }}>
                            {session.status}
                          </span>
                        </div>
                      </div>

                      {logging === session.id && (
                        <LogForm session={{ ...session, instrument: group.instrument }} onDone={handleLogged} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
