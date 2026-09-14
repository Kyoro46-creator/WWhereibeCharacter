create extension if not exists pgcrypto;

create table if not exists public.characters (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 role text, age text, height text, hair text, eyes text,
 power text, weapon text, group_name text, city text,
 description text, image_url text,
 created_at timestamptz not null default now()
);

alter table public.characters enable row level security;

drop policy if exists "Public read" on public.characters;
create policy "Public read" on public.characters for select to anon, authenticated using (true);

drop policy if exists "Auth insert" on public.characters;
create policy "Auth insert" on public.characters for insert to authenticated with check (true);

drop policy if exists "Auth update" on public.characters;
create policy "Auth update" on public.characters for update to authenticated using (true) with check (true);

drop policy if exists "Auth delete" on public.characters;
create policy "Auth delete" on public.characters for delete to authenticated using (true);

insert into storage.buckets (id,name,public)
values ('character-images','character-images',true)
on conflict (id) do update set public=true;

drop policy if exists "Public image read" on storage.objects;
create policy "Public image read" on storage.objects for select to anon, authenticated using (bucket_id='character-images');

drop policy if exists "Auth image insert" on storage.objects;
create policy "Auth image insert" on storage.objects for insert to authenticated with check (bucket_id='character-images');

drop policy if exists "Auth image update" on storage.objects;
create policy "Auth image update" on storage.objects for update to authenticated using (bucket_id='character-images') with check (bucket_id='character-images');

drop policy if exists "Auth image delete" on storage.objects;
create policy "Auth image delete" on storage.objects for delete to authenticated using (bucket_id='character-images');
