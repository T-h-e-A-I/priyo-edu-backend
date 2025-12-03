import {
  getCourses,
  getCourseById,
  getCourseChapters,
  getChapterModules,
  getQuizQuestions,
} from '../services/course.service.js';

// Public controller: returns list of courses, optionally filtered by category.
export async function getCoursesController(req, res) {
  try {
    const { category } = req.query;
    const courses = await getCourses(category);
    return res.json(courses);
  } catch (error) {
    console.error('Fetching courses failed', error);
    return res.status(500).json({ error: 'courses_failed' });
  }
}

// Public controller: returns a single course (metadata only).
export async function getCourseController(req, res) {
  try {
    const rawId = req.params.id;
    const id = Number.parseInt(rawId, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }

    const course = await getCourseById(id);

    if (!course) {
      return res.status(404).json({ error: 'course_not_found' });
    }

    return res.json(course);
  } catch (error) {
    console.error('Fetching course failed', error);
    return res.status(500).json({ error: 'course_failed' });
  }
}

// Public controller: returns chapters for a course.
export async function getCourseChaptersController(req, res) {
  try {
    const rawId = req.params.id;
    const id = Number.parseInt(rawId, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_course_id' });
    }

    const chapters = await getCourseChapters(id);
    return res.json(chapters);
  } catch (error) {
    console.error('Fetching course chapters failed', error);
    return res.status(500).json({ error: 'course_chapters_failed' });
  }
}

// Public controller: returns modules (live/pdf/quiz) for a chapter, without quiz questions.
export async function getChapterModulesController(req, res) {
  try {
    const rawId = req.params.chapterId || req.params.id;
    const id = Number.parseInt(rawId, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_chapter_id' });
    }

    const modules = await getChapterModules(id);
    return res.json(modules);
  } catch (error) {
    console.error('Fetching chapter modules failed', error);
    return res.status(500).json({ error: 'chapter_modules_failed' });
  }
}

// Public controller: returns quiz questions for a quiz id.
export async function getQuizQuestionsController(req, res) {
  try {
    const rawId = req.params.quizId || req.params.id;
    const id = Number.parseInt(rawId, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid_quiz_id' });
    }

    const questions = await getQuizQuestions(id);
    return res.json(questions);
  } catch (error) {
    console.error('Fetching quiz questions failed', error);
    return res.status(500).json({ error: 'quiz_questions_failed' });
  }
}
