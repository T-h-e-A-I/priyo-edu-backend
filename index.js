import dotenv from 'dotenv';

// Load environment variables from .env before importing the app or any other modules
dotenv.config();

const { default: app } = await import('./src/app.js');

// Use PORT from env, falling back to a sensible default for local development.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


