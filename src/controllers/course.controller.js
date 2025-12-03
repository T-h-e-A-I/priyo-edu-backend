import { getCourses } from '../services/course.service.js';

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

