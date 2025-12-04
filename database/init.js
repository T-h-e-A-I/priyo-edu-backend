import { pool } from './pool.js';

// Initialize database schema required by this service.
export async function initDb() {
  // Admin users for the backend dashboard
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

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

  // Ensure we have a stable unique key for upserting seed data
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS courses_title_key
    ON courses (title)
  `);

  // Simple view-like stats with counts for dashboard
  await pool.query(`
    CREATE OR REPLACE VIEW course_stats AS
    SELECT
      c.id AS course_id,
      c.title,
      COUNT(DISTINCT ch.id) AS chapter_count,
      COUNT(DISTINCT lc.id) AS live_class_count,
      COUNT(DISTINCT p.id) AS pdf_count,
      COUNT(DISTINCT q.id) AS quiz_count
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN live_classes lc ON lc.chapter_id = ch.id
    LEFT JOIN pdf_resources p ON p.chapter_id = ch.id
    LEFT JOIN quizzes q ON q.chapter_id = ch.id
    GROUP BY c.id, c.title
  `);

  // Chapters belong to a course and group the three learning modules (live, pdf, quiz).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Live class module for a chapter.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS live_classes (
      id SERIAL PRIMARY KEY,
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Live class',
      youtube_url TEXT,
      zoom_url TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      scheduled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Ensure title column exists for existing databases.
  await pool.query(`
    ALTER TABLE live_classes
    ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Live class'
  `);

  // PDF resource module for a chapter.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pdf_resources (
      id SERIAL PRIMARY KEY,
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      file_url TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Quiz module for a chapter.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id SERIAL PRIMARY KEY,
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      scheduled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Questions for a quiz. Each question stores four options and the index of the correct one.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_index SMALLINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

