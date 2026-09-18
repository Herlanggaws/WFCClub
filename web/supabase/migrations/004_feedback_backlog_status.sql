-- Track backlog progress for feedback items synced with doc/feedback.md

alter table public.feedback
  add column if not exists backlog_id text,
  add column if not exists status text not null default 'todo',
  add column if not exists completed_at timestamptz,
  add column if not exists commit_sha text;

alter table public.feedback
  drop constraint if exists feedback_status_check;

alter table public.feedback
  add constraint feedback_status_check
  check (status in ('todo', 'done', 'pending-validation'));

create unique index if not exists feedback_backlog_id_uidx
  on public.feedback (backlog_id)
  where backlog_id is not null;

create index if not exists feedback_status_idx
  on public.feedback (status);
