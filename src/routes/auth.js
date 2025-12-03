import {
  loginController,
  profileController,
  verifyController,
  logoutController,
  refreshController,
} from '../controllers/auth.controller.js';

/**
 * Register auth-related routes on the provided router instance.
 * Routes are thin and delegate to controllers only.
 */
export default function registerAuthRoutes(router) {
  router.post('/login', loginController);
  router.get('/profile', profileController);
  router.get('/verify', verifyController);
  router.post('/logout', logoutController);
  router.post('/refresh', refreshController);
}

