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

// Admin: create a new course
export async function createCourse(payload) {
  const {
    title,
    description,
    category,
    instructor,
    duration,
    students = 0,
    rating = null,
    price,
    level,
    thumbnail,
    videos = 0,
    quizzes = 0,
    pdfs = 0,
  } = payload;

  const res = await pool.query(
    `
      INSERT INTO courses (
        title, description, category, instructor, duration,
        students, rating, price, level, thumbnail, videos, quizzes, pdfs
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `,
    [
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
      pdfs,
    ],
  );

  return res.rows[0];
}

// Admin: update an existing course
export async function updateCourse(id, payload) {
  const res = await pool.query(
    `
      UPDATE courses
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        instructor = COALESCE($5, instructor),
        duration = COALESCE($6, duration),
        students = COALESCE($7, students),
        rating = COALESCE($8, rating),
        price = COALESCE($9, price),
        level = COALESCE($10, level),
        thumbnail = COALESCE($11, thumbnail),
        videos = COALESCE($12, videos),
        quizzes = COALESCE($13, quizzes),
        pdfs = COALESCE($14, pdfs),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      payload.title ?? null,
      payload.description ?? null,
      payload.category ?? null,
      payload.instructor ?? null,
      payload.duration ?? null,
      payload.students ?? null,
      payload.rating ?? null,
      payload.price ?? null,
      payload.level ?? null,
      payload.thumbnail ?? null,
      payload.videos ?? null,
      payload.quizzes ?? null,
      payload.pdfs ?? null,
    ],
  );

  return res.rows[0] || null;
}

// Admin: delete a course (cascades to chapters/modules)
export async function deleteCourse(id) {
  const res = await pool.query('DELETE FROM courses WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// Fetch a single course by id (metadata only, no chapters or modules).
export async function getCourseById(courseId) {
  const courseRes = await pool.query(
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
      WHERE id = $1
    `,
    [courseId],
  );

  if (courseRes.rowCount === 0) {
    return null;
  }

  const course = courseRes.rows[0];

  return {
    ...course,
    rating: course.rating != null ? Number(course.rating) : null,
  };
}

// Fetch chapters for a course (no modules).
export async function getCourseChapters(courseId) {
  const chaptersRes = await pool.query(
    `
      SELECT
        id,
        title,
        position,
        created_at,
        updated_at
      FROM chapters
      WHERE course_id = $1
      ORDER BY position ASC, id ASC
    `,
    [courseId],
  );

  return chaptersRes.rows.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    position: chapter.position,
    createdAt: chapter.created_at,
    updatedAt: chapter.updated_at,
  }));
}

// Fetch the latest three modules (live, pdf, quiz) for a chapter, without quiz questions.
export async function getChapterModules(chapterId) {
  const [liveRes, pdfRes, quizRes] = await Promise.all([
    pool.query(
      `
        SELECT
          id,
          title,
          youtube_url,
          zoom_url,
          status,
          scheduled_at
        FROM live_classes
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [chapterId],
    ),
    pool.query(
      `
        SELECT
          id,
          title,
          file_url,
          status
        FROM pdf_resources
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [chapterId],
    ),
    pool.query(
      `
        SELECT
          id,
          title,
          description,
          status,
          scheduled_at
        FROM quizzes
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [chapterId],
    ),
  ]);

  const liveRow = liveRes.rows[0];
  const pdfRow = pdfRes.rows[0];
  const quizRow = quizRes.rows[0];

  return {
    live: liveRow
      ? {
          id: liveRow.id,
          title: liveRow.title,
          youtubeUrl: liveRow.youtube_url,
          zoomUrl: liveRow.zoom_url,
          status: liveRow.status,
          scheduledAt: liveRow.scheduled_at,
        }
      : null,
    pdf: pdfRow
      ? {
          id: pdfRow.id,
          title: pdfRow.title,
          fileUrl: pdfRow.file_url,
          status: pdfRow.status,
        }
      : null,
    quiz: quizRow
      ? {
          id: quizRow.id,
          title: quizRow.title,
          description: quizRow.description,
          status: quizRow.status,
          scheduledAt: quizRow.scheduled_at,
        }
      : null,
  };
}

// Admin: fetch all modules for a chapter (all live/pdf/quizzes), newest first.
export async function getAllChapterModules(chapterId) {
  const [liveRes, pdfRes, quizRes] = await Promise.all([
    pool.query(
      `
        SELECT
          id,
          title,
          youtube_url,
          zoom_url,
          status,
          scheduled_at
        FROM live_classes
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [chapterId],
    ),
    pool.query(
      `
        SELECT
          id,
          title,
          file_url,
          status
        FROM pdf_resources
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [chapterId],
    ),
    pool.query(
      `
        SELECT
          id,
          title,
          description,
          status,
          scheduled_at
        FROM quizzes
        WHERE chapter_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [chapterId],
    ),
  ]);

  return {
    live: liveRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      youtubeUrl: row.youtube_url,
      zoomUrl: row.zoom_url,
      status: row.status,
      scheduledAt: row.scheduled_at,
    })),
    pdf: pdfRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      fileUrl: row.file_url,
      status: row.status,
    })),
    quiz: quizRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      scheduledAt: row.scheduled_at,
    })),
  };
}

