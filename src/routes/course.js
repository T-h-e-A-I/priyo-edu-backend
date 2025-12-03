import {
  getCoursesController,
  getCourseController,
  getCourseChaptersController,
  getChapterModulesController,
  getQuizQuestionsController,
} from '../controllers/course.controller.js';

// Register public course routes on the provided router instance.
// GET /api/course is a public API that returns course categories.
export default function registerCourseRoutes(router) {
  router.get('/', getCoursesController);
  router.get('/:id', getCourseController);
  router.get('/:id/chapters', getCourseChaptersController);
  router.get('/chapters/:chapterId/modules', getChapterModulesController);
  router.get('/quizzes/:quizId/questions', getQuizQuestionsController);
}


