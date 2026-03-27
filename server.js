// ─────────────────────────────────────────────────────────────────────────────
// Railway production server — serves the Vite build as a SPA
// All unknown routes return index.html so React Router handles navigation.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// Serve static assets with long-term cache headers
app.use(
  express.static(DIST, {
    maxAge: '1y',
    immutable: true,
    // Don't cache index.html so new deploys take effect immediately
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA fallback — all unmatched routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GF Dashboard running on port ${PORT}`);
});
