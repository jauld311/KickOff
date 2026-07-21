-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;


-- =====================================================
-- PROFILES
-- =====================================================

create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);


-- =====================================================
-- MATCHES
-- =====================================================

create policy "Authenticated users can view matches"
on public.matches
for select
to authenticated
using (true);

create policy "Users can create their own matches"
on public.matches
for insert
to authenticated
with check ((select auth.uid()) = creator_id);

create policy "Creators can update their own matches"
on public.matches
for update
to authenticated
using ((select auth.uid()) = creator_id)
with check ((select auth.uid()) = creator_id);

create policy "Creators can delete their own matches"
on public.matches
for delete
to authenticated
using ((select auth.uid()) = creator_id);


-- =====================================================
-- MATCH PARTICIPANTS
-- =====================================================

create policy "Authenticated users can view participants"
on public.match_participants
for select
to authenticated
using (true);

create policy "Users can join matches as themselves"
on public.match_participants
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can leave matches themselves"
on public.match_participants
for delete
to authenticated
using ((select auth.uid()) = user_id);