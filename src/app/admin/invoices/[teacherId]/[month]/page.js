'use client'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const RATES = {
  Online: { 30: 80, 45: 100, 60: 120 },
  default: { 30: 125, 45: 150, 60: 180 },
}

function getLessonValue(format, duration) {
  const table = RATES[format] ?? RATES.default
  return table[parseInt(duration)] ?? 0
}

function toWords(n) {
  if (n === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '')
  return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMonth(month) {
  const [year, mon] = month.split('-')
  return new Date(parseInt(year), parseInt(mon) - 1, 1)
    .toLocaleDateString('en-AE', { month: 'long', year: 'numeric' })
}

function getInvoiceNo(teacherName, month) {
  const [year, mon] = month.split('-')
  const initials = teacherName.trim().split(/\s+/).map(p => p[0].toUpperCase()).join('').slice(0, 3)
  return `${year.slice(2)}${initials}${mon}01`
}

const InvoiceHeader = ({ invoiceNo, month }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '18px', borderBottom: '2.5px solid #E8633A' }}>
    <div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.08em', color: '#111', lineHeight: 1 }}>
        MUSI<span style={{ color: '#E8633A' }}>CORE</span>
      </div>
      <div style={{ fontSize: '0.62rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>The Musician In You</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.04em', color: '#111' }}>TAX INVOICE</div>
      <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>Invoice No: <strong>{invoiceNo}</strong></div>
      <div style={{ fontSize: '0.8rem', color: '#555' }}>Date: <strong>{formatMonth(month)}</strong></div>
    </div>
  </div>
)

// Inline editable cell — looks like plain text, editable on click
function EditCell({ value, onChange, placeholder = '', align = 'left', type = 'text', bold = false }) {
  return (
    <input
      className="edit-input"
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', border: 'none', outline: 'none', background: 'transparent',
        fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: 0,
        textAlign: align, fontWeight: bold ? 600 : 'inherit', cursor: 'text',
        minWidth: type === 'number' ? '50px' : '40px',
      }}
    />
  )
}

