-- Schema của Portfolio (Supabase). Chạy toàn bộ file này một lần trên project mới.
-- Sau đó tạo user admin trong Authentication > Users và thêm vào bảng admins.

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "admins read self" on public.admins for select to authenticated using (user_id = (select auth.uid()));

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.folders(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete set null,
  name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  visibility text not null default 'private' check (visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile (
  id int primary key default 1 check (id = 1),
  full_name text not null default '',
  title text not null default '',
  about text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  avatar_document_id uuid references public.documents(id) on delete set null,
  cv_document_id uuid references public.documents(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  sort_order int not null default 0
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  major text not null default '',
  level text not null default '',
  duration text not null default '',
  gpa text not null default '',
  honors text not null default '',
  coursework text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  role text not null default '',
  period text not null default '',
  description text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'Academic' check (category in ('Research','Innovation','Business','Academic')),
  role text not null default '',
  duration text not null default '',
  description text not null default '',
  objectives text not null default '',
  contributions text not null default '',
  outcomes text not null default '',
  skills_tools text not null default '',
  cover_document_id uuid references public.documents(id) on delete set null,
  links jsonb not null default '[]'::jsonb,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null default '',
  issued_date text not null default '',
  credential_code text not null default '',
  description text not null default '',
  document_id uuid references public.documents(id) on delete set null,
  visible boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0
);

-- Liên kết tài liệu với nhiều khu vực, không cần upload lại
create table public.document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  entity_type text not null check (entity_type in ('project_attachment','project_gallery','education','experience')),
  entity_id uuid not null,
  sort_order int not null default 0,
  unique (document_id, entity_type, entity_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) between 1 and 200),
  sender_email text not null check (char_length(sender_email) between 3 and 320),
  subject text not null check (char_length(subject) between 1 and 300),
  body text not null check (char_length(body) between 1 and 5000),
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  created_at timestamptz not null default now()
);

create index on public.documents(folder_id);
create index on public.document_links(entity_type, entity_id);
create index on public.messages(status, created_at desc);

do $$ declare t text; begin
  foreach t in array array['folders','documents','profile','skills','education','experiences','projects','certificates','document_links','messages','activity_log'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Quản trị: toàn quyền
do $$ declare t text; begin
  foreach t in array array['folders','documents','profile','skills','education','experiences','projects','certificates','document_links','messages','activity_log'] loop
    execute format('create policy "admin all" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- Công khai: chỉ đọc nội dung được bật hiển thị
create policy "public read profile" on public.profile for select to anon, authenticated using (true);
create policy "public read skills" on public.skills for select to anon, authenticated using (true);
create policy "public read education" on public.education for select to anon, authenticated using (visible);
create policy "public read experiences" on public.experiences for select to anon, authenticated using (visible);
create policy "public read projects" on public.projects for select to anon, authenticated using (visible);
create policy "public read certificates" on public.certificates for select to anon, authenticated using (visible);
create policy "public read documents" on public.documents for select to anon, authenticated using (visibility = 'public');
create policy "public read document_links" on public.document_links for select to anon, authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and d.visibility = 'public'));

-- Khách gửi tin nhắn (chỉ INSERT, trạng thái mặc định unread)
create policy "public send message" on public.messages for insert to anon, authenticated
  with check (status = 'unread');

-- Storage
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "admin storage all" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()))
  with check (bucket_id = 'documents' and (select public.is_admin()));

create policy "public storage read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'documents' and exists (
    select 1 from public.documents d where d.storage_path = name and d.visibility = 'public'));
