-- Ссылки проекта (необязательные): сам сайт/приложение и исходный код.
-- Пустые — на странице проекта кнопок просто нет
alter table projects
  add column website_url text,
  add column repo_url    text;
