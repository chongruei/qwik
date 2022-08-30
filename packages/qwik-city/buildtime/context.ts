import type { NormalizedPluginOptions, BuildContext, PluginOptions } from './types';
import { isAbsolute, resolve } from 'path';
import { normalizePath } from '../utils/fs';

export function createBuildContext(
  rootDir: string,
  userOpts?: PluginOptions,
  target?: 'ssr' | 'client'
) {
  const ctx: BuildContext = {
    buildId: generateBuildId(),
    rootDir: normalizePath(rootDir),
    opts: normalizeOptions(rootDir, userOpts),
    routes: [],
    errors: [],
    layouts: [],
    entries: [],
    serviceWorkers: [],
    menus: [],
    diagnostics: [],
    frontmatter: new Map(),
    target: target || 'ssr',
    isDevServer: false,
    isDevServerClientOnly: false,
    isDirty: true,
  };
  return ctx;
}

export function resetBuildContext(ctx: BuildContext | null) {
  if (ctx) {
    ctx.buildId = generateBuildId();
    ctx.routes.length = 0;
    ctx.errors.length = 0;
    ctx.layouts.length = 0;
    ctx.entries.length = 0;
    ctx.menus.length = 0;
    ctx.diagnostics.length = 0;
    ctx.frontmatter.clear();
    ctx.isDirty = true;
  }
}

function normalizeOptions(rootDir: string, userOpts: PluginOptions | undefined) {
  const opts: NormalizedPluginOptions = { ...userOpts } as any;

  if (typeof opts.routesDir !== 'string') {
    opts.routesDir = resolve(rootDir, 'src', 'routes');
  } else if (!isAbsolute(opts.routesDir)) {
    opts.routesDir = resolve(rootDir, opts.routesDir);
  }
  opts.routesDir = normalizePath(opts.routesDir);

  if (typeof opts.baseUrl === 'string') {
    // baseUrl deprecated
    opts.basePathname = opts.baseUrl;
  }

  if (typeof opts.basePathname !== 'string') {
    opts.basePathname = '/';
  } else {
    const url = new URL(opts.basePathname, 'https://qwik.builer.io/');
    opts.basePathname = url.pathname;
    if (!opts.basePathname.endsWith('/')) {
      opts.basePathname += '/';
    }
  }

  if (typeof opts.trailingSlash !== 'boolean') {
    opts.trailingSlash = false;
  }

  opts.mdx = opts.mdx || {};

  return opts;
}

function generateBuildId() {
  return Math.random().toString(36).slice(2);
}