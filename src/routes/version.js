import { createRequire } from 'module';

// Use CommonJS-style require within an ES module so that importing JSON
// works reliably across different Node versions and runtimes.
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

// Register version-related routes on the provided router instance.
export default function registerVersionRoutes(router) {
  // Version endpoint – useful for debugging and deployments
  router.get('/', (req, res) => {
    res.json({
      name: pkg.name,
      version: pkg.version,
      environment: process.env.NODE_ENV || 'development',
    });
  });
}
