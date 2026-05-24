'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch role and redirect
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    const role = roleData?.role
    if (role === 'admin') router.push('/admin')
    else if (role === 'teacher') router.push('/teacher')
    else setError('No role assigned. Contact your administrator.')

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0806',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: '0.08em', color: '#fff' }}>
            MUSI<span style={{ color: '#E8633A' }}>CORE</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '4px' }}>
            Staff Portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '2.5rem',
        }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 500, color: '#fff', margin: '0 0 0.4rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 2rem' }}>Sign in to your account</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff',
                  fontSize: '0.93rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,99,58,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff',
                  fontSize: '0.93rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,99,58,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#E8633A', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem', fontWeight: 500, opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s', marginTop: '0.5rem',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d4572f' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#E8633A' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
