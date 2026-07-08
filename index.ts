// Vercel serverless entry point.
//
// Vercel treats every file under /api as its own serverless function. This
// file imports the fully-configured Express app from server/app.ts and
// hands it straight to the Vercel Node.js runtime — Express apps are valid
// (req, res) handlers, which is exactly what @vercel/node expects.
//
// vercel.json rewrites every /api/* request to this single function, and
// Express's own router (defined in server/app.ts) dispatches internally to
// the correct route (/api/auth/login, /api/projects, /api/quantum/*, etc).
//
// IMPORTANT: this imports '../server/app.js', NOT '../server.js'. The old
// entry point imported '../server.js', which was ambiguous at build/runtime
// with the sibling `server/` directory (both resolve to "server") and is
// what produced:
//   Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/var/task/server'
//     is not supported resolving ES modules
//   Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/index.ts'
// Pointing directly at 'server/app.js' (a real, unambiguous file inside the
// directory) removes that collision entirely. server/app.ts also no longer
// imports 'vite' (a devDependency) or calls app.listen(), so nothing dev-only
// leaks into the production function bundle.
import app from '../server/app.js';

export default app;
