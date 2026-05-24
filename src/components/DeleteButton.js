'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ endpoint, label = 'Delete', redirectTo }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
      setConfirming(false)
    }
  }

  if (error) return (
    <span style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{error}</span>
  )

  if (confirming) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Sure?</span>
      <button onClick={handleDelete} disabled={loading} style={{
        padding: '0.3rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
        background: '#dc3545', color: '#fff', fontSize: '0.78rem', fontWeight: 500,
        opacity: loading ? 0.7 : 1,
      }}>{loading ? '...' : 'Yes, delete'}</button>
      <button onClick={() => setConfirming(false)} style={{
        padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)',
        background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer',
      }}>Cancel</button>
    </div>
  )

  return (
    <button onClick={() => setConfirming(true)} style={{
      padding: '0.3rem 0.75rem', borderRadius: '6px',
      border: '1px solid rgba(220,50,50,0.3)', background: 'rgba(220,50,50,0.08)',
      color: '#ff6b6b', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,50,50,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,50,50,0.08)' }}
    >{label}</button>
  )
}
