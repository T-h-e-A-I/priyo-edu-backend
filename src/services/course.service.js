import { pool } from '../../database/pool.js';

// Fetch courses, optionally filtered by category.
export async function getCourses(category) {
  const params = [];
  let whereClause = '';

  if (category && category !== 'all') {
    params.push(category);
    whereClause = 'WHERE category = $1';
  }

  const result = await pool.query(
    `
      SELECT
        id,
        title,
        description,
        category,
        instructor,
        duration,
        students,
        rating,
        price,
        level,
        thumbnail,
        videos,
        quizzes,
        pdfs
      FROM courses
      ${whereClause}
      ORDER BY id ASC
    `,
    params,
  );

  return result.rows;
}

