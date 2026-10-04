-- Должность (users.title) убрана из профиля и API 2026-10-04 — колонка больше не нужна.
-- Старые значения удаляются насовсем
alter table users drop column title;
