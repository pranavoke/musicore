'use client'
import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

function PhotoUpload({ currentUrl, onUploadComplete }) {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  async function uploadFile(file) {
    if (!file || !file.type.startsWith('image/')) { setStatus('error'); return }
    setStatus('uploading'); setProgress(0)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('resource_type', 'image')
    try {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status === 200 && data.secure_url) { onUploadComplete(data.secure_url); setStatus('done') }
        else { setStatus('error') }
      }
      xhr.onerror = () => setStatus('error')
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
      xhr.send(formData)
    } catch { setStatus('error') }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', width: '100%', fontFamily: "'DM Sans', sans-serif" }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Preview */}
      <div style={{ width: '120px', height: '150px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {currentUrl
          ? <img src={currentUrl} alt="Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}>🖼</div>
        }
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Photo</label>
        {status === 'uploading' ? (
          <div style={{ background: 'rgba(232,99,58,0.08)', border: '1px solid rgba(232,99,58,0.2)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Uploading…</span>
              <span style={{ fontSize: '0.82rem', color: '#E8633A', fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#E8633A', borderRadius: '4px', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={currentUrl || ''} onChange={e => onUploadComplete(e.target.value)} placeholder="Paste image URL, or upload below" />
            <button type="button" onClick={() => inputRef.current?.click()} style={{ padding: '0.7rem 1rem', background: 'rgba(232,99,58,0.1)', border: '1px solid rgba(232,99,58,0.3)', color: '#E8633A', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
              Upload
            </button>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0])} />
          </div>
        )}
        {status === 'done' && <p style={{ fontSize: '0.78rem', color: '#2ECC71', marginTop: '0.4rem' }}>✓ Photo uploaded</p>}
        {status === 'error' && <p style={{ fontSize: '0.78rem', color: '#ff6b6b', marginTop: '0.4rem' }}>Upload failed — try again or paste a URL directly</p>}
      </div>
    </div>
  )
}

export default function TeacherProfileEditor({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    slug: '',
    subtitle: '',
    bio: '',
    photo_url: '',
    tags: [],
    learn_items: [],
    languages: '',
    instruments_text: '',
    experience: '',
    is_published: false,
  })
  const [tagInput, setTagInput] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: t } = await supabase.from('teachers').select('*').eq('id', id).single()
      if (!t) { setLoading(false); return }
      setTeacher(t)
      setForm({
        slug: t.slug || t.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
        subtitle: t.subtitle || '',
        bio: t.bio || '',
        photo_url: t.photo_url || '',
        tags: t.tags || [],
        learn_items: t.learn_items || [],
        languages: t.languages || '',
        instruments_text: t.instruments_text || t.instrument || '',
        experience: t.experience || '',
        is_published: t.is_published || false,
      })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch(`/api/admin/teachers/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function addTag(raw) {
    const tag = raw.trim()
    if (tag && !form.tags.includes(tag)) set('tags', [...form.tags, tag])
  }

  function removeTag(tag) {
    set('tags', form.tags.filter(t => t !== tag))
  }

  function addLearnItem() {
    set('learn_items', [...form.learn_items, { title: '', desc: '' }])
  }

  function updateLearnItem(i, field, val) {
    const updated = form.learn_items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
    set('learn_items', updated)
  }

  function removeLearnItem(i) {
    set('learn_items', form.learn_items.filter((_, idx) => idx !== i))
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', width: '100%', fontFamily: "'DM Sans', sans-serif" }
  const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading…</div>
  if (!teacher) return <div style={{ color: '#ff6b6b', padding: '2rem' }}>Teacher not found.</div>

  const publicUrl = form.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/teachers/${form.slug}` : null

  return (
    <div style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.push(`/admin/teachers/${id}`)} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
          ← Back to {teacher.name}
        </button>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Public Profile</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#fff', letterSpacing: '0.02em', margin: '0 0 0.5rem' }}>{teacher.name}</h1>

        {/* Publish toggle + shareable link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <div
              onClick={() => set('is_published', !form.is_published)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
                background: form.is_published ? '#E8633A' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
              }}>
              <div style={{
                position: 'absolute', top: '3px', left: form.is_published ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: form.is_published ? '#E8633A' : 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
              {form.is_published ? 'Published — visible on website' : 'Draft — hidden from website'}
            </span>
          </label>

          {form.is_published && publicUrl && (
            <button onClick={() => navigator.clipboard.writeText(publicUrl).then(() => alert('Link copied!'))}
              style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              📋 Copy shareable link
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

        {/* Photo */}
        <PhotoUpload currentUrl={form.photo_url} onUploadComplete={url => set('photo_url', url)} />

        {/* Slug + subtitle + experience */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>URL Slug *</label>
            <input style={inputStyle} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="adil-iqbal" />
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.3rem' }}>/teachers/{form.slug || '…'}</p>
          </div>
          <div>
            <label style={labelStyle}>Experience</label>
            <input style={inputStyle} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="15+" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Role / Subtitle</label>
          <input style={inputStyle} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Guitar and Ukulele Teacher" />
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Short paragraph about this teacher…" />
        </div>

        {/* Languages + instruments */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Languages</label>
            <input style={inputStyle} value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="English & Urdu" />
          </div>
          <div>
            <label style={labelStyle}>Instruments</label>
            <input style={inputStyle} value={form.instruments_text} onChange={e => set('instruments_text', e.target.value)} placeholder="Electric & Acoustic Guitar" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Specialty Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
            {form.tags.map(tag => (
              <span key={tag} style={{ background: 'rgba(232,99,58,0.12)', border: '1px solid rgba(232,99,58,0.35)', borderRadius: '100px', padding: '0.25rem 0.75rem', fontSize: '0.82rem', color: '#E8633A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'rgba(232,99,58,0.6)', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); setTagInput('') } }}
              placeholder="Type a tag, press Enter to add"
            />
            <button type="button" onClick={() => { addTag(tagInput); setTagInput('') }} style={{ padding: '0.7rem 1rem', background: 'rgba(232,99,58,0.1)', border: '1px solid rgba(232,99,58,0.3)', color: '#E8633A', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}>
              Add
            </button>
          </div>
        </div>

        {/* Learn items */}
        <div>
          <label style={labelStyle}>What Students Will Learn</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.learn_items.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.9rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1.6fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <input style={inputStyle} value={item.title} onChange={e => updateLearnItem(i, 'title', e.target.value)} placeholder="e.g. Guitar fundamentals" />
                <input style={inputStyle} value={item.desc} onChange={e => updateLearnItem(i, 'desc', e.target.value)} placeholder="e.g. Chords, rhythm & picking" />
                <button onClick={() => removeLearnItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 4px', borderRadius: '4px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >✕</button>
              </div>
            ))}
            <button onClick={addLearnItem} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif', textAlign: 'left'", transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,99,58,0.4)'; e.currentTarget.style.color = '#E8633A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Save */}
        {error && (
          <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>{error}</div>
        )}
        {saved && (
          <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#2ECC71' }}>✓ Profile saved successfully</div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '0.88rem', borderRadius: '8px', border: 'none', background: '#E8633A', color: '#fff', fontSize: '0.95rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {form.slug && (
            <a href={`/teachers/${form.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.88rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
              Preview ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
