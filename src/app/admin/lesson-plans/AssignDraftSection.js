'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssignDraftSection({ drafts, teachers }) {
  const router = useRouter()
  const [assigning, setAssigning] = useState(null) // draft id currently being assigned
  const [form, setForm] = useState({ teacher_id: '', booking_date: '', booking_time: '', admin_notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function openAssign(draft) {
    setAssigning(draft.id)
    setForm({
      teacher_id: '',
      booking_date: draft.preferred_date || '',
      booking_time: draft.preferred_time || '',
      admin_notes: draft.admin_notes || '',
    })
    setError('')
  }

  async function handleAssign() {
    if (!form.teacher_id || !form.booking_date || !form.booking_time) {
      setError('Please fill in teacher, date and time.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/lesson-plans/${assigning}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: form.teacher_id,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          admin_notes: form.admin_notes || null,
          status: 'upcoming',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign')
      setAssigning(null)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReject(id) {
    if (!confirm('Reject and delete this booking request?')) return
    await fetch(`/api/admin/lesson-plans/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (!drafts || drafts.length === 0) return null

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.88rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', letterSpacing: '0.04em', textTransform: 'uppercase' }

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E8633A', animation: 'pulse 2s infinite' }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#E8633A', letterSpacing: '0.05em', margin: 0 }}>
          Pending Booking Requests
        </h2>
        <span style={{ background: 'rgba(232,99,58,0.18)', color: '#E8633A', fontSize: '0.75rem', fontWeight: 600, borderRadius: '100px', padding: '0.2rem 0.65rem' }}>
          {drafts.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {drafts.map(draft => (
          <div key={draft.id}>
            {/* Draft request card */}
            <div style={{
              background: 'rgba(232,99,58,0.05)', border: '1px solid rgba(232,99,58,0.25)',
              borderRadius: '14px', padding: '1.4rem 1.6rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(232,99,58,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: '#E8633A',
                    }}>
                      {draft.requester_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{draft.requester_name}</div>
                      <a href={`https://wa.me/${draft.requester_whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', color: '#25D366', textDecoration: 'none' }}>
                        📱 {draft.requester_whatsapp}
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {[draft.instrument, draft.lesson_format, `${draft.duration} min`].map(tag => (
                      <span key={tag} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '100px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{tag}</span>
                    ))}
                    {draft.preferred_date && (
                      <span style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '100px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                        Prefers: {draft.preferred_date}{draft.preferred_time ? ` at ${draft.preferred_time.slice(0, 5)}` : ''}
                      </span>
                    )}
                  </div>
                  {draft.admin_notes && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                      "{draft.admin_notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => openAssign(draft)} style={{
                    padding: '0.55rem 1.1rem', background: '#E8633A', color: '#fff', border: 'none',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                    fontFamily: 'inherit',
                  }}>Assign Teacher</button>
                  <button onClick={() => handleReject(draft.id)} style={{
                    padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}>Reject</button>
                </div>
              </div>
            </div>

            {/* Inline assign form — expands below the card */}
            {assigning === draft.id && (
              <div style={{
                background: '#0F0D0B', border: '1px solid rgba(232,99,58,0.3)', borderTop: 'none',
                borderRadius: '0 0 14px 14px', padding: '1.5rem 1.6rem', marginTop: '-4px',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.2rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Confirm Booking for {draft.requester_name}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Assign Teacher *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.teacher_id} onChange={e => set('teacher_id', e.target.value)}>
                      <option value="">Select teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.instrument}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Booking Date *</label>
                    <input type="date" style={inputStyle} value={form.booking_date} onChange={e => set('booking_date', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Booking Time *</label>
                    <input type="time" style={inputStyle} value={form.booking_time} onChange={e => set('booking_time', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Notes</label>
                    <input style={inputStyle} value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)} placeholder="Internal note..." />
                  </div>
                </div>
                {error && (
                  <div style={{ marginBottom: '1rem', padding: '0.6rem 0.9rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#ff6b6b' }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleAssign} disabled={loading} style={{
                    padding: '0.65rem 1.4rem', background: '#E8633A', color: '#fff', border: 'none',
                    borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
                    fontSize: '0.88rem', opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                  }}>{loading ? 'Confirming...' : '✓ Confirm & Assign'}</button>
                  <button onClick={() => setAssigning(null)} style={{
                    padding: '0.65rem 1rem', background: 'transparent', color: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.88rem', fontFamily: 'inherit',
                  }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
