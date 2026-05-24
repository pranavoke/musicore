import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { name, whatsapp, instrument, format, preferred_date, preferred_time, duration, notes } = await request.json()

  if (!name || !whatsapp || !instrument || !format) {
    return NextResponse.json({ error: 'Name, WhatsApp, instrument and format are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('lesson_plans').insert({
    requester_name: name,
    requester_whatsapp: whatsapp,
    instrument,
    lesson_format: format,
    preferred_date: preferred_date || null,
    preferred_time: preferred_time || null,
    duration: duration ? parseInt(duration) : 60,
    admin_notes: notes || null,
    status: 'draft',
    teacher_id: null,
    student_id: null,
    booking_date: null,
    booking_time: null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
