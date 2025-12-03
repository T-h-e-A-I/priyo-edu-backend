import { pool } from './pool.js';

// Initialize database schema required by this service.
export async function initDb() {
  // One Auth users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS one_auth_users (
      id SERIAL PRIMARY KEY,
      uuid UUID UNIQUE NOT NULL,
      name TEXT,
      mobile TEXT,
      external_id INTEGER,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Courses table seeded from frontend hard-coded data
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      instructor TEXT,
      duration TEXT,
      students INTEGER,
      rating NUMERIC,
      price TEXT,
      level TEXT,
      thumbnail TEXT,
      videos INTEGER,
      quizzes INTEGER,
      pdfs INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