// Fetch quiz questions for a quiz id.
export async function getQuizQuestions(quizId) {
  const questionsRes = await pool.query(
    `
      SELECT
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_index
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id ASC
    `,
    [quizId],
  );

  return questionsRes.rows.map((row) => ({
    id: row.id,
    question: row.question_text,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correctAnswer: row.correct_index,
    explanation: '',
  }));
}

// Legacy helper that aggregates course + chapters + modules + questions.
// Not used by any public API now, but kept for potential internal usage.
export async function getCourseDetail(courseId) {
  const course = await getCourseById(courseId);

  if (!course) {
    return null;
  }

  const chapters = await getCourseChapters(courseId);

  if (chapters.length === 0) {
    return {
      ...course,
      progress: 0,
      chapters: [],
    };
  }

  const chapterIds = chapters.map((c) => c.id);

  const liveRes = await pool.query(
    `
      SELECT
        id,
        chapter_id,
        youtube_url,
        zoom_url,
        status,
        scheduled_at
      FROM live_classes
      WHERE chapter_id = ANY($1::int[])
    `,
    [chapterIds],
  );

  const pdfRes = await pool.query(
    `
      SELECT
        id,
        chapter_id,
        title,
        file_url,
        status
      FROM pdf_resources
      WHERE chapter_id = ANY($1::int[])
    `,
    [chapterIds],
  );

  const quizRes = await pool.query(
    `
      SELECT
        id,
        chapter_id,
        title,
        description,
        status,
        scheduled_at
      FROM quizzes
      WHERE chapter_id = ANY($1::int[])
    `,
    [chapterIds],
  );

  const quizIds = quizRes.rows.map((q) => q.id);

  let questionsRes = { rows: [] };
  if (quizIds.length > 0) {
    questionsRes = await pool.query(
      `
        SELECT
          id,
          quiz_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_index
        FROM quiz_questions
        WHERE quiz_id = ANY($1::int[])
        ORDER BY id ASC
      `,
      [quizIds],
    );
  }

  const liveByChapter = new Map();
  for (const row of liveRes.rows) {
    liveByChapter.set(row.chapter_id, {
      id: row.id,
      title: row.title,
      youtubeUrl: row.youtube_url,
      zoomUrl: row.zoom_url,
      status: row.status,
      scheduledAt: row.scheduled_at,
    });
  }

  const pdfByChapter = new Map();
  for (const row of pdfRes.rows) {
    pdfByChapter.set(row.chapter_id, {
      id: row.id,
      title: row.title,
      fileUrl: row.file_url,
      status: row.status,
    });
  }

  const quizByChapter = new Map();
  for (const row of quizRes.rows) {
    quizByChapter.set(row.chapter_id, {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      scheduledAt: row.scheduled_at,
      questions: [],
    });
  }

  const questionsByQuiz = new Map();
  for (const row of questionsRes.rows) {
    if (!questionsByQuiz.has(row.quiz_id)) {
      questionsByQuiz.set(row.quiz_id, []);
    }
    questionsByQuiz.get(row.quiz_id).push({
      id: row.id,
      question: row.question_text,
      options: [row.option_a, row.option_b, row.option_c, row.option_d],
      correctAnswer: row.correct_index,
    });
  }

  for (const [quizId, questions] of questionsByQuiz.entries()) {
    for (const quiz of quizRes.rows) {
      if (quiz.id === quizId) {
        const existing = quizByChapter.get(quiz.chapter_id);
        if (existing) {
          existing.questions = questions;
        }
        break;
      }
    }
  }

  const chapterDtos = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    position: chapter.position,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
    live: liveByChapter.get(chapter.id) || null,
    pdf: pdfByChapter.get(chapter.id) || null,
    quiz: quizByChapter.get(chapter.id) || null,
  }));

  // For now, progress is computed on the client from completed modules.
  return {
    ...course,
    progress: 0,
    chapters: chapterDtos,
  };
}
