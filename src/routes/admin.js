import { adminLoginController } from '../controllers/admin.controller.js';
import {
  adminGetCoursesController,
  adminGetCourseByIdController,
  adminCreateCourseController,
  adminUpdateCourseController,
  adminDeleteCourseController,
  adminGetChaptersController,
  adminCreateChapterController,
  adminUpdateChapterController,
  adminDeleteChapterController,
  adminStatsController,
} from '../controllers/admin.course.controller.js';
import {
  adminGetChapterModulesController,
  adminUpsertLiveController,
  adminDeleteLiveController,
  adminUpsertPdfController,
  adminDeletePdfController,
  adminUpsertQuizController,
  adminDeleteQuizController,
} from '../controllers/admin.lesson.controller.js';
import adminAuth from '../middleware/adminAuth.js';

export default function registerAdminRoutes(router) {
  // Public admin login
  router.post('/login', adminLoginController);

  // All routes below require a valid admin JWT
  router.use(adminAuth);

  router.get('/stats', adminStatsController);

  // Course CRUD
  router.get('/courses', adminGetCoursesController);
  router.get('/courses/:id', adminGetCourseByIdController);
  router.post('/courses', adminCreateCourseController);
  router.patch('/courses/:id', adminUpdateCourseController);
  router.delete('/courses/:id', adminDeleteCourseController);

  // Chapter CRUD
  router.get('/courses/:courseId/chapters', adminGetChaptersController);
  router.post('/courses/:courseId/chapters', adminCreateChapterController);
  router.patch('/chapters/:id', adminUpdateChapterController);
  router.delete('/chapters/:id', adminDeleteChapterController);

  // Simple "lesson" modules per chapter (live, pdf, quiz)
  router.get('/chapters/:chapterId/modules', adminGetChapterModulesController);
  router.put('/chapters/:chapterId/live', adminUpsertLiveController);
  router.delete('/chapters/:chapterId/live', adminDeleteLiveController);
  router.put('/chapters/:chapterId/pdf', adminUpsertPdfController);
  router.delete('/chapters/:chapterId/pdf', adminDeletePdfController);
  router.put('/chapters/:chapterId/quiz', adminUpsertQuizController);
  router.delete('/chapters/:chapterId/quiz', adminDeleteQuizController);
}



