import Sidebar from '@/components/Sidebar'

export const metadata = { title: 'Teacher Portal — Musicore' }

export default function TeacherLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B09', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar role="teacher" />
      <main className="portal-main">
        {children}
      </main>
    </div>
  )
}
