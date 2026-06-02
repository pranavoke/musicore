'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS = {
  upcoming:    { bg: 'rgba(46,204,113,0.12)',  color: '#2ECC71', border: 'rgba(46,204,113,0.3)' },
  completed:   { bg: 'rgba(74,144,217,0.12)',  color: '#4A90D9', border: 'rgba(74,144,217,0.3)' },
  cancelled:   { bg: 'rgba(220,50,50,0.1)',    color: '#ff6b6b', border: 'rgba(220,50,50,0.3)' },
  rescheduled: { bg: 'rgba(232,99,58,0.12)',   color: '#E8633A', border: 'rgba(232,99,58,0.3)' },
}

function EditTimeInline({ session, onSaved }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(session.booking_date || '')
  const [time, setTime] = useState(session.booking_time?.slice(0, 5) || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/lesson-plans/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_date: date, booking_time: time }),
    })
    setSaving(false)
    setOpen(false)
    onSaved()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px', padding: '0.3rem 0.5rem', color: '#fff', fontSize: '0.8rem',
    outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>
      Edit
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
      <input type="time" style={inputStyle} value={time} onChange={e => setTime(e.target.value)} />
      <button onClick={save} disabled={saving} style={{ fontSize: '0.72rem', color: '#2ECC71', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', borderRadius: '5px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>
        {saving ? '...' : 'Save'}
      </button>
      <button onClick={() => setOpen(false)} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
    </div>
  )
}

function StatusChanger({ session, onChanged }) {
  const [changing, setChanging] = useState(false)
  const statuses = ['upcoming', 'completed', 'cancelled', 'rescheduled']

  async function change(newStatus) {
    setChanging(true)
    await fetch(`/api/admin/lesson-plans/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setChanging(false)
    onChanged()
  }

  const s = STATUS_COLORS[session.status] || STATUS_COLORS.upcoming
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={session.status}
        onChange={e => change(e.target.value)}
        disabled={changing}
        style={{
          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          borderRadius: '100px', padding: '0.2rem 0.6rem', fontSize: '0.72rem',
          fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
          textTransform: 'capitalize', appearance: 'none', paddingRight: '1.2rem',
        }}>
        {statuses.map(st => <option key={st} value={st} style={{ background: '#1a1a1a', color: '#fff' }}>{st}</option>)}
      </select>
    </div>
  )
}

export default function LessonPlanGroups({ grouped }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState({})
  const refresh = () => router.refresh()

  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {grouped.map((group, gi) => {
        const key = group.group_id || `single-${gi}`
        const isOpen = expanded[key]
        const total = group.sessions.length
        const completed = group.sessions.filter(s => s.status === 'completed').length
        const progress = total > 0 ? (completed / total) * 100 : 0
        const isGroup = total > 1
        const next = group.sessions.find(s => s.status === 'upcoming')

        return (
          <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            {/* Group header */}
            <div
              style={{ padding: '1.2rem 1.6rem', cursor: isGroup ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              onClick={() => isGroup && toggle(key)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{group.student?.name || 'Unknown Student'}</span>
                  {group.teacher?.name && (
                    <>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>with</span>
                      <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{group.teacher.name}</span>
                    </>
                  )}
                  {[group.instrument, group.lesson_format, group.plan ? `${group.plan} Plan` : null].filter(Boolean).map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.15rem 0.6rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{tag}</span>
                  ))}
                </div>

                {next && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Next: {next.booking_date}{next.booking_time ? ` · ${next.booking_time.slice(0, 5)}` : ''} · {group.duration} min
                  </div>
                )}

                {/* Progress bar — only for grouped plans */}
                {isGroup && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>PROGRESS</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: completed === total ? '#2ECC71' : '#E8633A' }}>
                        {completed}/{total} sessions
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden', width: '100%', maxWidth: '300px' }}>
                      <div style={{
                        height: '100%', width: `${progress}%`,
                        background: completed === total ? '#2ECC71' : 'linear-gradient(to right, #E8633A, #f0854d)',
                        borderRadius: '100px', transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                {/* Single session shows status badge inline */}
                {!isGroup && (
                  <StatusChanger session={group.sessions[0]} onChanged={refresh} />
                )}
                {isGroup && (
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', userSelect: 'none' }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded session list */}
            {(isGroup && isOpen) && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {group.sessions.map((session, si) => {
                  const s = STATUS_COLORS[session.status] || STATUS_COLORS.upcoming
                  return (
                    <div key={session.id} style={{
                      padding: '0.9rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                      borderBottom: si < group.sessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: si % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'rgba(232,99,58,0.4)', width: '28px' }}>
                          {String(si + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                            {session.booking_date || 'No date set'}{session.booking_time ? ` · ${session.booking_time.slice(0, 5)}` : ''}
                          </div>
                          {session.admin_notes && (
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px', fontStyle: 'italic' }}>{session.admin_notes}</div>
                          )}
                        </div>
                        <EditTimeInline session={session} onSaved={refresh} />
                      </div>
                      <StatusChanger session={session} onChanged={refresh} />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Single session edit row (always shown) */}
            {!isGroup && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 1.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                  {group.sessions[0].booking_date || 'No date'}{group.sessions[0].booking_time ? ` · ${group.sessions[0].booking_time.slice(0, 5)}` : ''}
                </span>
                <EditTimeInline session={group.sessions[0]} onSaved={refresh} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
