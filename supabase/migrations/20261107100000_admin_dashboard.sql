-- Admin dashboard: let admins read every payment row so the dashboard can show
-- revenue. Owners still read only their own; nobody can write from the browser.

create policy "payments: admins read all"
  on public.payments for select
  to authenticated
  using (public.is_admin());
