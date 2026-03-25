-- Migration: 006_performance_indexes.sql
-- Description: Adds composite and search indexes for the app's hottest read paths.

begin;

create extension if not exists pg_trgm;

-- Profiles: admin/counselor student lists, abuse checks, and recent activity lookups.
create index if not exists idx_profiles_role_created_at_desc
  on public.profiles(role, created_at desc);

create index if not exists idx_profiles_assigned_counselor_role_created_at_desc
  on public.profiles(assigned_counselor_id, role, created_at desc);

create index if not exists idx_profiles_created_at_desc
  on public.profiles(created_at desc);

-- Universities: country filtering, ranking sort, and name search.
create index if not exists idx_universities_country_ranking
  on public.universities(country, ranking asc);

create index if not exists idx_universities_name_trgm
  on public.universities using gin(name gin_trgm_ops);

-- Programs: matching, admin filters, and public search.
create index if not exists idx_programs_university_degree_name
  on public.programs(university_id, degree_level, name);

create index if not exists idx_programs_degree_active_deadline
  on public.programs(degree_level, is_active, application_deadline);

create index if not exists idx_programs_name_trgm
  on public.programs using gin(name gin_trgm_ops);

create index if not exists idx_programs_subject_area_trgm
  on public.programs using gin(subject_area gin_trgm_ops);

-- Scholarships: public filter combinations and sorted reads.
create index if not exists idx_scholarships_active_featured_deadline
  on public.scholarships(is_active, is_featured desc, deadline asc);

create index if not exists idx_scholarships_active_university_deadline
  on public.scholarships(is_active, university_id, deadline asc);

create index if not exists idx_scholarships_active_funding_deadline
  on public.scholarships(is_active, funding_type, deadline asc);

create index if not exists idx_scholarships_active_application_type_deadline
  on public.scholarships(is_active, application_type, deadline asc);

-- Blog: published feed and category filtering.
create index if not exists idx_blog_posts_published_created_at_desc
  on public.blog_posts(published, created_at desc);

create index if not exists idx_blog_posts_published_category_created_at_desc
  on public.blog_posts(published, category, created_at desc);

-- Applications: per-user/counselor dashboards and counts.
create index if not exists idx_applications_user_created_at_desc
  on public.applications(user_id, created_at desc);

create index if not exists idx_applications_user_status_created_at_desc
  on public.applications(user_id, status, created_at desc);

create index if not exists idx_applications_counselor_created_at_desc
  on public.applications(counselor_id, created_at desc);

create index if not exists idx_applications_counselor_status_created_at_desc
  on public.applications(counselor_id, status, created_at desc);

create index if not exists idx_applications_status_created_at_desc
  on public.applications(status, created_at desc);

-- Documents and notes: per-student document lists and staff review flows.
create index if not exists idx_documents_user_created_at_desc
  on public.documents(user_id, created_at desc);

create index if not exists idx_documents_user_status_created_at_desc
  on public.documents(user_id, status, created_at desc);

create index if not exists idx_notes_student_created_at_desc
  on public.notes(student_user_id, created_at desc);

-- Audit logs: chronological lookups by subject or actor.
create index if not exists idx_audit_logs_user_created_at_desc
  on public.audit_logs(user_id, created_at desc);

create index if not exists idx_audit_logs_actor_created_at_desc
  on public.audit_logs(actor_user_id, created_at desc);

-- Help/support system: ticket inboxes and message threads.
create index if not exists idx_tickets_student_updated_at_desc
  on public.tickets(student_id, updated_at desc);

create index if not exists idx_tickets_status_updated_at_desc
  on public.tickets(status, updated_at desc);

create index if not exists idx_ticket_messages_ticket_created_at
  on public.ticket_messages(ticket_id, created_at asc);

create index if not exists idx_ticket_messages_sender_created_at_desc
  on public.ticket_messages(sender_id, created_at desc);

commit;
