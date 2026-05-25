import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { name, whatsapp, email, instrument, format, preferred_date, preferred_time, duration, notes, plan } = await request.json()

  if (!name || !whatsapp || !instrument || !format) {
    return NextResponse.json({ error: 'Name, WhatsApp, instrument and format are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('lesson_plans').insert({
    requester_name: name,
    requester_whatsapp: whatsapp,
    requester_email: email || null,
    instrument,
    lesson_format: format,
    preferred_date: preferred_date || null,
    preferred_time: preferred_time || null,
    duration: duration ? parseInt(duration) : 60,
    admin_notes: notes || null,
    plan: plan || null,
    status: 'draft',
    teacher_id: null,
    student_id: null,
    booking_date: null,
    booking_time: null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send confirmation email if provided
  if (email) {
    try {
      await resend.emails.send({
        from: 'Musicore <onboarding@resend.dev>',
        to: email,
        subject: "We've received your lesson request! 🎵",
        html: buildConfirmationEmail({ name, instrument, format, plan, duration, preferred_date, preferred_time }),
      })
    } catch (emailErr) {
      // Don't fail the booking if email fails — just log it
      console.error('Email send failed:', emailErr.message)
    }
  }

  return NextResponse.json({ success: true })
}

function buildConfirmationEmail({ name, instrument, format, plan, duration, preferred_date, preferred_time }) {
  const formatLabel = format === 'Offline' ? 'At Home' : 'Online'
  const dateLine = preferred_date
    ? `<p style="margin:0 0 6px"><strong>Preferred Date:</strong> ${preferred_date}${preferred_time ? ` at ${preferred_time}` : ''}</p>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0806;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0806;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#0F0D0B;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1208 0%,#0F0D0B 100%);padding:36px 40px;border-bottom:1px solid rgba(255,255,255,0.07)">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#E8633A;text-transform:uppercase">Dubai Music Lessons</p>
            <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px">
              MUSI<span style="color:#E8633A">CORE</span>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#ffffff">
              Hey ${name}! 🎵
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
              We've received your lesson request and we're already on it. One of our team members will reach out to you on WhatsApp shortly to confirm your schedule and assign your teacher.
            </p>

            <!-- Booking summary box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(232,99,58,0.07);border:1px solid rgba(232,99,58,0.25);border-radius:12px;margin-bottom:28px">
              <tr><td style="padding:24px 28px">
                <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;color:#E8633A;text-transform:uppercase">Your Request Summary</p>
                <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.8)"><strong style="color:#fff">Instrument:</strong> ${instrument}</p>
                <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.8)"><strong style="color:#fff">Format:</strong> ${formatLabel}</p>
                <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.8)"><strong style="color:#fff">Plan:</strong> ${plan || 'Single'}</p>
                <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.8)"><strong style="color:#fff">Duration:</strong> ${duration || 60} min per session</p>
                ${dateLine}
              </td></tr>
            </table>

            <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
              In the meantime, feel free to reach out to us on WhatsApp if you have any questions — we're happy to help.
            </p>

            <!-- WhatsApp button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#25D366;border-radius:8px">
                  <a href="https://wa.me/971585698904?text=Hi%20Musicore!%20I%20just%20submitted%20a%20lesson%20request." style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none">
                    💬 Chat with us on WhatsApp
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.07);text-align:center">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25)">
              © 2025 Musicore · Online & Home Music Lessons, Dubai
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
