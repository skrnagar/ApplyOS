import { loadServerEnv } from '../src/utils/loadServerEnv.js';
loadServerEnv();

import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { serializeError } from 'serialize-error';
import type NeonAdapterType from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
import { isSupabaseConfigured } from '../src/utils/supabase/config';
import { supabaseSessionMiddleware } from '../src/utils/supabase/middleware';

type LegacyAuthDeps = {
  adapter: ReturnType<typeof NeonAdapterType>;
  hash: (password: string) => Promise<string>;
  verify: (hash: string, password: string) => Promise<boolean>;
};

let legacyAuthDepsPromise: Promise<LegacyAuthDeps> | null = null;

/** Neon + argon2 are only needed for legacy Auth.js; load lazily to avoid Vercel cold-start crashes. */
function getLegacyAuthDeps(): Promise<LegacyAuthDeps> {
  if (!legacyAuthDepsPromise) {
    legacyAuthDepsPromise = (async () => {
      const [{ Pool, neonConfig }, { default: ws }, argon2, { default: NeonAdapter }] =
        await Promise.all([
          import('@neondatabase/serverless'),
          import('ws'),
          import('argon2'),
          import('./adapter'),
        ]);
      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
      return {
        adapter: NeonAdapter(pool),
        hash: argon2.hash,
        verify: argon2.verify,
      };
    })();
  }
  return legacyAuthDepsPromise;
}

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

if (isSupabaseConfigured()) {
  app.use('*', supabaseSessionMiddleware);
}

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

if (process.env.AUTH_SECRET && process.env.DATABASE_URL) {
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: c.env.AUTH_SECRET,
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
        // Default /api/auth/error is not a React route; send users to sign-in with ?error=
        error: '/account/signin',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        sessionToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        callbackUrl: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
      },
      providers: [
        // Dev-only provider for simulated social sign-in (Google, Facebook, etc.)
        // Creates or finds a user by email without requiring a password.
        ...(process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT'
          ? [
              Credentials({
                id: 'dev-social',
                name: 'Development Social Sign-in',
                credentials: {
                  email: { label: 'Email', type: 'email' },
                  name: { label: 'Name', type: 'text' },
                  provider: { label: 'Provider', type: 'text' },
                },
                authorize: async (credentials) => {
                  const { email, name, provider } = credentials;
                  if (!email || typeof email !== 'string') return null;

                  const { adapter } = await getLegacyAuthDeps();
                  const existing = await adapter.getUserByEmail(email);
                  if (existing) return existing;

                  const allowedProviders = new Set(['google', 'facebook', 'twitter', 'apple']);
                  const providerName =
                    typeof provider === 'string' && allowedProviders.has(provider.toLowerCase())
                      ? provider.toLowerCase()
                      : 'google';
                  const newUser = await adapter.createUser({
                    emailVerified: null,
                    email,
                    name:
                      typeof name === 'string' && name.length > 0
                        ? name
                        : undefined,
                  });
                  await adapter.linkAccount({
                    type: 'oauth',
                    userId: newUser.id,
                    provider: providerName,
                    providerAccountId: `dev-${newUser.id}`,
                  });
                  return newUser;
                },
              }),
            ]
          : []),
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            const { adapter, verify } = await getLegacyAuthDeps();
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }

            // return user object with the their profile data
            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            const { adapter, hash } = await getLegacyAuthDeps();
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
      ],
    }))
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-expect-error -- duplex is accepted by the runtime even though the
    // type declarations don't include it; required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

app.use('/api/auth/*', async (c, next) => {
  if (!isAuthAction(c.req.path)) {
    return next();
  }
  if (!process.env.AUTH_SECRET) {
    const path = c.req.path.replace(/\/$/, '');
    if (path.endsWith('/session') && c.req.method === 'GET') {
      return c.json(null);
    }
    if (path.endsWith('/csrf') && c.req.method === 'GET') {
      return c.json({ csrfToken: '' });
    }
    if (isSupabaseConfigured()) {
      return c.json(
        {
          error: 'Configuration',
          message:
            'Auth.js is disabled. Sign in with Supabase email/password (AUTH_SECRET not required).',
        },
        503,
      );
    }
    return c.json(
      {
        error: 'Configuration',
        message:
          'Server authentication is not configured (AUTH_SECRET missing). Use email/password sign-in for local demo mode.',
      },
      503,
    );
  }
  return authHandler()(c, next);
});
app.route(API_BASENAME, api);

export { app };
