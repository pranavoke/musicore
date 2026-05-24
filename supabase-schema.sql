-- ============================================================
-- MUSICORE DATABASE SCHEMA
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================

-- User roles (admin / teacher)
create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text check (role in ('admin', 'teacher')) not null,
  created_at timestamptz default now()
);

-- Teachers
create table if not exists teachers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null unique,
  name text not null,
  instrument text not null,
  whatsapp_number text,
  email text unique not null,
  created_at timestamptz default now()
);

-- Students
create table if not exists students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  whatsapp_number text,
  parent_whatsapp_number text,
  assigned_teacher_id uuid references teachers(id) on delete set null,
  instrument text,
  created_at timestamptz default now()
);

-- Lessons (attendance records — teacher-filled)
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references teachers(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  lesson_format text check (lesson_format in ('Online', 'Offline', 'Group Lesson', 'Individual Lesson')) not null,
  lesson_date date not null,
  duration integer check (duration in (45, 60)) not null,
  comments text,
  video_url text,
  status text default 'submitted' check (status in ('draft', 'submitted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lesson Plans (bookings — admin-created)
create table if not exists lesson_plans (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references teachers(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  instrument text not null,
  booking_date date not null,
  booking_time time not null,
  duration integer check (duration in (45, 60)) not null,
  lesson_format text check (lesson_format in ('Online', 'Offline', 'Group Lesson', 'Individual Lesson')) not null,
  status text default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled', 'rescheduled')) not null,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WhatsApp Groups
create table if not exists whatsapp_groups (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references teachers(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  company_number text,
  invite_link text,
  group_name text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table user_roles enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table lesson_plans enable row level security;
alter table whatsapp_groups enable row level security;

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper: get teacher id for current user
create or replace function my_teacher_id()
returns uuid as $$
  select id from teachers where user_id = auth.uid() limit 1;
$$ language sql security definer;

-- user_roles: users can read their own role, admin can read all
create policy "users can read own role" on user_roles for select using (user_id = auth.uid() or is_admin());
create policy "admin can insert roles" on user_roles for insert with check (is_admin());
create policy "admin can update roles" on user_roles for update using (is_admin());

-- teachers: admin full access, teachers can read all
create policy "admin full access on teachers" on teachers for all using (is_admin());
create policy "teachers can read teachers" on teachers for select using (auth.uid() is not null);

-- students: admin full access, teachers can read assigned students
create policy "admin full access on students" on students for all using (is_admin());
create policy "teachers can read assigned students" on students for select using (assigned_teacher_id = my_teacher_id());

-- lessons: admin full access, teachers can manage own lessons
create policy "admin full access on lessons" on lessons for all using (is_admin());
create policy "teachers can manage own lessons" on lessons for all using (teacher_id = my_teacher_id());

-- lesson_plans: admin full access, teachers can read own plans
create policy "admin full access on lesson_plans" on lesson_plans for all using (is_admin());
create policy "teachers can read own lesson_plans" on lesson_plans for select using (teacher_id = my_teacher_id());

-- whatsapp_groups: admin full access, teachers can read own
create policy "admin full access on whatsapp_groups" on whatsapp_groups for all using (is_admin());
create policy "teachers can read own whatsapp_groups" on whatsapp_groups for select using (teacher_id = my_teacher_id());
