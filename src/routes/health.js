// Register healthcheck routes on the provided router instance.
export default function registerHealthRoutes(router) {
  // Simple healthcheck endpoint for monitoring
  router.get('/', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
}
