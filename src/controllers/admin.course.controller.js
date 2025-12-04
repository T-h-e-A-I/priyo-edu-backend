import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseChapters,
} from '../services/course.service.js';
import { pool } from '../../database/pool.js';

export async function adminGetCoursesController(req, res) {
  try {
    const courses = await getCourses('all');
    return res.json(courses);
  } catch (error) {
    console.error('Admin get courses failed', error);
    return res.status(500).json({ error: 'admin_courses_failed' });
  }
}

export async function adminGetCourseByIdController(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }

    const course = await getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'course_not_found' });
    }

    return res.json(course);
  } catch (error) {
    console.error('Admin get course failed', error);
    return res.status(500).json({ error: 'admin_course_failed' });
  }
}

export async function adminCreateCourseController(req, res) {
  try {
    const course = await createCourse(req.body || {});
    return res.status(201).json(course);
  } catch (error) {
    console.error('Admin create course failed', error);
    return res.status(500).json({ error: 'admin_create_course_failed' });
  }
}

export async function adminUpdateCourseController(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }

    const updated = await updateCourse(id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: 'course_not_found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Admin update course failed', error);
    return res.status(500).json({ error: 'admin_update_course_failed' });
  }
}

export async function adminDeleteCourseController(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }

    const ok = await deleteCourse(id);
    if (!ok) {
      return res.status(404).json({ error: 'course_not_found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Admin delete course failed', error);
    return res.status(500).json({ error: 'admin_delete_course_failed' });
  }
}

export async function adminGetChaptersController(req, res) {
  try {
    const courseId = Number.parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }
    const chapters = await getCourseChapters(courseId);
    return res.json(chapters);
  } catch (error) {
    console.error('Admin get chapters failed', error);
    return res.status(500).json({ error: 'admin_chapters_failed' });
  }
}

export async function adminCreateChapterController(req, res) {
  try {
    const courseId = Number.parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }
    const { title, position = 0 } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: 'title_required' });
    }
    const result = await pool.query(
      `
        INSERT INTO chapters (course_id, title, position)
        VALUES ($1, $2, $3)
        RETURNING id, title, position, created_at, updated_at
      `,
      [courseId, title, position],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Admin create chapter failed', error);
    return res.status(500).json({ error: 'admin_create_chapter_failed' });
  }
}

export async function adminUpdateChapterController(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }
    const { title, position } = req.body || {};
    const result = await pool.query(
      `
        UPDATE chapters
        SET
          title = COALESCE($2, title),
          position = COALESCE($3, position),
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, title, position, created_at, updated_at
      `,
      [id, title ?? null, position ?? null],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'chapter_not_found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Admin update chapter failed', error);
    return res.status(500).json({ error: 'admin_update_chapter_failed' });
  }
}

export async function adminDeleteChapterController(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }
    const result = await pool.query(
      `
        DELETE FROM chapters WHERE id = $1
      `,
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'chapter_not_found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Admin delete chapter failed', error);
    return res.status(500).json({ error: 'admin_delete_chapter_failed' });
  }
}

export async function adminStatsController(req, res) {
  try {
    const [countsRes, perCourseRes] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM courses) AS course_count,
          (SELECT COUNT(*) FROM chapters) AS chapter_count,
          (SELECT COUNT(*) FROM live_classes) AS live_class_count,
          (SELECT COUNT(*) FROM pdf_resources) AS pdf_count,
          (SELECT COUNT(*) FROM quizzes) AS quiz_count
      `),
      pool.query(`
        SELECT
          course_id,
          title,
          chapter_count,
          live_class_count,
          pdf_count,
          quiz_count
        FROM course_stats
        ORDER BY course_id
      `),
    ]);

    return res.json({
      totals: countsRes.rows[0],
      courses: perCourseRes.rows,
    });
  } catch (error) {
    console.error('Admin stats failed', error);
    return res.status(500).json({ error: 'admin_stats_failed' });
  }
}


