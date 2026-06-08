'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangeTeacherForm({ studentId, currentTeacherId, teachers, instrument }) {
  const router = useRouter()
  const [selected, setSelected] = useState(currentTeacherId || '')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  async function handleChange(e) {
    e.preventDefault()
    if (!selected || selected === currentTeacherId) { setError('Please select a different teacher'); return }
    setLoading(true); setError(''); setSuccess('')

    const res  = await fetch(`/api/admin/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_teacher_id: selected }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Failed to update'); return }
    setSuccess(`Teacher updated. ${data.reassigned} upcoming session${data.reassigned !== 1 ? 's' : ''} reassigned.`)
    router.refresh()
  }

  // Only show teachers who teach the same instrument; fall back to all if none match
  const eligible  = teachers.filter(t => !instrument || t.instrument?.toLowerCase() === instrument?.toLowerCase())
  const listToShow = eligible.length > 0 ? eligible : teachers
  const noMatch    = eligible.length === 0 && teachers.length > 0

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem',
    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  }

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
        Change Teacher
      </p>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
        Selecting a new teacher will reassign all <strong style={{ color: '#fff' }}>upcoming</strong> sessions to them. Completed sessions stay with the original teacher. An email will be sent to all parties.
      </p>

      {success && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', fontSize: '0.88rem', color: '#2ECC71' }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleChange} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px', flexWrap: 'wrap' }}>
        {noMatch && (
          <div style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.25)', borderRadius: '8px', fontSize: '0.82rem', color: '#F5A623', marginBottom: '0.5rem' }}>
            ⚠ No {instrument} teachers found — showing all teachers
          </div>
        )}
        <select style={{ ...inputStyle, flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select new teacher</option>
          {listToShow.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.instrument}{t.id === currentTeacherId ? ' (current)' : ''}
            </option>
          ))}
        </select>

        {error && (
          <div style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !selected || selected === currentTeacherId} style={{
          padding: '0.75rem 1.4rem', background: '#E8633A', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
          fontSize: '0.9rem', opacity: (loading || !selected || selected === currentTeacherId) ? 0.5 : 1,
          fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}>
          {loading ? 'Updating...' : 'Change Teacher'}
        </button>
      </form>
    </div>
  )
}
