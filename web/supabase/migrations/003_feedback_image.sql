-- Optional image attachment on feedback submissions

alter table public.feedback
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-images',
  'feedback-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "feedback_images_insert_own" on storage.objects;
create policy "feedback_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'feedback-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "feedback_images_select_public" on storage.objects;
create policy "feedback_images_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'feedback-images');
