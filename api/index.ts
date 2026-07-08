// Vercel serverless entry point.
//
// Vercel treats any file in /api as its own serverless function. Rather
// than rewriting 20+ Express routes into separate files, we reuse the
// existing Express app from server.ts as-is — Express apps are valid
// (req, res) handlers, which is exactly what Vercel's Node runtime expects.
//
// vercel.json rewrites every /api/* request to this single function, and
// Express's own router (already defined in server.ts) dispatches to the
// correct route internally.
import app from "../server.ts";

export default app;
