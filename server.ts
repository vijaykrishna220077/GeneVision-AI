// Local development entrypoint ONLY.
//
// This file is never deployed to Vercel and is never imported by
// api/index.ts. Its only job is to run the app outside of Vercel:
//   - `npm run dev`   -> tsx server.ts (NODE_ENV !== 'production'):
//                        attaches the Vite dev-server middleware for HMR.
//   - `npm start`     -> node dist/server.cjs (NODE_ENV === 'production'):
//                        serves the built dist/ folder as static SPA output.
//                        Useful for testing a production build locally or
//                        for self-hosting outside of Vercel.
//
// All actual API route logic lives in server/app.ts, which has no
// knowledge of Vite and never calls app.listen() — this file supplies
// both, and only in a non-Vercel context.

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development: Vite dev middleware provides HMR and serves src/ on the fly.
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Local "production" smoke-test: serve the built dist/ folder directly.
    // (On Vercel, static hosting serves dist/ and this branch never runs —
    // this file isn't even part of the deployed serverless function.)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GeneVision AI dev server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
