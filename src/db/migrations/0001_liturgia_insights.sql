create table if not exists liturgia_insights (
  data date primary key,
  insights jsonb not null,
  criado_em timestamptz not null default now()
);
