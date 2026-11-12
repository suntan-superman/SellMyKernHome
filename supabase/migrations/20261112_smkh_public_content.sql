begin;
create table public.smkh_testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (length(btrim(quote)) between 1 and 1600),
  attribution text not null default '' check (length(attribution) <= 160),
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index smkh_testimonials_public_order on public.smkh_testimonials (sort_order, created_at desc) where status = 'published';
alter table public.smkh_testimonials enable row level security;
create policy "SMKH published testimonials are public" on public.smkh_testimonials for select to anon, authenticated using (status = 'published');
create policy "SMKH admins read all testimonials" on public.smkh_testimonials for select to authenticated using (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create policy "SMKH admins create testimonials" on public.smkh_testimonials for insert to authenticated with check (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create policy "SMKH admins update testimonials" on public.smkh_testimonials for update to authenticated using (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin'))) with check (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create policy "SMKH admins delete testimonials" on public.smkh_testimonials for delete to authenticated using (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create table public.smkh_site_settings (
  key text primary key check (key = 'homepage_image'),
  value text not null check (length(value) <= 2000),
  updated_by uuid not null default auth.uid() references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.smkh_site_settings enable row level security;
create policy "Public can read homepage image setting" on public.smkh_site_settings for select to anon, authenticated using (key = 'homepage_image');
create policy "SMKH admins update site settings" on public.smkh_site_settings for all to authenticated using (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin'))) with check (exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('smkh-site-content', 'smkh-site-content', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']) on conflict (id) do nothing;
create policy "SMKH admins upload homepage image" on storage.objects for insert to authenticated with check (bucket_id = 'smkh-site-content' and (storage.foldername(name))[1] = 'homepage' and exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create policy "SMKH admins update homepage image" on storage.objects for update to authenticated using (bucket_id = 'smkh-site-content' and (storage.foldername(name))[1] = 'homepage' and exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin'))) with check (bucket_id = 'smkh-site-content' and (storage.foldername(name))[1] = 'homepage' and exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
create policy "SMKH admins delete homepage image" on storage.objects for delete to authenticated using (bucket_id = 'smkh-site-content' and (storage.foldername(name))[1] = 'homepage' and exists (select 1 from public.smkh_admin_memberships m where m.user_id = auth.uid() and m.active and m.role in ('owner', 'admin')));
grant select (id, quote, attribution, status, sort_order, created_at, updated_at) on public.smkh_testimonials to anon;
grant select on public.smkh_testimonials, public.smkh_site_settings to authenticated;
grant select (key, value, updated_at) on public.smkh_site_settings to anon;
grant insert, update, delete on public.smkh_testimonials, public.smkh_site_settings to authenticated;
commit;
