insert into skills (name) values
  -- языки
  ('C'), ('C++'), ('Rust'), ('Ruby'), ('Scala'), ('Elixir'), ('Dart'), ('Lua'), ('R'), ('SQL'), ('Bash'), ('Solidity'),
  -- frontend
  ('Svelte'), ('Nuxt'), ('Remix'), ('Astro'), ('Redux'), ('Zustand'), ('Tailwind CSS'), ('Bootstrap'), ('Material UI'),
  ('jQuery'), ('Vite'), ('Webpack'), ('Three.js'), ('GSAP'),
  -- backend
  ('Express'), ('NestJS'), ('Fastify'), ('Laravel'), ('Symfony'), ('Spring Boot'), ('ASP.NET'), ('Ruby on Rails'),
  ('Flask'), ('Gin'), ('GraphQL'), ('REST API'), ('gRPC'), ('WebSocket'), ('Socket.io'), ('Prisma'), ('TypeORM'),
  -- базы и инфраструктура
  ('MySQL'), ('SQLite'), ('Supabase'), ('Firebase'), ('Elasticsearch'), ('RabbitMQ'), ('Kafka'),
  ('Kubernetes'), ('Terraform'), ('Nginx'), ('Linux'), ('Git'), ('GitHub Actions'), ('CI/CD'), ('AWS'), ('Google Cloud'), ('Azure'), ('Vercel'),
  -- мобильная разработка
  ('SwiftUI'), ('Jetpack Compose'), ('Android'), ('iOS'), ('Expo'),
  -- данные и ML
  ('Pandas'), ('NumPy'), ('PyTorch'), ('TensorFlow'), ('scikit-learn'), ('OpenCV'), ('LangChain'), ('Data Analysis'),
  -- игры
  ('Unreal Engine'), ('Godot'), ('WebGL'),
  -- дизайн и прочее
  ('Adobe Photoshop'), ('Adobe Illustrator'), ('Blender'), ('Prototyping'), ('Design Systems'), ('Wireframing'),
  ('User Research'), ('Copywriting'), ('SEO'), ('Marketing'), ('Project Management'), ('Agile'), ('Testing'), ('Jest'), ('Playwright'), ('Cypress')
on conflict (name) do nothing;
