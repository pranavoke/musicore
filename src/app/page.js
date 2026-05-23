'use client'
import { useState, useEffect, useRef } from 'react'

const WHATSAPP_NUMBER = '971XXXXXXXXX'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Musicore!%20I%27d%20like%20to%20book%20a%20lesson.`

const INSTRUMENTS = [
  { id: 'guitar', name: 'Guitar', emoji: '🎸', desc: 'Acoustic or electric — from first chords to full solos. Rock, classical, fingerstyle.', color: '#E8633A' },
  { id: 'piano', name: 'Piano', emoji: '🎹', desc: 'Classical foundations to contemporary styles. All ages, all levels welcome.', color: '#4A90D9' },
  { id: 'drums', name: 'Drums', emoji: '🥁', desc: 'Rhythm, technique, and groove. Electronic or acoustic — we bring the gear.', color: '#9B59B6' },
  { id: 'vocals', name: 'Vocals', emoji: '🎤', desc: 'Breath control, pitch, tone and performance. Pop, R&B, classical — find and own your voice.', color: '#2ECC71' },
]

const PACKAGES = [
  { name: 'Single', sessions: 1, price: { 45: 200, 60:230 }, tag: null, perks: ['Any instrument', 'Flexible timing', 'Online or at home'] },
  { name: 'Monthly', sessions: 4, price: { 45: 230, 60: 920 }, tag: 'Most Popular', perks: ['4 sessions / month', 'Same teacher every time', 'Progress tracking', 'WhatsApp group support'] },
  { name: 'Quarterly', sessions: 12, price: { 45: 999, 60: 1299 }, tag: 'Best Value', perks: ['12 sessions / 3 months', 'Priority scheduling', 'Free instrument assessment', 'Performance recording'] },
]

const FAQS = [
  { q: 'Do you offer online lessons?', a: 'Yes! We offer both online and one-on-one home lessons. Online sessions are conducted via video call at your preferred time. Home lessons are delivered by a professional teacher who comes directly to your door anywhere in Dubai.' },
  { q: 'Do I need to own an instrument?', a: 'For guitar and piano we recommend having one at home, but we can help beginners select the right one. For drums, we bring a portable electronic kit for the first few lessons.' },
  { q: 'What areas in Dubai do you cover?', a: 'We cover all major areas including Downtown, Marina, JBR, Jumeirah, Business Bay, DIFC, Mirdif, Deira, and more. Enter your area at booking and we will confirm availability.' },
  { q: 'How do lessons work after booking?', a: 'Once you book, a WhatsApp group is created with you, your assigned teacher, and our team. Everything from scheduling to lesson notes happens right there.' },
  { q: 'What age groups do you teach?', a: 'We teach all ages — from 5-year-olds to adults. Our teachers adapt lessons to the learner, not the other way around.' },
  { q: 'What is your cancellation policy?', a: 'Cancel or reschedule up to 24 hours before a session at no charge. Late cancellations may forfeit the session credit.' },
]

const WHY_ITEMS = [
  { icon: '⏰', title: 'Timely Lessons', desc: 'We respect your schedule. Sessions start on time, every time — no waiting around.' },
  { icon: '🏠', title: 'Convenience at Your Doorstep', desc: 'Your teacher comes to you. No commute, no hassle — just music in the comfort of your home.' },
  { icon: '💰', title: 'Affordable Plans', desc: 'Flexible pricing from single sessions to quarterly plans. Quality music education that fits your budget.' },
  { icon: '🎓', title: 'Professional Guidance', desc: 'All our teachers are trained, vetted musicians with years of teaching experience across all levels.' },
]

function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// WhatsApp SVG icon
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 5vw',
      background: scrolled ? 'rgba(10,8,6,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '68px',
    }}>
      {/* Logo + tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.7rem', letterSpacing: '0.08em', color: '#fff' }}>
          MUSI<span style={{ color: '#E8633A' }}>CORE</span>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px' }}>
          The Musician In You!
        </div>
      </div>

      {/* Right side — WhatsApp + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
        {/* WhatsApp CTA */}
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: '8px', padding: '0.45rem 1rem', textDecoration: 'none',
            color: '#25D366', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.2)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.3)' }}
        >
          <WhatsAppIcon size={16} />
          <span>+971 XX XXX XXXX</span>
        </a>

        {[['instruments', 'Instruments'], ['lessons', 'Lessons'], ['pricing', 'Pricing'], ['faq', 'FAQ']].map(([id, label]) => (
          <button key={id} onClick={() => scrollTo(id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', letterSpacing: '0.03em', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
          >{label}</button>
        ))}

        <button onClick={() => scrollTo('lessons')} style={{
          background: '#E8633A', color: '#fff', border: 'none', borderRadius: '6px',
          padding: '0.5rem 1.2rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.03em', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = '#d4572f'}
          onMouseLeave={e => e.target.style.background = '#E8633A'}
        >Book Now</button>
      </div>
    </nav>
  )
}

function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setTimeout(() => setLoaded(true), 120) }, [])

  const anim = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(28px)',
    transition: `all 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  })

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'flex-start',
      padding: '80px 6vw 4rem', position: 'relative', overflow: 'hidden',
      background: '#0A0806',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 72% 40%, rgba(232,99,58,0.13) 0%, transparent 68%), radial-gradient(ellipse 50% 40% at 25% 80%, rgba(74,144,217,0.07) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', right: '-1vw', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(110px, 20vw, 310px)', color: 'rgba(255,255,255,0.022)', letterSpacing: '-0.02em', userSelect: 'none', lineHeight: 1, pointerEvents: 'none' }}>MUSIC</div>

      <div style={{ maxWidth: '780px', position: 'relative' }}>
        <div style={{ display: 'inline-block', background: 'rgba(232,99,58,0.14)', border: '1px solid rgba(232,99,58,0.3)', borderRadius: '100px', padding: '0.28rem 1rem', marginBottom: '1.4rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#E8633A', letterSpacing: '0.1em', textTransform: 'uppercase', ...anim(0.05) }}>
          Founded in Dubai, 2019
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(54px, 9.5vw, 118px)', lineHeight: 0.93, letterSpacing: '0.01em', color: '#fff', margin: '0 0 1.5rem', ...anim(0.15) }}>
          The Musician<br /><span style={{ color: '#E8633A' }}>In You</span><br />Starts Here.
        </h1>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, margin: '0 0 2.5rem', maxWidth: '540px', ...anim(0.25) }}>
          Musicore is dedicated to delivering a personalized music learning experience tailored to every student's unique goals. Whether you're a beginner or an enthusiast — every lesson is engaging, inspiring, and perfectly in tune with your journey.
        </p>

        {/* Two main CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', ...anim(0.35) }}>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: '#25D366', color: '#fff', borderRadius: '8px',
              padding: '0.9rem 1.8rem', textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.95rem',
              boxShadow: '0 0 30px rgba(37,211,102,0.2)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1fb855'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <WhatsAppIcon size={18} />
            We'll Get In Touch With You!
          </a>
          <button onClick={() => document.getElementById('lessons')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '8px', padding: '0.9rem 1.8rem', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '0.95rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
          >Explore Lessons ↓</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3.5rem', flexWrap: 'wrap', ...anim(0.45) }}>
          {[['6+', 'Years in Dubai'], ['50+', 'Happy Students'], ['4', 'Instruments'], ['Online & Home', 'Lessons']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.75rem', color: '#E8633A', letterSpacing: '0.05em' }}>{val}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── LESSON TYPES (Online + Home) ────────────────────────────────────────────
function LessonTypes() {
  const [ref, visible] = useInView()

  const cardStyle = (glowColor) => ({
    flex: '1 1 300px', borderRadius: '20px', padding: '2.8rem 2.4rem',
    position: 'relative', overflow: 'hidden', cursor: 'default',
    transition: 'transform 0.25s ease',
  })

  return (
    <section id="lessons" ref={ref} style={{ background: '#0D0B09', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>How You Learn</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Choose Your Format</h2>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

          {/* Online Lessons */}
          <div style={{ ...cardStyle('#4A90D9'), background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.25)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '2.8rem', marginBottom: '1.2rem' }}>💻</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#4A90D9', letterSpacing: '0.04em', margin: '0 0 0.75rem' }}>Online Lessons</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 2rem' }}>
              Learn from the comfort of your home via video call. Flexible scheduling, professional teachers, and the same quality experience — anywhere in the world.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
              {['Learn from anywhere, anytime', 'Perfect for busy schedules', 'Instrument of your choice'].map(p => (
                <li key={p} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', padding: '0.3rem 0', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#4A90D9' }}>✓</span> {p}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: '#4A90D9', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.4rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.9rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#3a7bc8'}
                onMouseLeave={e => e.target.style.background = '#4A90D9'}
              >Book Online Lesson</button>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '8px', padding: '0.75rem 1.1rem', textDecoration: 'none', color: '#25D366', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
              >
                <WhatsAppIcon size={15} /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Home Lessons */}
          <div style={{ ...cardStyle('#E8633A'), background: 'rgba(232,99,58,0.07)', border: '1px solid rgba(232,99,58,0.3)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(232,99,58,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '2.8rem', marginBottom: '1.2rem' }}>🏠</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#E8633A', letterSpacing: '0.04em', margin: '0 0 0.75rem' }}>Home Lessons</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 2rem' }}>
              Your dedicated teacher comes directly to your home across Dubai. A truly personal experience — your space, your pace, your music.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
              {['Teacher comes to your door', 'Covering all Dubai areas', 'Fully personalised lesson plans', 'Lessons tailored to your skill level'].map(p => (
                <li key={p} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', padding: '0.3rem 0', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#E8633A' }}>✓</span> {p}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: '#E8633A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.4rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.9rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#d4572f'}
                onMouseLeave={e => e.target.style.background = '#E8633A'}
              >Book Home Lesson</button>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '8px', padding: '0.75rem 1.1rem', textDecoration: 'none', color: '#25D366', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
              >
                <WhatsAppIcon size={15} /> WhatsApp Us
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function About() {
  const [ref, visible] = useInView()
  return (
    <section id="about" ref={ref} style={{ background: '#0A0806', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '5rem', alignItems: 'center' }}>
        {/* Left — big year + accent */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 0.8s ease', position: 'relative' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(100px, 14vw, 180px)', lineHeight: 1, color: 'rgba(232,99,58,0.12)', letterSpacing: '-0.02em', userSelect: 'none' }}>2019</div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#E8633A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Founded</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>in Dubai</div>
          </div>
          {/* Decorative line */}
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(to right, #E8633A, transparent)', marginTop: '1rem' }} />
        </div>

        {/* Right — copy */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(30px)', transition: 'all 0.8s ease 0.15s' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our Story</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', color: '#fff', margin: '0 0 1.5rem', letterSpacing: '0.02em', lineHeight: 1.05 }}>Music That Moves You Forward</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: '1.2rem' }}>
            Founded in 2019, Musicore is dedicated to delivering a personalized music learning experience tailored to every student's unique goals and passion for music.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>
            Whether you are a beginner or an enthusiast looking to refine your craft, we ensure every lesson is engaging, inspiring, and perfectly in tune with your musical journey.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── WHY MUSICORE ─────────────────────────────────────────────────────────────
