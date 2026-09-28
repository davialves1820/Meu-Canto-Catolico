alter table users
  add column if not exists avatar_url text,
  add column if not exists terms_accepted_at timestamptz;
