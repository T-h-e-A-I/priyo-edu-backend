import { getAllChapterModules } from '../services/course.service.js';
import { pool } from '../../database/pool.js';

export async function adminGetChapterModulesController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const modules = await getAllChapterModules(chapterId);
    return res.json(modules);
  } catch (error) {
    console.error('Admin get chapter modules failed', error);
    return res.status(500).json({ error: 'admin_get_chapter_modules_failed' });
  }
}

export async function adminUpsertLiveController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const {
      id = null,
      title = null,
      youtubeUrl = null,
      zoomUrl = null,
      status = 'planned',
      scheduledAt = null,
    } =
      req.body || {};

    let result;
    if (id != null) {
      // Edit existing live class by id (does not affect other rows for this chapter).
      result = await pool.query(
        `
          UPDATE live_classes
          SET
            title = COALESCE($3, title),
            youtube_url = $4,
            zoom_url = $5,
            status = $6,
            scheduled_at = $7,
            updated_at = NOW()
          WHERE id = $1 AND chapter_id = $2
          RETURNING id, chapter_id, title, youtube_url, zoom_url, status, scheduled_at
        `,
        [id, chapterId, title, youtubeUrl, zoomUrl, status, scheduledAt],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'live_class_not_found' });
      }
    } else {
      // Create a new live class for this chapter.
      result = await pool.query(
        `
          INSERT INTO live_classes (chapter_id, title, youtube_url, zoom_url, status, scheduled_at)
          VALUES ($1, COALESCE($2, 'Live class'), $3, $4, $5, $6)
          RETURNING id, chapter_id, title, youtube_url, zoom_url, status, scheduled_at
        `,
        [chapterId, title, youtubeUrl, zoomUrl, status, scheduledAt],
      );
    }

    const row = result.rows[0];
    return res.json({
      id: row.id,
      chapterId: row.chapter_id,
      title: row.title,
      youtubeUrl: row.youtube_url,
      zoomUrl: row.zoom_url,
      status: row.status,
      scheduledAt: row.scheduled_at,
    });
  } catch (error) {
    console.error('Admin upsert live failed', error);
    return res.status(500).json({ error: 'admin_upsert_live_failed' });
  }
}

export async function adminDeleteLiveController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const id = req.query.id ? Number.parseInt(req.query.id, 10) : null;

    if (id != null && !Number.isNaN(id)) {
      await pool.query('DELETE FROM live_classes WHERE id = $1 AND chapter_id = $2', [id, chapterId]);
    } else {
      // Delete only the most recent live class for this chapter if no id is specified.
      const latest = await pool.query(
        `
          SELECT id
          FROM live_classes
          WHERE chapter_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        `,
        [chapterId],
      );

      if (latest.rowCount > 0) {
        await pool.query('DELETE FROM live_classes WHERE id = $1', [latest.rows[0].id]);
      }
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Admin delete live failed', error);
    return res.status(500).json({ error: 'admin_delete_live_failed' });
  }
}

export async function adminUpsertPdfController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const { id = null, title = null, fileUrl = null, status = 'planned' } = req.body || {};

    let result;
    if (id != null) {
      // Edit existing PDF by id.
      result = await pool.query(
        `
          UPDATE pdf_resources
          SET
            title = $3,
            file_url = $4,
            status = $5,
            updated_at = NOW()
          WHERE id = $1 AND chapter_id = $2
          RETURNING id, chapter_id, title, file_url, status
        `,
        [id, chapterId, title, fileUrl, status],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'pdf_resource_not_found' });
      }
    } else {
      // Create new PDF for this chapter.
      result = await pool.query(
        `
          INSERT INTO pdf_resources (chapter_id, title, file_url, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id, chapter_id, title, file_url, status
        `,
        [chapterId, title, fileUrl, status],
      );
    }

    const row = result.rows[0];
    return res.json({
      id: row.id,
      chapterId: row.chapter_id,
      title: row.title,
      fileUrl: row.file_url,
      status: row.status,
    });
  } catch (error) {
    console.error('Admin upsert pdf failed', error);
    return res.status(500).json({ error: 'admin_upsert_pdf_failed' });
  }
}

export async function adminDeletePdfController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const id = req.query.id ? Number.parseInt(req.query.id, 10) : null;

    if (id != null && !Number.isNaN(id)) {
      await pool.query('DELETE FROM pdf_resources WHERE id = $1 AND chapter_id = $2', [id, chapterId]);
    } else {
      const latest = await pool.query(
        `
          SELECT id
          FROM pdf_resources
          WHERE chapter_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        `,
        [chapterId],
      );

      if (latest.rowCount > 0) {
        await pool.query('DELETE FROM pdf_resources WHERE id = $1', [latest.rows[0].id]);
      }
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Admin delete pdf failed', error);
    return res.status(500).json({ error: 'admin_delete_pdf_failed' });
  }
}

export async function adminUpsertQuizController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const {
    id = null,
      title = null,
      description = null,
      status = 'planned',
      scheduledAt = null,
    } = req.body || {};

    let result;
    if (id != null) {
      // Edit existing quiz by id.
      result = await pool.query(
        `
          UPDATE quizzes
          SET
            title = $3,
            description = $4,
            status = $5,
            scheduled_at = $6,
            updated_at = NOW()
          WHERE id = $1 AND chapter_id = $2
          RETURNING id, chapter_id, title, description, status, scheduled_at
        `,
        [id, chapterId, title, description, status, scheduledAt],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'quiz_not_found' });
      }
    } else {
      // Create new quiz for this chapter.
      result = await pool.query(
        `
          INSERT INTO quizzes (chapter_id, title, description, status, scheduled_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, chapter_id, title, description, status, scheduled_at
        `,
        [chapterId, title, description, status, scheduledAt],
      );
    }

    const row = result.rows[0];
    return res.json({
      id: row.id,
      chapterId: row.chapter_id,
      title: row.title,
      description: row.description,
      status: row.status,
      scheduledAt: row.scheduled_at,
    });
  } catch (error) {
    console.error('Admin upsert quiz failed', error);
    return res.status(500).json({ error: 'admin_upsert_quiz_failed' });
  }
}

export async function adminDeleteQuizController(req, res) {
  try {
    const chapterId = Number.parseInt(req.params.chapterId, 10);
    if (Number.isNaN(chapterId)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const id = req.query.id ? Number.parseInt(req.query.id, 10) : null;

    if (id != null && !Number.isNaN(id)) {
      await pool.query('DELETE FROM quizzes WHERE id = $1 AND chapter_id = $2', [id, chapterId]);
    } else {
      const latest = await pool.query(
        `
          SELECT id
          FROM quizzes
          WHERE chapter_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        `,
        [chapterId],
      );

      if (latest.rowCount > 0) {
        await pool.query('DELETE FROM quizzes WHERE id = $1', [latest.rows[0].id]);
      }
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Admin delete quiz failed', error);
    return res.status(500).json({ error: 'admin_delete_quiz_failed' });
  }
}


