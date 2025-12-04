import { pool } from '../../database/pool.js';
import bcrypt from 'bcryptjs';

export async function findAdminByEmail(email) {
  const res = await pool.query(
    `
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return res.rows[0] || null;
}

export async function createAdminUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    `
      INSERT INTO admin_users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
    `,
    [email, passwordHash],
  );

  return res.rows[0];
}


