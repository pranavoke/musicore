import { createClient } from '@/lib/supabase/server'
import LessonHistoryClient from './LessonHistoryClient'

export default async function LessonHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, students(name, instrument)')
    .eq('teacher_id', teacher?.id)
    .order('lesson_date', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', color: '#E8633A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Teacher Portal</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>Lesson History</h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>{lessons?.length ?? 0} records total</p>
      </div>
      <LessonHistoryClient lessons={lessons || []} />
    </div>
  )
}
