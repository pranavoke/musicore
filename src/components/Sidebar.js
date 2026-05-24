'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_NAV = [
  { label: 'Dashboard',     href: '/admin',               icon: '◈'  },
  { label: 'Teachers',      href: '/admin/teachers',       icon: '🎓' },
  { label: 'Students',      href: '/admin/students',       icon: '👤' },
  { label: 'Lesson Plans',  href: '/admin/lesson-plans',   icon: '📅' },
]

const TEACHER_NAV = [
  { label: 'Dashboard',      href: '/teacher',             icon: '◈'  },
  { label: 'Log Attendance', href: '/teacher/attendance',  icon: '✏️' },
  { label: 'Lesson History', href: '/teacher/history',     icon: '📋' },
  { label: 'My Schedule',    href: '/teacher/schedule',    icon: '📅' },
]

export default function Sidebar({ role }) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = role === 'admin' ? ADMIN_NAV : TEACHER_NAV
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function navTo(href) {
    setOpen(false)
    router.push(href)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.8rem 1.5rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.08em', color: '#fff' }}>
            MUSI<span style={{ color: '#E8633A' }}>CORE</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
            {role === 'admin' ? 'Admin Portal' : 'Teacher Portal'}
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} className="mobile-only" style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0.2rem',
        }}>✕</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1.2rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && item.href !== '/teacher' && pathname.startsWith(item.href))
          return (
            <button key={item.href} onClick={() => navTo(item.href)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: isActive ? 'rgba(232,99,58,0.12)' : 'transparent',
              color: isActive ? '#E8633A' : 'rgba(255,255,255,0.5)',
              fontSize: '0.88rem', fontWeight: isActive ? 500 : 400,
              textAlign: 'left', width: '100%', transition: 'all 0.15s',
              borderLeft: isActive ? '2px solid #E8633A' : '2px solid transparent',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
            >
              <span style={{ fontSize: '1rem', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={handleSignOut} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'rgba(255,255,255,0.35)',
          fontSize: '0.85rem', width: '100%', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,50,50,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent' }}
        >
          <span>↩</span> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="desktop-sidebar" style={{
        width: '240px', minHeight: '100vh', background: '#080604',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        fontFamily: "'DM Sans', sans-serif", zIndex: 50,
      }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="mobile-header" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#080604', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 1.2rem', height: '56px',
        alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.08em', color: '#fff' }}>
          MUSI<span style={{ color: '#E8633A' }}>CORE</span>
        </div>
        <button onClick={() => setOpen(true)} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '0.45rem 0.65rem', cursor: 'pointer', color: '#fff',
          fontSize: '1.1rem', lineHeight: 1,
        }}>☰</button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 98, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside className="mobile-drawer" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
        background: '#080604', borderRight: '1px solid rgba(255,255,255,0.08)',
        zIndex: 99, display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <SidebarContent />
      </aside>
    </>
  )
}
