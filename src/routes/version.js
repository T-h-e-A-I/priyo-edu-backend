import pkg from '../../package.json' assert { type: 'json' };

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
