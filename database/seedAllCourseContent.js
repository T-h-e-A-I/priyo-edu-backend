import { pool } from './pool.js';

// Seed basic chapter + module structure for all courses.
// - For each course in the `courses` table:
//   - If it already has any chapters, we skip it (to avoid overwriting custom content).
//   - Otherwise, we create a few generic chapters with planned live/pdf/quiz modules.

async function seedAllCourseContent() {
  console.log('Seeding generic course content for all courses...');

  const coursesRes = await pool.query(
    `
      SELECT id, title
      FROM courses
      ORDER BY id ASC
    `,
  );

  if (coursesRes.rowCount === 0) {
    console.log('No courses found. Run seedCourses.js first.');
    return;
  }

  for (const course of coursesRes.rows) {
    const { id: courseId, title } = course;

    const existingChapters = await pool.query(
      `
        SELECT id
        FROM chapters
        WHERE course_id = $1
        LIMIT 1
      `,
      [courseId],
    );

    if (existingChapters.rowCount > 0) {
      console.log(
        `Skipping course id=${courseId} (${title}) – chapters already exist.`,
      );
      continue;
    }

    console.log(
      `Seeding generic content for course id=${courseId} (${title})...`,
    );

    const chapterConfigs = [
      { title: 'Introduction', position: 0 },
      { title: 'Core Concepts', position: 1 },
      { title: 'Final Assessment', position: 2 },
    ];

    await pool.query('BEGIN');

    try {
      for (const chapterConfig of chapterConfigs) {
        const chapterRes = await pool.query(
          `
            INSERT INTO chapters (course_id, title, position)
            VALUES ($1, $2, $3)
            RETURNING id
          `,
          [courseId, chapterConfig.title, chapterConfig.position],
        );

        const chapterId = chapterRes.rows[0].id;

        // Live class (planned; links can be filled later).
        await pool.query(
          `
            INSERT INTO live_classes (chapter_id, youtube_url, zoom_url, status, scheduled_at)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [chapterId, null, null, 'planned', null],
        );

        // PDF resource (planned).
        await pool.query(
          `
            INSERT INTO pdf_resources (chapter_id, title, file_url, status)
            VALUES ($1, $2, $3, $4)
          `,
          [
            chapterId,
            `${chapterConfig.title} Notes`,
            null,
            'planned',
          ],
        );

        // Quiz (planned, no questions yet).
        await pool.query(
          `
            INSERT INTO quizzes (chapter_id, title, description, status, scheduled_at)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            chapterId,
            `${chapterConfig.title} Quiz`,
            `Quiz for "${chapterConfig.title}" in ${title}`,
            'planned',
            null,
          ],
        );
      }

      await pool.query('COMMIT');
      console.log(
        `Generic content seeded successfully for course id=${courseId}.`,
      );
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(
        `Seeding generic content failed for course id=${courseId}`,
        err,
      );
      throw err;
    }
  }
}

seedAllCourseContent()
  .catch((err) => {
    console.error('Seeding all course content failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });


