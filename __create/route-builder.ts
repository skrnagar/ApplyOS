import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

/**
 * Eager glob — required by Vite (static options only).
 * Avoids dev-time `await import()` at module load, which races HMR and causes
 * "Vite module runner has been closed" when the server restarts.
 */
const bundledRouteModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

type RouteModule = Partial<
  Record<
    (typeof HTTP_METHODS)[number],
    (request: Request, context?: { params: Record<string, string> }) => Response | Promise<Response>
  >
>;

function apiSegmentsFromKey(routeKey: string): string[] {
  const normalized = routeKey.replace(/\\/g, '/');
  const marker = '/src/app/api/';
  const i = normalized.indexOf(marker);
  if (i === -1) return [];
  return normalized
    .slice(i + marker.length)
    .replace(/\/route\.js$/, '')
    .split('/')
    .filter(Boolean);
}

function honoPathFromSegments(segments: string[]): string {
  if (!segments.length) return '/';
  const transformed = segments.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [, dots, param] = match;
      return dots === '...' ? `:${param}{.+}` : `:${param}`;
    }
    return segment;
  });
  return `/${transformed.join('/')}`;
}

function registerRouteModule(routeKey: string, route: RouteModule) {
  const segments = apiSegmentsFromKey(routeKey);
  const honoPath = honoPathFromSegments(segments);

  for (const method of HTTP_METHODS) {
    if (!route[method]) continue;

    const handler: Handler = async (c) => {
      const params = c.req.param();
      return await route[method]!(c.req.raw, { params });
    };

    switch (method) {
      case 'GET':
        api.get(honoPath, handler);
        break;
      case 'POST':
        api.post(honoPath, handler);
        break;
      case 'PUT':
        api.put(honoPath, handler);
        break;
      case 'DELETE':
        api.delete(honoPath, handler);
        break;
      case 'PATCH':
        api.patch(honoPath, handler);
        break;
      default:
        break;
    }
  }
}

function registerRoutes() {
  api.routes = [];

  const entries = Object.entries(bundledRouteModules).sort(([a], [b]) => b.length - a.length);
  for (const [routeKey, mod] of entries) {
    try {
      registerRouteModule(routeKey, mod as RouteModule);
    } catch (error) {
      console.error(`Error registering route ${routeKey}:`, error);
    }
  }
}

registerRoutes();

export { api, API_BASENAME };
