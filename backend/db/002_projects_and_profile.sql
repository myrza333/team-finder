alter table users add column location text;

alter table projects rename column description to full_description;
alter table projects add column description text not null default '';
alter table projects add column icon text not null default '🚀';
alter table projects add column category text not null default 'Development'
  check (category in ('Development', 'Design', 'AI', 'Startup', 'Education', 'Games', 'Mobile'));

alter table vacancies add column position smallint not null default 0;

create table vacancy_skills (
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  skill_id   int  not null references skills(id) on delete cascade,
  primary key (vacancy_id, skill_id)
);

alter table vacancy_skills enable row level security;
