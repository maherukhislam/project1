-- Migration: 005_help_tickets.sql
-- Description: Creates tickets and ticket_messages tables for the multi-role Help & Support system.

begin;

create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'escalated', 'resolved')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Triggers for updated_at
drop trigger if exists trg_tickets_updated_at on public.tickets;
create trigger trg_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

-- RLS Policies
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

-- Tickets: Select
create policy "Tickets select own or assigned counselor or admin"
on public.tickets
for select
to authenticated
using (
  auth.uid() = student_id 
  or public.is_admin() 
  or (public.is_counselor() and public.is_assigned_counselor(student_id))
);

-- Tickets: Insert (students only)
create policy "Tickets insert students"
on public.tickets
for insert
to authenticated
with check (
  auth.uid() = student_id 
  and not public.is_admin() 
  and not public.is_counselor()
);

-- Tickets: Update
create policy "Tickets update own or assigned counselor or admin"
on public.tickets
for update
to authenticated
using (
  auth.uid() = student_id 
  or public.is_admin() 
  or (public.is_counselor() and public.is_assigned_counselor(student_id))
)
with check (
  auth.uid() = student_id 
  or public.is_admin() 
  or (public.is_counselor() and public.is_assigned_counselor(student_id))
);

-- Ticket Messages: Select (same logic as tickets)
create policy "Ticket messages select own or assigned counselor or admin"
on public.ticket_messages
for select
to authenticated
using (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and (
      t.student_id = auth.uid()
      or public.is_admin()
      or (public.is_counselor() and public.is_assigned_counselor(t.student_id))
    )
  )
);

-- Ticket Messages: Insert
create policy "Ticket messages insert authorized"
on public.ticket_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.tickets t
    where t.id = ticket_id
    and (
      t.student_id = auth.uid()
      or public.is_admin()
      or (public.is_counselor() and public.is_assigned_counselor(t.student_id))
    )
  )
);

commit;
