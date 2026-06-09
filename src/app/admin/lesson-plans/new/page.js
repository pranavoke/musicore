'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FORMATS = ['Online', 'At Home', 'Group Lesson', 'Individual Lesson']
const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Vocals']

export default function NewLessonPlanPage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({
    teacher_id: '', student_id: '', instrument: '', booking_date: '',
    booking_time: '', duration: '60', lesson_format: '', admin_notes: '', status: 'upcoming',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const supabase = createClient()
    supabase.from('teachers').select('id, name').order('name').then(({ data }) => setTeachers(data || []))
    supabase.from('students').select('id, name, instrument, assigned_teacher_id').order('name').then(({ data }) => setStudents(data || []))
  }, [])

  // Filter students by selected teacher
  const filteredStudents = form.teacher_id
    ? students.filter(s => s.assigned_teacher_id === form.teacher_id)
    : students

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('lesson_plans').insert({
      ...form, duration: parseInt(form.duration),
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/lesson-plans')
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.93rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }
  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Admin · Lesson Plans</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Create Lesson Plan</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Teacher *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.teacher_id} onChange={e => { set('teacher_id', e.target.value); set('student_id', '') }} required>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Student *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.student_id} onChange={e => set('student_id', e.target.value)} required>
              <option value="">Select student</option>
              {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Instrument *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.instrument} onChange={e => set('instrument', e.target.value)} required>
              <option value="">Select instrument</option>
              {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Lesson Format *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.lesson_format} onChange={e => set('lesson_format', e.target.value)} required>
              <option value="">Select format</option>
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={form.booking_date} onChange={e => set('booking_date', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" style={inputStyle} value={form.booking_time} onChange={e => set('booking_time', e.target.value)} required />
          </div>
        </div>

        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Duration *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.duration} onChange={e => set('duration', e.target.value)}>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Admin Notes</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)} placeholder="Any notes for the teacher..." />
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
          }}>{loading ? 'Creating...' : 'Create Lesson Plan'}</button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '0.85rem 1.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
