'use client'
import { useState } from 'react'
import Link from 'next/link'

const STATUS_COLORS = {
  submitted: { bg: 'rgba(46,204,113,0.12)', color: '#2ECC71', border: 'rgba(46,204,113,0.3)' },
  draft: { bg: 'rgba(232,99,58,0.12)', color: '#E8633A', border: 'rgba(232,99,58,0.3)' },
}

export default function LessonHistoryClient({ lessons }) {
  const [search, setSearch] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const formats = [...new Set(lessons.map(l => l.lesson_format).filter(Boolean))]

  const filtered = lessons.filter(l => {
    const matchSearch = !search || l.students?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFormat = !filterFormat || l.lesson_format === filterFormat
    return matchSearch && matchFormat
  })

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '220px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '0.65rem 1rem', color: '#fff',
            fontSize: '0.88rem', outline: 'none', fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <select
          value={filterFormat}
          onChange={e => setFilterFormat(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '0.65rem 1rem', color: filterFormat ? '#fff' : 'rgba(255,255,255,0.4)',
            fontSize: '0.88rem', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <option value="">All formats</option>
          {formats.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {(search || filterFormat) && (
          <button onClick={() => { setSearch(''); setFilterFormat('') }} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '0.65rem 1rem', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ marginBottom: '1rem' }}>{lessons.length === 0 ? 'No lessons recorded yet' : 'No lessons match your search'}</p>
          {lessons.length === 0 && (
            <Link href="/teacher/attendance" style={{ color: '#E8633A', fontSize: '0.88rem' }}>Log your first lesson →</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(lesson => {
            const s = STATUS_COLORS[lesson.status] || STATUS_COLORS.submitted
            const isExpanded = expandedId === lesson.id
            return (
              <div key={lesson.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s',
              }}>
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '1.1rem 1.4rem', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: '1rem', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.93rem' }}>
                        {lesson.students?.name}
                        <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                          {lesson.students?.instrument}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                        {lesson.lesson_date} · {lesson.lesson_format} · {lesson.duration} min
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.22rem 0.7rem', borderRadius: '100px',
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      textTransform: 'capitalize', fontWeight: 500,
                    }}>{lesson.status}</span>
                    {lesson.video_url && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>🎥</span>
                    )}
                    <span style={{
                      color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>›</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.4rem 1.2rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lesson Notes</p>
                      {lesson.comments ? (
                        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{lesson.comments}</p>
                      ) : (
                        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No notes recorded</p>
                      )}
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem' }}>
                        Recorded {new Date(lesson.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
