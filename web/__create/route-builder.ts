import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

/**
 * Eager glob only — Vite requires static `import.meta.glob` options (no `import.meta.env.*` in the options object).
 * Used only when `import.meta.env.PROD`; dev still registers routes via filesystem + dynamic import below.
 */
const bundledRouteModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

const candidateApiDirs = [
  join(process.cwd(), 'src/app/api'),
  join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api'),
];
const __dirname =
  candidateApiDirs.find((dir) => existsSync(dir)) ?? candidateApiDirs[0];
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

function segmentsFromFilesystemPath(routeFile: string): string[] {
  const relativePath = routeFile.replace(__dirname, '');
  return relativePath.split('/').filter(Boolean).slice(0, -1);
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

function registerRouteModule(routeKey: string, route: RouteModule, options: { devHotReload?: boolean } = {}) {
  const segments =
    apiSegmentsFromKey(routeKey).length > 0
      ? apiSegmentsFromKey(routeKey)
      : segmentsFromFilesystemPath(routeKey);
  const honoPath = honoPathFromSegments(segments);

  for (const method of HTTP_METHODS) {
    if (!route[method]) continue;

    const handler: Handler = async (c) => {
      const params = c.req.param();
      if (options.devHotReload) {
        const updatedRoute = (await import(
          /* @vite-ignore */ `${routeKey}?update=${Date.now()}`
        )) as RouteModule;
        return await updatedRoute[method]!(c.req.raw, { params });
      }
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

async function findRouteFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        if (file === '__create') continue;
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        if (filePath === join(__dirname, 'route.js')) {
          routes.unshift(filePath);
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

async function registerRoutes() {
  api.routes = [];

  if (import.meta.env.PROD) {
    const entries = Object.entries(bundledRouteModules).sort(([a], [b]) => b.length - a.length);
    for (const [routeKey, mod] of entries) {
      try {
        registerRouteModule(routeKey, mod as RouteModule);
      } catch (error) {
        console.error(`Error registering bundled route ${routeKey}:`, error);
      }
    }
    return;
  }

  const routeFiles = (
    await findRouteFiles(__dirname).catch((error) => {
      console.error('Error finding route files:', error);
      return [];
    })
  ).sort((a, b) => b.length - a.length);

  for (const routeFile of routeFiles) {
    try {
      const route = (await import(
        /* @vite-ignore */ `${routeFile}?update=${Date.now()}`
      )) as RouteModule;
      registerRouteModule(routeFile, route, { devHotReload: true });
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

await registerRoutes();

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept(() => {
    registerRoutes().catch((err) => {
      console.error('Error reloading routes:', err);
    });
  });
}

export { api, API_BASENAME };
