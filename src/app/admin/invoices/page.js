'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InvoicesPage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [month, setMonth] = useState(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('teachers').select('id, name, instrument').order('name')
      .then(({ data }) => setTeachers(data || []))
  }, [])

  function handleGenerate(e) {
    e.preventDefault()
    if (!teacherId || !month) return
    router.push(`/admin/invoices/${teacherId}/${month}`)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.93rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.4rem', letterSpacing: '0.04em',
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Admin · Invoices</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Generate Invoice</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '0.5rem' }}>Select a teacher and billing month to generate their tax invoice.</p>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={labelStyle}>Teacher *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
            <option value="">Select teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Billing Month *</label>
          <input type="month" style={inputStyle} value={month} onChange={e => setMonth(e.target.value)} required />
        </div>

        <button type="submit" style={{
          marginTop: '0.5rem', padding: '0.85rem', borderRadius: '8px', border: 'none',
          cursor: 'pointer', background: '#E8633A', color: '#fff', fontSize: '0.95rem', fontWeight: 500,
        }}>
          Generate Invoice
        </button>
      </form>
    </div>
  )
}
