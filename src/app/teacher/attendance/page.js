'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FORMATS = ['Online', 'Offline', 'Individual Lesson', 'Group Lesson']

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

function VideoUpload({ onUploadComplete }) {
  const [status, setStatus] = useState('idle') // idle | uploading | done | error
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  async function uploadFile(file) {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setStatus('error')
      return
    }
    const maxMB = 100
    if (file.size > maxMB * 1024 * 1024) {
      setStatus('error')
      setFileName(`File too large (max ${maxMB}MB)`)
      return
    }

    setFileName(file.name)
    setStatus('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('resource_type', 'video')

    try {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status === 200 && data.secure_url) {
          setVideoUrl(data.secure_url)
          setStatus('done')
          onUploadComplete(data.secure_url)
        } else {
          setStatus('error')
          setFileName(data.error?.message || 'Upload failed')
        }
      }
      xhr.onerror = () => { setStatus('error'); setFileName('Network error') }
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
      xhr.send(formData)
    } catch {
      setStatus('error')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    uploadFile(e.dataTransfer.files[0])
  }

  function handleRemove() {
    setStatus('idle')
    setProgress(0)
    setFileName('')
    setVideoUrl('')
    onUploadComplete('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
        Lesson Video <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional · max 100MB)</span>
      </label>

      {status === 'done' ? (
        /* Uploaded state */
        <div style={{ border: '1px solid rgba(46,204,113,0.3)', borderRadius: '10px', padding: '1rem 1.2rem', background: 'rgba(46,204,113,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🎥</span>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#2ECC71', fontWeight: 500 }}>✓ Video uploaded</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
            </div>
          </div>
          <button type="button" onClick={handleRemove} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Remove
          </button>
        </div>
      ) : status === 'uploading' ? (
        /* Progress state */
        <div style={{ border: '1px solid rgba(232,99,58,0.3)', borderRadius: '10px', padding: '1.2rem 1.4rem', background: 'rgba(232,99,58,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)' }}>Uploading {fileName}</span>
            <span style={{ fontSize: '0.83rem', color: '#E8633A', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#E8633A', borderRadius: '100px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `1px dashed ${dragOver ? '#E8633A' : status === 'error' ? 'rgba(220,50,50,0.4)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '10px', padding: '1.8rem', textAlign: 'center',
            background: dragOver ? 'rgba(232,99,58,0.05)' : 'rgba(255,255,255,0.02)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🎥</div>
          <div style={{ fontSize: '0.88rem', color: dragOver ? '#E8633A' : 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>
            {status === 'error' ? (fileName || 'Invalid file — try again') : 'Drop video here or click to browse'}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.25)' }}>MP4, MOV, WebM · up to 100MB</div>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0])} />
        </div>
      )}
    </div>
  )
}

export default function AttendancePage() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [teacherId, setTeacherId] = useState(null)
  const [form, setForm] = useState({
    student_id: '',
    lesson_format: '',
    lesson_date: new Date().toISOString().split('T')[0],
    duration: '60',
    comments: '',
    video_url: '',
    status: 'submitted',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (teacher) {
        setTeacherId(teacher.id)
        const { data: studentList } = await supabase
          .from('students')
          .select('id, name, instrument')
          .eq('assigned_teacher_id', teacher.id)
          .order('name')
        setStudents(studentList || [])
      }
    }
    load()
  }, [])

  async function handleSubmit(e, submitStatus) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: submitStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      if (submitStatus === 'submitted') {
        setSuccess(true)
        setForm({ student_id: '', lesson_format: '', lesson_date: new Date().toISOString().split('T')[0], duration: '60', comments: '', video_url: '', status: 'submitted' })
      } else {
        router.push('/teacher/history')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.93rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    colorScheme: 'dark',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.4rem', letterSpacing: '0.04em',
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Teacher Portal</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Log Attendance</h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>Record details for a completed lesson</p>
      </div>

      {success && (
        <div style={{
          background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)',
          borderRadius: '10px', padding: '1rem 1.4rem', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ color: '#2ECC71', fontWeight: 500, fontSize: '0.92rem' }}>✓ Lesson recorded successfully</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '2px' }}>You can log another lesson below</div>
          </div>
          <button onClick={() => router.push('/teacher/history')}
            style={{ fontSize: '0.8rem', color: '#2ECC71', background: 'none', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
            View History
          </button>
        </div>
      )}

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Student */}
        <div>
          <label style={labelStyle}>Student *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.student_id} onChange={e => set('student_id', e.target.value)} required>
            <option value="">Select student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} {s.instrument ? `(${s.instrument})` : ''}</option>
            ))}
          </select>
          {students.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
              No students assigned to you yet. Contact your admin.
            </p>
          )}
        </div>

        {/* Format + Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Lesson Format *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.lesson_format} onChange={e => set('lesson_format', e.target.value)} required>
              <option value="">Select format</option>
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Lesson Date *</label>
            <input type="date" style={inputStyle} value={form.lesson_date} onChange={e => set('lesson_date', e.target.value)} required />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={labelStyle}>Duration *</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['45', '60'].map(d => (
              <button type="button" key={d} onClick={() => set('duration', d)} style={{
                flex: 1, padding: '0.7rem', borderRadius: '8px', cursor: 'pointer',
                border: form.duration === d ? '1px solid #E8633A' : '1px solid rgba(255,255,255,0.1)',
                background: form.duration === d ? 'rgba(232,99,58,0.12)' : 'rgba(255,255,255,0.03)',
                color: form.duration === d ? '#E8633A' : 'rgba(255,255,255,0.5)',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: form.duration === d ? 500 : 400,
                transition: 'all 0.15s',
              }}>{d} minutes</button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label style={labelStyle}>Lesson Notes</label>
          <textarea
            rows={5}
            placeholder="Lesson summary, student performance, homework assigned, areas to improve, practice recommendations..."
            value={form.comments}
            onChange={e => set('comments', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {/* Video upload */}
        <VideoUpload onUploadComplete={url => set('video_url', url)} />

        {error && (
          <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            disabled={loading || !form.student_id || !form.lesson_format || !form.lesson_date}
            onClick={e => handleSubmit(e, 'submitted')}
            style={{
              flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none',
              background: '#E8633A', color: '#fff', fontSize: '0.95rem', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !form.student_id || !form.lesson_format) ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}>
            {loading ? 'Saving...' : '✓ Submit Record'}
          </button>
          <button
            type="button"
            disabled={loading || !form.student_id}
            onClick={e => handleSubmit(e, 'draft')}
            style={{
              padding: '0.85rem 1.4rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.92rem', cursor: 'pointer',
            }}>
            Save Draft
          </button>
        </div>
      </form>
    </div>
  )
}
