const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run db:run <path/to/file.sql>');
  process.exit(1);
}

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
const sql = fs.readFileSync(path.resolve(file), 'utf8');

(async () => {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log(`✓ ${file} applied`);
  } catch (e) {
    await client.query('rollback');
    console.error(`✗ ${file} failed, nothing was changed:\n${e.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
