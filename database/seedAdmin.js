import { pool } from './pool.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`Seeding admin user ${email}...`);

  const existing = await pool.query(
    'SELECT id FROM admin_users WHERE email = $1',
    [email],
  );

  if (existing.rowCount > 0) {
    console.log('Admin user already exists, skipping.');
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `
      INSERT INTO admin_users (email, password_hash)
      VALUES ($1, $2)
    `,
    [email, hash],
  );

  console.log('Admin user created.');
  await pool.end();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


