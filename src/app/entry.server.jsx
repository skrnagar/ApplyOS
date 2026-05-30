/** @see https://vercel.com/docs/frameworks/react-router#using-a-custom-appentryserver-file */
import { handleRequest as vercelHandleRequest } from '@vercel/react-router/entry.server';
import { app } from '../../__create/hono-app.js';

function isApiRequest(request) {
  const { pathname } = new URL(request.url);
  return pathname === '/api' || pathname.startsWith('/api/');
}

/** Vercel SSR entry: route /api/* to Hono (same as local dev server). */
export default async function handleRequest(...args) {
  const [request] = args;
  if (isApiRequest(request)) {
    return app.fetch(request);
  }
  return vercelHandleRequest(...args);
}
