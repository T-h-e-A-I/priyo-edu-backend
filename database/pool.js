import pg from 'pg';

const { Pool } = pg;

// Central Postgres connection pool.
// Defaults match the previous values but can be overridden via .env.
export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'priyo_academy',
  user: process.env.PGUSER || 'priyo_academy',
  password: process.env.PGPASSWORD || 'aafaoih$2321oi',
});


