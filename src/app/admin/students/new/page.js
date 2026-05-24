'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Vocals']

function NewStudentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({
    name: '', whatsapp_number: '', parent_whatsapp_number: '',
    instrument: '', assigned_teacher_id: searchParams.get('teacher') || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const supabase = createClient()
    supabase.from('teachers').select('id, name, instrument').order('name').then(({ data }) => setTeachers(data || []))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('students').insert({
      ...form,
      assigned_teacher_id: form.assigned_teacher_id || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/students')
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.93rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Admin · Students</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Add New Student</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={labelStyle}>Student Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Johnson" required />
        </div>

        <div>
          <label style={labelStyle}>Student WhatsApp Number</label>
          <input style={inputStyle} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="971XXXXXXXXX" />
        </div>

        <div>
          <label style={labelStyle}>Parent WhatsApp Number</label>
          <input style={inputStyle} value={form.parent_whatsapp_number} onChange={e => set('parent_whatsapp_number', e.target.value)} placeholder="971XXXXXXXXX (optional)" />
        </div>

        <div>
          <label style={labelStyle}>Instrument *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.instrument} onChange={e => set('instrument', e.target.value)} required>
            <option value="">Select instrument</option>
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Assign Teacher</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.assigned_teacher_id} onChange={e => set('assigned_teacher_id', e.target.value)}>
            <option value="">Select teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>)}
          </select>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="submit" disabled={loading} style={{
            flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: '#E8633A', color: '#fff', fontSize: '0.95rem', fontWeight: 500, opacity: loading ? 0.7 : 1,
          }}>{loading ? 'Adding...' : 'Add Student'}</button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '0.85rem 1.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function NewStudentPage() {
  return <Suspense fallback={<div style={{ color: '#fff', padding: '2rem' }}>Loading...</div>}><NewStudentForm /></Suspense>
}
