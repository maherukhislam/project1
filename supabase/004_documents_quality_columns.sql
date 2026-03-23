begin;

alter table public.documents
  add column if not exists quality_flag text,
  add column if not exists quality_flags jsonb not null default '[]'::jsonb;

commit;
