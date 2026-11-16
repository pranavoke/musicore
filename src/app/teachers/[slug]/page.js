import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

const WHATSAPP_LINK = `https://wa.me/971567961376?text=Hi%20Musicore!%20I%27d%20like%20to%20book%20a%20lesson.`

export async function generateMetadata({ params }) {
  const { slug } = await params
  const admin = createAdminClient()
  const { data: t } = await admin.from('teachers').select('name, subtitle, bio, photo_url, instruments_text').eq('slug', slug).single()
  if (!t) return { title: 'Teacher | Musicore' }
  const description = t.bio?.slice(0, 155) || t.subtitle || `${t.name} is a music teacher at Musicore Dubai.`
  const image = t.photo_url || '/hero-banner.png'
  return {
    title: `${t.name} – Music Teacher Dubai | Musicore`,
    description,
    alternates: { canonical: `https://musicoreuae.com/teachers/${slug}` },
    openGraph: {
      title: `${t.name} | Musicore Dubai`,
      description,
      type: 'profile',
      images: [{ url: image, alt: `${t.name} – Music Teacher at Musicore Dubai` }],
    },
    twitter: { card: 'summary_large_image', title: `${t.name} | Musicore`, description, images: [image] },
  }
}

export default async function TeacherProfilePage({ params }) {
  const { slug } = await params
  const admin = createAdminClient()
  const { data: teacher } = await admin
    .from('teachers')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!teacher) notFound()

  const learnItems = teacher.learn_items || []
  const tags = teacher.tags || []

  const teacherSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    jobTitle: `${teacher.instrument || 'Music'} Instructor`,
    description: teacher.bio || teacher.subtitle || '',
    image: teacher.photo_url || '',
    worksFor: { '@type': 'Organization', name: 'Musicore', url: 'https://musicoreuae.com' },
    url: `https://musicoreuae.com/teachers/${slug}`,
    knowsAbout: tags,
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Music Teacher',
      occupationLocation: { '@type': 'City', name: 'Dubai' },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teacherSchema) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0806; font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) {
          .tp-hero { flex-direction: column-reverse !important; }
          .tp-hero-photo { width: 100% !important; max-height: 380px; }
          .tp-hero-photo img { object-position: center top !important; }
          .tp-learn-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Minimal navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', background: 'rgba(10,8,6,0.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.7rem', letterSpacing: '0.08em', color: '#fff' }}>
            MUSI<span style={{ color: '#E8633A' }}>CORE</span>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px' }}>The Musician In You</div>
        </a>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#E8633A', color: '#fff', borderRadius: '6px', padding: '0.5rem 1.2rem', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
          Book a Lesson
        </a>
      </nav>

      <main style={{ paddingTop: '64px', minHeight: '100vh', background: '#0A0806' }}>

        {/* Hero — name + photo side by side */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 5vw 3rem' }}>
          <div className="tp-hero" style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>

            {/* Left — text content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>Musicore Teacher</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1, marginBottom: '0.6rem' }}>
                {teacher.name}
              </h1>
              {teacher.subtitle && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.6rem', fontWeight: 300 }}>
                  {teacher.subtitle}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                  {tags.map(tag => (
                    <span key={tag} style={{ border: '1px solid #E8633A', borderRadius: '100px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', color: '#E8633A', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {teacher.bio && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '1.02rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, marginBottom: '2rem', maxWidth: '580px' }}>
                  {teacher.bio}
                </p>
              )}

              {/* Stats row */}
              {(teacher.experience || teacher.languages || teacher.instruments_text) && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.5rem' }}>
                  {teacher.experience && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#E8633A', lineHeight: 1 }}>{teacher.experience}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>Years of experience</div>
                    </div>
                  )}
                </div>
              )}

              {/* Languages + instruments */}
              {(teacher.languages || teacher.instruments_text) && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '1.2rem', lineHeight: 1.6 }}>
                  {teacher.languages && <span>Teaches in {teacher.languages}</span>}
                  {teacher.languages && teacher.instruments_text && <span style={{ margin: '0 0.5rem' }}>·</span>}
                  {teacher.instruments_text && <span>{teacher.instruments_text}</span>}
                </p>
              )}
            </div>

            {/* Right — photo */}
            {teacher.photo_url && (
              <div className="tp-hero-photo" style={{ width: '400px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={teacher.photo_url}
                  alt={teacher.name}
                  style={{ width: '100%', height: '100%', maxHeight: '520px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Learn items */}
        {learnItems.length > 0 && (
          <section style={{ background: '#120C07', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '4rem 5vw' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Curriculum</p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', letterSpacing: '0.04em', marginBottom: '2.5rem' }}>What You'll Learn</h2>
              <div className="tp-learn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {learnItems.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.4rem 1.6rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(232,99,58,0.15)', border: '1px solid rgba(232,99,58,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: '#E8633A' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '0.3rem' }}>{item.title}</h3>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ padding: '5rem 5vw', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Ready to Start?</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#fff', letterSpacing: '0.02em', marginBottom: '1rem' }}>
              Book a Lesson with {teacher.name.split(' ')[0]}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.45)', marginBottom: '2rem', lineHeight: 1.75 }}>
              Contact us via WhatsApp and we'll get you scheduled right away.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ background: '#E8633A', color: '#fff', borderRadius: '8px', padding: '0.95rem 2.5rem', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '1rem', display: 'inline-block' }}>
                Book via WhatsApp
              </a>
              <a href="/" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '0.95rem 2rem', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', display: 'inline-block' }}>
                View All Teachers
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>
            MUSI<span style={{ color: '#E8633A' }}>CORE</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            © 2025 Musicore · Dubai, UAE · info@musicoreuae.com
          </p>
        </footer>
      </main>
    </>
  )
}
