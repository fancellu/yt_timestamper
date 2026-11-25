// Vercel entrypoint. Re-exports the self-contained esbuild bundle produced by
// `npm run build:vercel`. Bundling avoids a Vercel Services packaging issue where
// the handler is placed at the function root but node_modules under `server/`,
// causing ERR_MODULE_NOT_FOUND for express at runtime.
export { default } from './bundle/server.mjs';
