import Sidebar from '@/components/Sidebar'

export const metadata = { title: 'Admin Portal — Musicore' }

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B09', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar role="admin" />
      <main className="portal-main">
        {children}
      </main>
    </div>
  )
}
