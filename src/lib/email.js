import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update FROM once domain is verified in Resend dashboard
const FROM        = process.env.EMAIL_FROM   || 'Musicore <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL  || ''
const WA_LINK     = 'https://wa.me/971567961376'

// Helper — send to multiple recipients, never crash the main request
export async function sendEmail({ to, subject, html }) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (!recipients.length) return
  try {
    await resend.emails.send({ from: FROM, to: recipients, subject, html })
  } catch (err) {
    console.error('[Email] Failed:', err.message, '→ to:', recipients.join(', '))
  }
}

// ─── 1. Booking confirmation ───────────────────────────────────────────────────
export async function sendBookingConfirmation({ studentEmail, name, instrument, format, plan, duration, preferred_date, preferred_time }) {
  const formatLabel = format === 'Offline' || format === 'At Home' ? 'At Home' : format
  const subject = `We've received your lesson request, ${name}! 🎵`

  const html = emailWrapper(`
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff">Hey ${name}! 🎵</p>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      We've received your lesson request and we're already on it. Our team will reach out on WhatsApp shortly to confirm your schedule and assign your teacher.
    </p>
    ${summaryBox([
      ['Instrument', instrument],
      ['Format',     formatLabel],
      ['Plan',       plan || 'Single'],
      ['Duration',   `${duration || 60} min per session`],
      preferred_date ? ['Preferred Date', `${preferred_date}${preferred_time ? ` at ${preferred_time}` : ''}`] : null,
    ].filter(Boolean))}
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
      In the meantime feel free to reach out on WhatsApp if you have any questions.
    </p>
    ${waButton('Chat with us on WhatsApp')}
  `)

  const adminHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">New Booking Request 📥</p>
    <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.6)">A student just submitted a lesson booking request.</p>
    ${summaryBox([
      ['Student Name',   name],
      ['Instrument',     instrument],
      ['Format',         formatLabel],
      ['Plan',           plan || 'Single'],
      ['Duration',       `${duration || 60} min`],
      preferred_date ? ['Preferred Date', `${preferred_date}${preferred_time ? ` at ${preferred_time}` : ''}`] : null,
    ].filter(Boolean))}
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4)">Log in to the admin portal to assign a teacher.</p>
  `)

  await Promise.all([
    studentEmail ? sendEmail({ to: studentEmail, subject, html }) : null,
    ADMIN_EMAIL  ? sendEmail({ to: ADMIN_EMAIL,  subject: `New Booking: ${name} (${instrument})`, html: adminHtml }) : null,
  ])
}

// ─── 2. Teacher assignment ─────────────────────────────────────────────────────
export async function sendTeacherAssignment({ studentEmail, studentName, teacherEmail, teacherName, instrument, format, bookingDate, bookingTime, duration, plan }) {
  const formatLabel = format === 'Offline' || format === 'At Home' ? 'At Home' : format
  const details = [
    ['Instrument', instrument],
    ['Format',     formatLabel],
    ['Plan',       plan || 'Single'],
    ['Duration',   `${duration} min`],
    ['First Session', `${bookingDate}${bookingTime ? ` at ${bookingTime.slice(0, 5)}` : ''}`],
    ['Teacher',    teacherName],
  ]

  const studentHtml = emailWrapper(`
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff">Your teacher has been assigned! 🎸</p>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      Great news, ${studentName}! We've assigned <strong style="color:#E8633A">${teacherName}</strong> as your teacher. Your sessions are now scheduled — details below.
    </p>
    ${summaryBox(details)}
    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
      A WhatsApp group with you, your teacher, and our team will be set up shortly. See you at the first session!
    </p>
    ${waButton('Message us on WhatsApp')}
  `)

  const teacherHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#fff">New Student Assigned 👋</p>
    <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${teacherName}, you've been assigned a new student: <strong style="color:#E8633A">${studentName}</strong>.
    </p>
    ${summaryBox(details)}
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4)">Log in to the teacher portal to view your full schedule.</p>
  `)

  const adminHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">Teacher Assigned ✅</p>
    ${summaryBox([...details, ['Student', studentName]])}
  `)

  await Promise.all([
    studentEmail  ? sendEmail({ to: studentEmail,  subject: `Your ${instrument} teacher is confirmed, ${studentName}! 🎵`, html: studentHtml }) : null,
    teacherEmail  ? sendEmail({ to: teacherEmail,  subject: `New student: ${studentName} (${instrument})`,                 html: teacherHtml }) : null,
    ADMIN_EMAIL   ? sendEmail({ to: ADMIN_EMAIL,   subject: `Assignment confirmed: ${studentName} → ${teacherName}`,       html: adminHtml   }) : null,
  ])
}

// ─── 3. Lesson logged ──────────────────────────────────────────────────────────
export async function sendLessonLogged({ studentEmail, teacherEmail, studentName, teacherName, lessonDate, lessonTime, format, duration, comments, videoUrl, sessionNum, totalSessions }) {
  const subject = `Lesson ${sessionNum ? `${sessionNum}/${totalSessions}` : ''} logged for ${studentName}`
  const details = [
    ['Student',   studentName],
    ['Teacher',   teacherName],
    ['Date',      `${lessonDate}${lessonTime ? ` at ${lessonTime.slice(0,5)}` : ''}`],
    ['Format',    format],
    ['Duration',  `${duration} min`],
    sessionNum ? ['Progress', `${sessionNum} of ${totalSessions} sessions completed`] : null,
  ].filter(Boolean)

  const body = emailWrapper(`
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#fff">Lesson logged 📋</p>
    ${summaryBox(details)}
    ${comments ? `
    <div style="margin:20px 0;padding:16px 20px;background:rgba(255,255,255,0.04);border-left:3px solid rgba(232,99,58,0.5);border-radius:0 8px 8px 0">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.35);text-transform:uppercase">Lesson Notes</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.7">${comments}</p>
    </div>` : ''}
    ${videoUrl ? `<p style="margin:16px 0 0;font-size:13px"><a href="${videoUrl}" style="color:#E8633A">🎥 Watch lesson recording</a></p>` : ''}
  `)

  await Promise.all([
    studentEmail ? sendEmail({ to: studentEmail, subject, html: body }) : null,
    teacherEmail ? sendEmail({ to: teacherEmail, subject, html: body }) : null,
    ADMIN_EMAIL  ? sendEmail({ to: ADMIN_EMAIL,  subject, html: body }) : null,
  ])
}

// ─── 4. Renewal reminder ───────────────────────────────────────────────────────
export async function sendRenewalReminder({ studentEmail, studentName, plan, instrument }) {
  const subject = `Only 1 session left — time to renew, ${studentName}! 🎵`

  const studentHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#fff">One session left! ⏰</p>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${studentName}, you have <strong style="color:#E8633A">1 session remaining</strong> on your ${plan || ''} plan for ${instrument}.
      Reach out on WhatsApp to renew and keep the momentum going!
    </p>
    ${waButton('Renew on WhatsApp')}
  `)

  const adminHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">Renewal reminder 🔔</p>
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.65)">
      <strong>${studentName}</strong> has only 1 session left on their ${plan || ''} ${instrument} plan.
    </p>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4)">Follow up with them to renew before their last session.</p>
  `)

  await Promise.all([
    studentEmail ? sendEmail({ to: studentEmail, subject,                                   html: studentHtml }) : null,
    ADMIN_EMAIL  ? sendEmail({ to: ADMIN_EMAIL,  subject: `Renewal needed: ${studentName}`, html: adminHtml   }) : null,
  ])
}

// ─── 5. Trial follow-up (Single plan completed) ───────────────────────────────
export async function sendTrialFollowUp({ studentEmail, studentName, teacherName, instrument }) {
  const subject = `How was your ${instrument} lesson, ${studentName}? 🎵`

  const studentHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#fff">Hope it was amazing! 🎶</p>
    <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${studentName}, we hope you had a great time with ${teacherName} for your ${instrument} lesson!
      Learning an instrument is a journey — and you've just taken the first step.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      If you'd like to keep the momentum going, we'd love to set you up with a monthly or quarterly plan — same teacher, same time, no hassle.
    </p>
    ${waButton('Continue Learning — Message Us')}
  `)

  const adminHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">Single lesson completed 🎵</p>
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7">
      <strong>${studentName}</strong> has completed their trial ${instrument} lesson with ${teacherName}.
      A follow-up email has been sent to them. Consider reaching out to convert them to a monthly plan.
    </p>
    ${summaryBox([
      ['Student',    studentName],
      ['Teacher',    teacherName],
      ['Instrument', instrument],
    ])}
  `)

  await Promise.all([
    studentEmail ? sendEmail({ to: studentEmail, subject,                                        html: studentHtml }) : null,
    ADMIN_EMAIL  ? sendEmail({ to: ADMIN_EMAIL,  subject: `Follow up: ${studentName} (${instrument} trial done)`, html: adminHtml   }) : null,
  ])
}

// ─── 6. Teacher changed ────────────────────────────────────────────────────────
export async function sendTeacherChanged({ studentEmail, studentName, oldTeacherEmail, oldTeacherName, newTeacherEmail, newTeacherName, instrument, upcomingSessions }) {
  const subject = `Teacher update for ${studentName} (${instrument})`

  const studentHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#fff">Your teacher has been updated 🎵</p>
    <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${studentName}, your ${instrument} teacher has been changed to <strong style="color:#E8633A">${newTeacherName}</strong>.
      Your ${upcomingSessions} upcoming session${upcomingSessions !== 1 ? 's have' : ' has'} been reassigned accordingly.
    </p>
    ${summaryBox([
      ['Instrument',   instrument],
      ['New Teacher',  newTeacherName],
      ['Sessions',     `${upcomingSessions} upcoming session${upcomingSessions !== 1 ? 's' : ''} reassigned`],
    ])}
    ${waButton('Questions? Message us on WhatsApp')}
  `)

  const oldTeacherHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">Student reassigned 📋</p>
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${oldTeacherName}, <strong>${studentName}</strong> (${instrument}) has been reassigned to another teacher.
      Their ${upcomingSessions} upcoming session${upcomingSessions !== 1 ? 's have' : ' has'} been moved.
    </p>
  `)

  const newTeacherHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">New student assigned to you 👋</p>
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7">
      Hi ${newTeacherName}, <strong>${studentName}</strong> (${instrument}) has been assigned to you with ${upcomingSessions} upcoming session${upcomingSessions !== 1 ? 's' : ''}.
    </p>
  `)

  const adminHtml = emailWrapper(`
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">Teacher change confirmed ✅</p>
    ${summaryBox([
      ['Student',       studentName],
      ['Instrument',    instrument],
      ['Old Teacher',   oldTeacherName],
      ['New Teacher',   newTeacherName],
      ['Sessions moved', `${upcomingSessions} upcoming`],
    ])}
  `)

  await Promise.all([
    studentEmail    ? sendEmail({ to: studentEmail,    subject,                                       html: studentHtml    }) : null,
    oldTeacherEmail ? sendEmail({ to: oldTeacherEmail, subject: `Student ${studentName} reassigned`,  html: oldTeacherHtml }) : null,
    newTeacherEmail ? sendEmail({ to: newTeacherEmail, subject: `New student: ${studentName}`,        html: newTeacherHtml }) : null,
    ADMIN_EMAIL     ? sendEmail({ to: ADMIN_EMAIL,     subject,                                       html: adminHtml      }) : null,
  ])
}

