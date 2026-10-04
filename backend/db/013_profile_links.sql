-- Ещё ссылки в профиле: LinkedIn, Instagram, Codewars, LeetCode (необязательные)
alter table users
  add column linkedin_url  text,
  add column instagram_url text,
  add column codewars_url  text,
  add column leetcode_url  text,
  -- Settings → Privacy: показывать ли эти четыре ссылки в публичном профиле
  add column show_socials  boolean not null default true;
