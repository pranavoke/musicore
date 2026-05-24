'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Vocals']

export default function NewTeacherPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', instrument: '', whatsapp_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create teacher')
      router.push('/admin/teachers')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Admin · Teachers</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Add New Teacher</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
        </div>

        <div>
          <label style={labelStyle}>Email Address *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" required />
        </div>

        <div>
          <label style={labelStyle}>Temporary Password *</label>
          <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
        </div>

        <div>
          <label style={labelStyle}>Instrument *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.instrument} onChange={e => set('instrument', e.target.value)} required>
            <option value="">Select instrument</option>
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>WhatsApp Number</label>
          <input style={inputStyle} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="971XXXXXXXXX" />
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
          }}>{loading ? 'Creating...' : 'Create Teacher'}</button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '0.85rem 1.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