function WhyMusicore() {
  const [ref, visible] = useInView()
  return (
    <section id="why" ref={ref} style={{ background: '#0D0B09', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '4rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>The Musicore Difference</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Why Musicore Lessons?</h2>
        </div>
        <div>
          {WHY_ITEMS.map((item, i) => (
            <div key={item.title} style={{
              display: 'grid', gridTemplateColumns: '3.5rem 1fr 2fr', gap: '2rem', alignItems: 'center',
              padding: '2rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `all 0.6s ease ${i * 0.1}s`, cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,99,58,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'rgba(232,99,58,0.35)', letterSpacing: '0.05em', lineHeight: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '1.05rem', color: '#fff', margin: 0, lineHeight: 1.35 }}>{item.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── INSTRUMENTS ──────────────────────────────────────────────────────────────
function Instruments() {
  const [ref, visible] = useInView()
  return (
    <section id="instruments" ref={ref} style={{ background: '#0A0806', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>What We Teach</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Pick Your Instrument</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {INSTRUMENTS.map((inst, i) => (
            <div key={inst.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '2.4rem 2rem',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(38px)',
              transition: `all 0.7s ease ${i * 0.12}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = inst.color + '55'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{inst.emoji}</div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: inst.color, letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>{inst.name}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, margin: '0 0 1.5rem', fontSize: '0.93rem' }}>{inst.desc}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.25rem 0.75rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>Online</span>
                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.25rem 0.75rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>At Home</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const [ref, visible] = useInView()
  const steps = [
    { n: '01', title: 'Choose Your Lesson Type', body: 'Pick online or home lesson. Then select your instrument and a date and time that works for you.' },
    { n: '02', title: 'We Match You With a Teacher', body: 'Based on your level and preference, we assign the perfect teacher and confirm within hours.' },
    { n: '03', title: 'Get Your WhatsApp Group', body: 'A group is created with you, your teacher, and our team. Share your details and ask anything.' },
    { n: '04', title: 'Lesson Begins — Your Way', body: 'Join online via video call or open the door — your teacher arrives ready to play.' },
  ]
  return (
    <section id="how-it-works" ref={ref} style={{ background: '#0D0B09', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>The Process</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>How It Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{
              paddingRight: '2rem',
              borderRight: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(38px)',
              transition: `all 0.65s ease ${i * 0.14}s`,
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.8rem', color: 'rgba(232,99,58,0.18)', lineHeight: 1, marginBottom: '0.9rem' }}>{s.n}</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.98rem', color: '#fff', margin: '0 0 0.7rem', lineHeight: 1.4 }}>{s.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function Pricing() {
  const [ref, visible] = useInView()
  const [duration, setDuration] = useState(60)
  return (
    <section id="pricing" ref={ref} style={{ background: '#0A0806', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Plans & Pricing</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: '0 0 0.4rem', letterSpacing: '0.02em' }}>Simple Pricing</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', marginBottom: '2rem' }}>All prices in AED · Applies to both online and home lessons · No hidden fees</p>

          {/* Duration toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px' }}>
            {[45, 60].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                padding: '0.45rem 1.4rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.88rem',
                background: duration === d ? '#E8633A' : 'transparent',
                color: duration === d ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s',
              }}>{d} min</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {PACKAGES.map((pkg, i) => {
            const isPopular = pkg.tag === 'Most Popular'
            const price = pkg.price[duration]
            return (
              <div key={pkg.name} style={{
                background: isPopular ? 'rgba(232,99,58,0.08)' : 'rgba(255,255,255,0.03)',
                border: isPopular ? '1px solid rgba(232,99,58,0.4)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '2.5rem 2rem', position: 'relative',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(38px)',
                transition: `all 0.65s ease ${i * 0.12}s`,
              }}>
                {pkg.tag && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: isPopular ? '#E8633A' : '#4A90D9', color: '#fff', borderRadius: '100px', padding: '0.28rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{pkg.tag}</div>
                )}
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{pkg.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', margin: '0.5rem 0 0.2rem' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.4rem', color: '#fff', letterSpacing: '-0.01em', transition: 'all 0.2s' }}>{price}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.35)' }}>AED</span>
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.8rem' }}>
                  {pkg.sessions} session{pkg.sessions > 1 ? 's' : ''} · {Math.round(price / pkg.sessions)} AED each · {duration} min
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                  {pkg.perks.map(p => (
                    <li key={p} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'rgba(255,255,255,0.58)', padding: '0.35rem 0', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: '#E8633A', fontWeight: 700 }}>✓</span> {p}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '0.6rem', flexDirection: 'column' }}>
                  <button style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.92rem', border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.15)', background: isPopular ? '#E8633A' : 'transparent', color: '#fff', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = isPopular ? '#d4572f' : 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isPopular ? '#E8633A' : 'transparent' }}
                  >Book {pkg.name} Plan</button>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', borderRadius: '8px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', textDecoration: 'none', color: '#25D366', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.08)'}
                  >
                    <WhatsAppIcon size={14} /> Ask on WhatsApp
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [ref, visible] = useInView()
  const [open, setOpen] = useState(null)
  return (
    <section id="faq" ref={ref} style={{ background: '#0D0B09', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Got Questions?</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 68px)', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>FAQ</h2>
        </div>
        <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.2s' }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '1.4rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.97rem', color: '#fff' }}>{f.q}</span>
                <span style={{ color: '#E8633A', fontSize: '1.4rem', transition: 'transform 0.3s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)', flexShrink: 0 }}>+</span>
              </button>
              <div style={{ maxHeight: open === i ? '220px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease', paddingBottom: open === i ? '1.4rem' : '0' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.92rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.82, margin: 0 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const [ref, visible] = useInView()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" ref={ref} style={{ background: '#0A0806', padding: '6rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }} className="contact-grid">
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.16em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Get In Touch</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', color: '#fff', margin: '0 0 1.4rem', letterSpacing: '0.02em', lineHeight: 1.05 }}>Have a Question?<br />Let's Talk.</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.48)', lineHeight: 1.82, margin: '0 0 2.5rem', fontSize: '0.92rem' }}>
            Not sure whether to go online or home? Want to know what's right for your child? We're just a WhatsApp away.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#25D366', color: '#fff', borderRadius: '8px', padding: '0.85rem 1.6rem', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.95rem', marginBottom: '2.5rem', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1fb855'}
            onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
          >
            <WhatsAppIcon size={18} /> Chat on WhatsApp
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[['📍', 'Dubai, UAE — Covering all major areas'], ['📞', '+971 XX XXX XXXX'], ['✉️', 'hello@musicore.ae']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'all 0.7s ease 0.2s' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: '0 0 0.5rem' }}>Message Received!</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem' }}>We'll get back to you within a few hours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {['name', 'email', 'phone'].map(field => (
                <input key={field} type={field === 'email' ? 'email' : 'text'}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1) + (field === 'phone' ? ' (WhatsApp preferred)' : '')}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.88rem 1.1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.93rem', color: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(232,99,58,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              ))}
              <textarea placeholder="Your message..." rows={4} value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.88rem 1.1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.93rem', color: '#fff', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,99,58,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button onClick={() => setSent(true)} style={{ background: '#E8633A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.88rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.97rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#d4572f'}
                onMouseLeave={e => e.currentTarget.style.background = '#E8633A'}
              >Send Message</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#070604', padding: '2.5rem 6vw', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
            MUSI<span style={{ color: '#E8633A' }}>CORE</span>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>The Musician In You!</div>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          © 2025 Musicore. Online & Home Music Lessons, Dubai.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#25D366', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>
            <WhatsAppIcon size={14} /> WhatsApp
          </a>
          {['Privacy', 'Terms'].map(l => (
            <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0806; }
        @keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
      <Navbar />
      <Hero />
      <LessonTypes />
      <About />
      <WhyMusicore />
      <Instruments />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </>
  )
}
