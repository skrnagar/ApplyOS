import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { defineConfig, loadEnv } from 'vite';
import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';
import { addRenderIds } from './plugins/addRenderIds';
import { aliases } from './plugins/aliases';
import consoleToParent from './plugins/console-to-parent';
import { layoutWrapperPlugin } from './plugins/layouts';
import { loadFontsFromTailwindSource } from './plugins/loadFontsFromTailwindSource';
import { nextPublicProcessEnv } from './plugins/nextPublicProcessEnv';
import { restart } from './plugins/restart';
import { restartEnvFileChange } from './plugins/restartEnvFileChange';
import { normalizeSupabaseUrl } from './src/utils/supabase/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverAuth = Boolean(env.AUTH_SECRET);
  const supabaseUrl = normalizeSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKeyRaw =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey =
    supabaseKeyRaw && supabaseKeyRaw.trim().length >= 20 ? supabaseKeyRaw.trim() : null;
  const supabaseAuth = Boolean(supabaseUrl && supabaseKey);
  const supabaseAuthOnly = supabaseAuth && !serverAuth;

  return {
  // Keep them available via import.meta.env.NEXT_PUBLIC_*
  envPrefix: 'NEXT_PUBLIC_',
  define: {
    'import.meta.env.NEXT_PUBLIC_SERVER_AUTH': JSON.stringify(serverAuth ? 'true' : 'false'),
    'import.meta.env.NEXT_PUBLIC_SUPABASE_AUTH': JSON.stringify(supabaseAuth ? 'true' : 'false'),
    'import.meta.env.NEXT_PUBLIC_SUPABASE_AUTH_ONLY': JSON.stringify(
      supabaseAuthOnly ? 'true' : 'false',
    ),
    ...(supabaseUrl
      ? { 'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl) }
      : {}),
    ...(supabaseKey
      ? {
          'import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
          'import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
        }
      : {}),
  },
  optimizeDeps: {
    // Explicitly include fast-glob, since it gets dynamically imported and we
    // don't want that to cause a re-bundle.
    include: ['fast-glob', 'lucide-react'],
    exclude: [
      '@hono/auth-js/react',
      '@hono/auth-js',
      '@auth/core',
      '@hono/auth-js',
      'hono/context-storage',
      '@auth/core/errors',
      'fsevents',
      'lightningcss',
    ],
  },
  logLevel: 'info',
  plugins: [
    nextPublicProcessEnv(),
    restartEnvFileChange(),
    reactRouterHonoServer({
      serverEntryPoint: './__create/index.ts',
      runtime: 'node',
    }),
    babel({
      include: ['src/**/*.{js,jsx,ts,tsx}'], // or RegExp: /src\/.*\.[tj]sx?$/
      exclude: /node_modules/, // skip everything else
      babelConfig: {
        babelrc: false, // don’t merge other Babel files
        configFile: false,
        plugins: ['styled-jsx/babel'],
      },
    }),
    // Do not restart the dev server on `src/**/route.*` — that closes the SSR
    // module runner mid-request and spams "Vite module runner has been closed"
    // while Hono loads `__create/route-builder.ts`. API routes use eager glob;
    // Vite HMR invalidates that graph when a route file changes.
    restart({
      restart: [
        'src/**/page.jsx',
        'src/**/page.tsx',
        'src/**/layout.jsx',
        'src/**/layout.tsx',
      ],
    }),
    consoleToParent(),
    loadFontsFromTailwindSource(),
    addRenderIds(),
    reactRouter(),
    tsconfigPaths(),
    aliases(),
    layoutWrapperPlugin(),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      'npm:stripe': 'stripe',
      stripe: path.resolve(__dirname, './src/__create/stripe'),
      '@auth/create/react': '@hono/auth-js/react',
      '@auth/create': path.resolve(__dirname, './src/__create/@auth/create'),
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  clearScreen: false,
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('gsap') || id.includes('lenis') || id.includes('motion/')) return 'motion';
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router';
          if (id.includes('@tanstack')) return 'query';
          return 'vendor';
        },
      },
    },
  },
  // Bundle these for SSR instead of resolving raw ESM files from node_modules on Vercel (avoids GSAP "Cannot use import statement outside a module").
  ssr: {
    noExternal: ['gsap', 'lenis', 'three'],
  },
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 4000,
    fs: {
      allow: ['..', '../../shared'],
    },
    hmr: {
      overlay: false,
    },
    warmup: {
      clientFiles: ['./src/app/**/*', './src/app/root.tsx', './src/app/routes.ts'],
    },
  },
};
});
