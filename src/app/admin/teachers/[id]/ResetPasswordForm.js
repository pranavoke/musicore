'use client'
import { useState } from 'react'

export default function ResetPasswordForm({ teacherId }) {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [show,      setShow]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match"); return }
    if (password.length < 6)  { setError('Minimum 6 characters');  return }

    setLoading(true); setError(''); setSuccess(false)
    const res  = await fetch(`/api/admin/teachers/${teacherId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Failed to reset'); return }
    setSuccess(true)
    setPassword(''); setConfirm('')
    setTimeout(() => setSuccess(false), 4000)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
        Reset Password
      </p>

      {success && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', fontSize: '0.88rem', color: '#2ECC71' }}>
          ✓ Password updated successfully
        </div>
      )}

      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>

        <input
          type={show ? 'text' : 'password'}
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={inputStyle}
          required
        />

        {error && (
          <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          padding: '0.75rem 1.4rem', background: '#E8633A', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
          fontSize: '0.9rem', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', alignSelf: 'flex-start',
        }}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
