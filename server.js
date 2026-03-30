// ─────────────────────────────────────────────────────────────────────────────
// Railway production server — serves the Vite build as a SPA
// All unknown routes return index.html so React Router handles navigation.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// Notion API proxy — forwards /notion-api/* to api.notion.com/v1/*
app.use('/notion-api', express.json(), (req, res) => {
  const target = `https://api.notion.com/v1${req.path}`;
  const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : undefined;
  const opts = {
    method: req.method,
    headers: {
      Authorization: req.headers.authorization || '',
      'Notion-Version': req.headers['notion-version'] || '2022-06-28',
      'Content-Type': 'application/json',
      ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
    },
  };
  const pr = https.request(target, opts, (nr) => {
    res.status(nr.statusCode || 502);
    res.setHeader('Content-Type', nr.headers['content-type'] || 'application/json');
    nr.pipe(res);
  });
  pr.on('error', () => res.status(502).json({ error: 'Notion proxy error' }));
  if (body) pr.write(body);
  pr.end();
});

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
