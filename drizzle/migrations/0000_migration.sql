create type public.app_role as enum ('admin','moderator','user');
create type public.campaign_status as enum ('draft','pending_review','published','rejected','suspended','closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.campaign_categories (
  slug text primary key,
  name text not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true
);
grant select on public.campaign_categories to anon, authenticated;
grant all on public.campaign_categories to service_role;
alter table public.campaign_categories enable row level security;
create policy "categories public" on public.campaign_categories for select to anon, authenticated using (active);
insert into public.campaign_categories (slug,name,description,sort_order) values
('saude','Saúde e tratamentos','Cirurgias, remédios e tratamentos médicos',1),
('emergencias','Emergências','Situações urgentes e imprevistas',2),
('animais','Animais','Resgate, castração e cuidados com animais',3),
('educacao','Educação','Estudos, cursos e materiais escolares',4),
('projetos-sociais','Projetos sociais','Iniciativas que transformam realidades',5),
('comunidade','Comunidade','Ações para o bairro e a cidade',6),
('moradia','Moradia','Reforma, aluguel e reconstrução',7),
('outros','Outros objetivos','Sonhos e causas pessoais',8);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  slug text unique not null,
  title text not null,
  category text not null references public.campaign_categories(slug),
  description text not null default '',
  reason text not null default '',
  goal_amount numeric(12,2) not null check (goal_amount >= 50),
  raised_amount numeric(12,2) not null default 0,
  supporters_count int not null default 0,
  end_date date,
  city text,
  state text,
  show_location boolean not null default false,
  cover_url text,
  organizer_name text not null default '',
  identity_verified boolean not null default false,
  status campaign_status not null default 'draft',
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.campaigns (status, created_at desc);
grant select on public.campaigns to anon;
grant select, insert, delete on public.campaigns to authenticated;
grant update (title, category, description, reason, goal_amount, end_date, city, state, show_location, cover_url, organizer_name, status, rejection_reason, published_at, updated_at) on public.campaigns to authenticated;
grant all on public.campaigns to service_role;
alter table public.campaigns enable row level security;
create policy "public published" on public.campaigns for select to anon, authenticated using (status in ('published','closed'));
create policy "owner read" on public.campaigns for select to authenticated using (auth.uid() = owner_id);
create policy "admin read" on public.campaigns for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "owner insert" on public.campaigns for insert to authenticated with check (auth.uid() = owner_id and status in ('draft','pending_review'));
create policy "owner update" on public.campaigns for update to authenticated using (auth.uid() = owner_id);
create policy "admin update" on public.campaigns for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "owner delete draft" on public.campaigns for delete to authenticated using (auth.uid() = owner_id and status = 'draft');

create or replace function public.guard_campaign_update()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  new.updated_at := now();
  if auth.uid() is null or public.has_role(auth.uid(),'admin') then
    if new.status = 'published' and old.status <> 'published' and new.published_at is null then new.published_at := now(); end if;
    return new;
  end if;
  if new.status is distinct from old.status then
    if not ((old.status in ('draft','rejected') and new.status = 'pending_review')
         or (old.status = 'pending_review' and new.status = 'draft')
         or (old.status = 'published' and new.status = 'closed')) then
      raise exception 'Mudança de situação não permitida';
    end if;
  end if;
  new.rejection_reason := case when new.status = 'pending_review' then null else old.rejection_reason end;
  new.published_at := old.published_at;
  if old.status = 'published' and (new.goal_amount < old.raised_amount) then
    raise exception 'A meta não pode ser menor que o valor arrecadado';
  end if;
  return new;
end $$;
create trigger campaigns_guard before update on public.campaigns for each row execute function public.guard_campaign_update();

create table public.campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  author_id uuid not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select on public.campaign_updates to anon;
grant select, insert, delete on public.campaign_updates to authenticated;
grant all on public.campaign_updates to service_role;
alter table public.campaign_updates enable row level security;
create policy "updates public" on public.campaign_updates for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.status in ('published','closed')));
create policy "updates owner read" on public.campaign_updates for select to authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));
create policy "updates owner write" on public.campaign_updates for insert to authenticated with check (author_id = auth.uid() and exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));
create policy "updates owner delete" on public.campaign_updates for delete to authenticated using (author_id = auth.uid());

create table public.campaign_reports (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  reporter_id uuid,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
grant insert on public.campaign_reports to anon, authenticated;
grant select, update on public.campaign_reports to authenticated;
grant all on public.campaign_reports to service_role;
alter table public.campaign_reports enable row level security;
create policy "anyone report" on public.campaign_reports for insert to anon, authenticated with check (status = 'open' and length(reason) between 3 and 200 and (details is null or length(details) <= 2000) and (reporter_id is null or reporter_id = auth.uid()));
create policy "admin reports read" on public.campaign_reports for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin reports update" on public.campaign_reports for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "covers read" on storage.objects for select using (bucket_id = 'campaign-covers');
create policy "covers owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'campaign-covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "covers owner update" on storage.objects for update to authenticated using (bucket_id = 'campaign-covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "covers owner delete" on storage.objects for delete to authenticated using (bucket_id = 'campaign-covers' and (storage.foldername(name))[1] = auth.uid()::text);