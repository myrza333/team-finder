-- Иконки проектов: вместо эмодзи храним ключ иконки (её рисует фронтенд, см. ProjectIcon.tsx)
update projects set icon = case icon
  when '🚀' then 'rocket'
  when '🎓' then 'education'
  when '💻' then 'code'
  when '🌱' then 'nature'
  when '❤️' then 'health'
  when '❤' then 'health'
  when '🎮' then 'games'
  when '📚' then 'books'
  when '📱' then 'mobile'
  when '🎨' then 'design'
  when '🤖' then 'ai'
  when '🎵' then 'music'
  when '🛒' then 'shop'
  else 'rocket'
end
where icon not in ('rocket', 'education', 'code', 'nature', 'health', 'games', 'books', 'mobile', 'design', 'ai', 'music', 'shop');

alter table projects alter column icon set default 'rocket';

-- Эмодзи в демо-переписке (из 007_seed_activity.sql)
update messages set text = 'Hi everyone' where text = 'Hi everyone 👋';
update messages set text = 'Nice, I''ll connect the mobile screens to it' where text = 'Nice, I''ll connect the mobile screens to it 👍';
