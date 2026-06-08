import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Allows a teacher to revert a completed lesson_plan back to upcoming (undo log)
export async function PATCH(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

  const admin = createAdminClient()

  // Safety: teacher can only revert their own lesson plans
  const { data: plan } = await admin
    .from('lesson_plans')
    .select('id, status, teacher_id')
    .eq('id', id)
    .eq('teacher_id', teacher.id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 })
  if (plan.status !== 'completed') return NextResponse.json({ error: 'Only completed sessions can be reverted' }, { status: 400 })

  const { error } = await admin
    .from('lesson_plans')
    .update({ status: 'upcoming' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
