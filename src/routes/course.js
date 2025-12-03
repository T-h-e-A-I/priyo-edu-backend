import { getCoursesController } from '../controllers/course.controller.js';

// Register public course routes on the provided router instance.
// GET /api/course is a public API that returns course categories.
export default function registerCourseRoutes(router) {
  router.get('/', getCoursesController);
}