export default function InvoicePage({ params }) {
  const { teacherId, month } = use(params)
  const router = useRouter()
  const [teacher, setTeacher] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [year, mon] = month.split('-').map(Number)
      const startDate = `${month}-01`
      const lastDay = new Date(year, mon, 0).getDate()
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from('teachers').select('*').eq('id', teacherId).single(),
        supabase.from('lessons')
          .select('*, students(name)')
          .eq('teacher_id', teacherId)
          .eq('status', 'submitted')
          .gte('lesson_date', startDate)
          .lte('lesson_date', endDate)
          .order('lesson_date'),
      ])
      setTeacher(t)
      setRows((l || []).map(lesson => ({
        id: lesson.id,
        student: lesson.students?.name || '',
        date: lesson.lesson_date || '',
        type: lesson.lesson_format || '',
        duration: String(lesson.duration || ''),
        comment: lesson.comments || '',
        value: getLessonValue(lesson.lesson_format, lesson.duration),
        isCustom: false,
      })))
      setLoading(false)
    }
    load()
  }, [teacherId, month])

  const updateRow = (id, field, val) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const deleteRow = (id) =>
    setRows(prev => prev.filter(r => r.id !== id))

  const addRow = () =>
    setRows(prev => [...prev, {
      id: `custom-${Date.now()}`,
      student: '', date: '', type: '', duration: '', comment: '', value: 0, isCustom: true,
    }])

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', padding: '2rem' }}>Loading invoice...</div>
  if (!teacher) return <div style={{ color: '#ff6b6b', padding: '2rem' }}>Teacher not found.</div>

  const invoiceNo = getInvoiceNo(teacher.name, month)
  const totalValue = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0)

  const headCell = { padding: '8px 10px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
  const cell = { padding: '6px 10px', verticalAlign: 'middle' }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .invoice-card { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
          .invoice-p1 { padding: 16mm 18mm !important; }
          .invoice-p2 { padding: 16mm 18mm !important; page-break-before: always; border-top: none !important; }
          .invoice-table th, .invoice-table td { font-size: 9pt !important; padding: 4px 7px !important; }
          .remarks-box { font-size: 9pt !important; border: 1px solid #ccc !important; }
          .edit-input { cursor: default !important; }
          .row-editing { background: #fff !important; }
          @page { size: A4; margin: 0; }
        }
        .edit-cell-wrap:hover { background: rgba(232,99,58,0.04); border-radius: 3px; }
        .edit-cell-wrap:focus-within { background: rgba(232,99,58,0.07); border-radius: 3px; outline: 1px solid rgba(232,99,58,0.35); }
        .edit-input::placeholder { color: #ccc; font-style: italic; }
        .row-editing:hover td { background: rgba(255,248,230,0.6) !important; }
      `}</style>

      {/* Admin controls */}
      <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{
          padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer',
        }}>Back</button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Admin · Invoices</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
            {teacher.name} — {formatMonth(month)}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            {rows.length} row{rows.length !== 1 ? 's' : ''} · AED {totalValue.toLocaleString()}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <button onClick={() => window.print()} style={{
              padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: '#E8633A', color: '#fff', fontSize: '0.9rem', fontWeight: 500,
            }}>🖨️ Print / Save PDF</button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
              To save PDF: print dialog → Destination → <em>Save as PDF</em>
            </span>
          </div>
        </div>
      </div>

      {/* Editing tip */}
      <div className="no-print" style={{ marginBottom: '1rem', padding: '0.65rem 1rem', background: 'rgba(232,99,58,0.08)', border: '1px solid rgba(232,99,58,0.2)', borderRadius: '8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#E8633A' }}>✎</span>
        Click any cell to edit. Change values, fix comments, delete rows, or add custom lines. Admin Remarks are on page 2.
      </div>

      {/* Invoice document */}
      <div className="invoice-card" style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 4px 40px rgba(0,0,0,0.5)', maxWidth: '900px', overflow: 'hidden' }}>

        {/* PAGE 1 — Lesson table */}
        <div className="invoice-p1" style={{ padding: '36px 44px', color: '#111' }}>
          <InvoiceHeader invoiceNo={invoiceNo} month={month} />

          {/* To / From */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: '#f7f7f7', borderRadius: '8px', padding: '16px 18px', borderLeft: '3px solid #E8633A' }}>
              <div style={{ fontSize: '0.67rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>To</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Musicore LLC</div>
              <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.55 }}>
                Sharjah Media City<br />Sharjah, United Arab Emirates<br />info@musicoreuae.com
              </div>
            </div>
            <div style={{ background: '#f7f7f7', borderRadius: '8px', padding: '16px 18px', borderLeft: '3px solid #E8633A' }}>
              <div style={{ fontSize: '0.67rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Professional Service From</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{teacher.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.55 }}>
                {teacher.instrument} Instructor<br />{teacher.email || ''}
              </div>
            </div>
          </div>

          {/* Editable lesson table */}
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#E8633A', color: '#fff' }}>
                <th style={{ ...headCell, width: '32px' }}>#</th>
                <th style={headCell}>Student</th>
                <th style={{ ...headCell }}>Date</th>
                <th style={headCell}>Type</th>
                <th style={{ ...headCell }}>Dur.</th>
                <th style={headCell}>Comment</th>
                <th style={{ ...headCell, textAlign: 'right' }}>Value (AED)</th>
                <th className="no-print" style={{ ...headCell, width: '32px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                    No lessons logged for this month. Add a custom row or ask the teacher to submit their attendance records.
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} className="row-editing"
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}
                >
                  <td style={{ ...cell, color: '#aaa', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{i + 1}</td>

                  <td style={cell}>
                    <div className="edit-cell-wrap">
                      <EditCell value={row.student} onChange={v => updateRow(row.id, 'student', v)} placeholder="Student name" />
                    </div>
                  </td>

                  <td style={cell}>
                    <div className="edit-cell-wrap" style={{ whiteSpace: 'nowrap' }}>
                      {row.isCustom ? (
                        <input
                          className="edit-input"
                          type="date"
                          value={row.date}
                          onChange={e => updateRow(row.id, 'date', e.target.value)}
                          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', cursor: 'text' }}
                        />
                      ) : (
                        <EditCell value={formatDate(row.date)} onChange={v => updateRow(row.id, 'date', v)} placeholder="Date" />
                      )}
                    </div>
                  </td>

                  <td style={cell}>
                    <div className="edit-cell-wrap">
                      <EditCell value={row.type} onChange={v => updateRow(row.id, 'type', v)} placeholder="Format" />
                    </div>
                  </td>

                  <td style={cell}>
                    <div className="edit-cell-wrap">
                      <EditCell value={row.duration ? `${row.duration} min` : ''} onChange={v => updateRow(row.id, 'duration', v.replace(/\D/g, ''))} placeholder="min" />
                    </div>
                  </td>

                  <td style={{ ...cell, minWidth: '120px' }}>
                    <div className="edit-cell-wrap">
                      <EditCell value={row.comment} onChange={v => updateRow(row.id, 'comment', v)} placeholder="Add comment..." />
                    </div>
                  </td>

                  <td style={cell}>
                    <div className="edit-cell-wrap">
                      <EditCell
                        value={String(row.value)}
                        onChange={v => updateRow(row.id, 'value', v === '' ? 0 : Number(v))}
                        type="number"
                        align="right"
                        bold
                        placeholder="0"
                      />
                    </div>
                  </td>

                  <td className="no-print" style={{ ...cell, textAlign: 'center' }}>
                    <button
                      onClick={() => deleteRow(row.id)}
                      title="Remove row"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ccc', fontSize: '1rem', lineHeight: 1, padding: '2px 4px',
                        borderRadius: '4px', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e53e3e'}
                      onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                    >✕</button>
                  </td>
                </tr>
              ))}

              {/* Running total row */}
              {rows.length > 0 && (
                <tr style={{ background: '#f7f7f7', borderTop: '2px solid #E8633A' }}>
                  <td colSpan={5} style={{ padding: '8px 10px' }} />
                  <td style={{ padding: '8px 10px', fontSize: '0.78rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtotal</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#E8633A' }}>{totalValue.toLocaleString()}</td>
                  <td className="no-print" />
                </tr>
              )}
            </tbody>
          </table>

          {/* Add row button */}
          <div className="no-print" style={{ marginTop: '0.75rem' }}>
            <button onClick={addRow} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed rgba(232,99,58,0.4)',
              background: 'rgba(232,99,58,0.04)', color: '#E8633A', fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,99,58,0.1)'; e.currentTarget.style.borderColor = '#E8633A' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,99,58,0.04)'; e.currentTarget.style.borderColor = 'rgba(232,99,58,0.4)' }}
            >
              + Add Custom Row
            </button>
          </div>
        </div>

        {/* PAGE 2 — Summary + signatures */}
        <div className="invoice-p2" style={{ padding: '36px 44px', color: '#111', borderTop: '6px solid #f0f0f0' }}>
          <InvoiceHeader invoiceNo={invoiceNo} month={month} />

          {/* Admin Remarks */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.67rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Admin Remarks</div>
            <textarea
              className="remarks-box"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add any remarks or notes before printing..."
              rows={4}
              style={{
                width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '12px',
                fontSize: '0.85rem', color: '#333', resize: 'vertical', fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box', background: '#fafafa',
              }}
            />
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ minWidth: '300px' }}>
              {[
                ['Total Lessons', rows.length],
                ['Total Value', `AED ${totalValue.toLocaleString()}`],
                ['Payment Adjustments', '0'],
                ['VAT @ 0%', '0'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                  <span style={{ color: '#666' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#E8633A', borderRadius: '6px', marginTop: '6px' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Total Payment AED</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{totalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div style={{ marginBottom: '36px', padding: '12px 16px', background: '#f7f7f7', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid #E8633A' }}>
            <span style={{ color: '#888', marginRight: '8px', fontWeight: 600 }}>Amount in Words:</span>
            <span style={{ color: '#111' }}>{toWords(totalValue)} Dirhams Only</span>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '0.67rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>Teacher</div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.78rem', color: '#777', marginBottom: '6px' }}>Full Name</div>
                <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>{teacher.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#777', marginBottom: '6px' }}>Signature + Date</div>
                <div style={{ borderBottom: '1px solid #bbb', paddingBottom: '4px', height: '36px' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.67rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>Administrator</div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.78rem', color: '#777', marginBottom: '6px' }}>Full Name</div>
                <div style={{ borderBottom: '1px solid #bbb', paddingBottom: '4px', height: '28px' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#777', marginBottom: '6px' }}>Signature + Date</div>
                <div style={{ borderBottom: '1px solid #bbb', paddingBottom: '4px', height: '36px' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '0.7rem', color: '#bbb', textAlign: 'center' }}>
            Musicore LLC · Sharjah Media City, Sharjah, United Arab Emirates · info@musicoreuae.com
          </div>
        </div>

      </div>
    </>
  )
}
