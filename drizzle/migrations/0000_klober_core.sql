create type public.app_role as enum ('admin','moderator','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text not null default 'NA',
  skin text,
  tier_override text,
  wins int not null default 0,
  losses int not null default 0,
  elo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.cups (
  id uuid primary key default gen_random_uuid(),
  name text not null, gamemode text not null default 'Sword',
  elo_reward int not null default 25, slots int not null default 16,
  starts_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text not null default '',
  server text not null, channel text not null, invite text not null default '',
  image text not null default '', starts_at timestamptz not null,
  created_at timestamptz not null default now()
);
do $$ declare t text; begin
  foreach t in array array['players','cups','events'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop; end $$;

insert into public.players (name, skin, elo) values
('Hasty0_0','9272dec18a19c166cbf6c72ec272f2ea9a1b0f611b6dcdd4bdb583202cf757a2','{"diamond-smp":1872,"lt-cart":1685,"ht-cart":1508,"creeper":1968,"uhc":1922,"sword":2095,"smp":1996,"axe":2063,"mace":1900,"nethpot":1670}'),
('Spl_tt','6115d1a923ec1e999d656cfce00c7a6100b479849e9c21f039c125301b135b41','{"diamond-smp":1850,"lt-cart":1627,"ht-cart":1637,"creeper":1430,"uhc":1832,"sword":2002,"smp":2080,"axe":1910,"mace":1950,"nethpot":2100}'),
('qemvix','24c9d6b86b677d2d0934f33dd094d28f9404cd107c900b437a51ed4fb87808ec','{"diamond-smp":1820,"lt-cart":1757,"ht-cart":1414,"creeper":1588,"uhc":1446,"sword":1962,"smp":1863,"axe":2044,"mace":2180,"nethpot":1372}'),
('qnoodles','84d9cf31684271025f61d9431805f1aebe01f844fe06238f0c1496eb94ff8f19','{"diamond-smp":1200,"lt-cart":1181,"ht-cart":1200,"creeper":1092,"uhc":1267,"sword":1734,"smp":1862,"axe":1461,"mace":1020,"nethpot":1200}'),
('untitledducky','2e8d884df79a2992d39bca75d3ea914ca7085c86a5d23270f1a494fa1e27e289','{"diamond-smp":974,"lt-cart":1200,"ht-cart":1238,"creeper":1341,"uhc":1212,"sword":1200,"smp":1200,"axe":1200,"mace":1257,"nethpot":1172}'),
('acethew','fefb74ffca1d87d3f22cbe4a4b39d070cf40c9770ffd71354a129bbdab82f60e','{"diamond-smp":1100,"lt-cart":1038,"ht-cart":1139,"creeper":1000,"uhc":1200,"sword":1272,"smp":1000,"axe":1425,"mace":1200,"nethpot":1275}'),
('cl1pp3d08','1fa61a1b77341d627d4cae64de9c3f292402c09ac859f02ea1231a4e1a371dbf','{"diamond-smp":900,"lt-cart":1000,"ht-cart":1000,"creeper":1200,"uhc":1000,"sword":1000,"smp":1130,"axe":1000,"mace":1000,"nethpot":1000}'),
('synnlmao','7341c67aeefed97175e0421ffbe70e0bfbe175b622f432066ba1b2cb4a28d40b','{"diamond-smp":874,"lt-cart":1000,"ht-cart":1000,"creeper":1000,"uhc":1000,"sword":1000,"smp":1000,"axe":1000,"mace":1000,"nethpot":1000}');

insert into public.cups (name, gamemode, elo_reward, slots, starts_at) values
('Sword Showdown Cup','Sword',50,16, now() + interval '2 days'),
('Nethpot Clash','Nethpot',35,32, now() + interval '5 days');
insert into public.events (title, description, server, channel, starts_at) values
('Klober Friday Fights','Weekly open bracket — all tiers welcome.','Klober Tiers','event-stage', now() + interval '1 day');

-- admin account
do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated','authenticated','axel.rosenberg14@gmail.com', crypt('StefKatzu67', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
  values (gen_random_uuid(), uid::text, uid, jsonb_build_object('sub', uid::text, 'email','axel.rosenberg14@gmail.com','email_verified',true), 'email', now(), now(), now());
  insert into public.user_roles (user_id, role) values (uid, 'admin');
end $$;