// ─── Shared HTML helpers ───────────────────────────────────────────────────────
function emailWrapper(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0806;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0806;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#0F0D0B;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
        <tr><td style="background:linear-gradient(135deg,#1a1208,#0F0D0B);padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.07)">
          <p style="margin:0 0 3px;font-size:10px;letter-spacing:3px;color:#E8633A;text-transform:uppercase">Dubai Music Lessons</p>
          <p style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:1px">MUSI<span style="color:#E8633A">CORE</span></p>
        </td></tr>
        <tr><td style="padding:32px 36px">${content}</td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.07);text-align:center">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2)">© 2025 Musicore · Online & Home Music Lessons, Dubai</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function summaryBox(rows) {
  const rowsHtml = rows.map(([label, value]) =>
    `<p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.8)"><strong style="color:#fff">${label}:</strong> ${value}</p>`
  ).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(232,99,58,0.07);border:1px solid rgba(232,99,58,0.25);border-radius:10px;margin-bottom:24px"><tr><td style="padding:20px 24px">
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:2px;color:#E8633A;text-transform:uppercase">Details</p>
    ${rowsHtml}
  </td></tr></table>`
}

function waButton(label) {
  return `<table cellpadding="0" cellspacing="0"><tr><td style="background:#25D366;border-radius:8px">
    <a href="${WA_LINK}" style="display:inline-block;padding:11px 26px;font-size:14px;font-weight:600;color:#fff;text-decoration:none">💬 ${label}</a>
  </td></tr></table>`
}
