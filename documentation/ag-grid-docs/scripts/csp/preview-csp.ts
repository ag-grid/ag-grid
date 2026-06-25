#!/usr/bin/env tsx
/* eslint-disable no-console */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { preview } from 'vite';

import type { CspEnv, CspMode } from '../../src/utils/htaccess/cspRules';
import {
    CAMPAIGNS_PATH_REGEXP,
    EXAMPLES_PATH_REGEXP,
    getCspHeaderName,
    getCspValue,
} from '../../src/utils/htaccess/cspRules';

/**
 * Preview the built site with the *enforced production* Content-Security-Policy
 * applied, so CSP regressions can be caught locally.
 *
 * Why this exists instead of `astro preview`:
 *   - `astro preview` serves the static build with NO CSP header at all — its
 *     server only honours a single static `vite.server.headers` value and strips
 *     all user Vite plugins (see core/preview/static-preview-server.js), so the
 *     `agDevCsp` middleware never runs there. A clean console under `astro preview`
 *     therefore proves nothing about the production policy.
 *   - The `astro dev` server (via `agDevCsp`) does serve a path-scoped CSP, but the
 *     dev `site` policy keeps `'unsafe-inline'` (Vite injects inline scripts in dev),
 *     so it cannot validate the hash-based production policy either.
 *
 * This server calls Vite's `preview()` directly — so the CSP plugin below is NOT
 * stripped — and sets the same path-scoped policy the generated `.htaccess` serves
 * on staging/production: ordinary pages get the `site` policy (hashes, no
 * `'unsafe-inline'`), example-runner documents get the relaxed `examples` policy,
 * and partnership campaign pages get the `campaigns` policy.
 *
 * Usage (run after a build; defaults to the enforced production policy):
 *   nx run ag-grid-docs:preview:csp
 *   tsx documentation/ag-grid-docs/scripts/csp/preview-csp.ts [--env=...] [--mode=...] [--port=...] [--no-https]
 *
 * Port: defaults to 4611 to match PUBLIC_SITE_URL baked into a local build
 * (.env.build → https://localhost:4611). The example runner fetches its modules
 * from that absolute origin, so serving on a different port makes those requests
 * cross-origin and the examples-scope connect-src 'self' blocks them. Keep it 4611.
 */

// Match vite-plugin-mkcert's data dir and default filenames (see agMkcertPreview.ts).
const MKCERT_DIR = path.join(os.homedir(), '.vite-plugin-mkcert');
const MKCERT_KEY = path.join(MKCERT_DIR, 'dev.pem');
const MKCERT_CERT = path.join(MKCERT_DIR, 'cert.pem');

const DEFAULT_PORT = 4611;

const ENVS: CspEnv[] = ['dev', 'staging', 'production'];
const MODES: CspMode[] = ['report-only', 'enforce'];

function assertOneOf<T extends string>(value: string | undefined, allowed: T[], flag: string): T {
    if (value === undefined || !allowed.includes(value as T)) {
        throw new Error(`${flag} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

interface Args {
    env: CspEnv;
    mode: CspMode;
    port: number;
    https: boolean;
}

function parseArgs(argv: string[]): Args {
    let env: CspEnv = 'production';
    let mode: CspMode = 'enforce';
    let port = DEFAULT_PORT;
    let https = true;

    for (let i = 0, len = argv.length; i < len; ++i) {
        const arg = argv[i];
        const [key, inlineValue] = arg.split('=');
        if (key === '--no-https') {
            https = false;
        } else if (key === '--env') {
            env = assertOneOf(inlineValue ?? argv[++i], ENVS, '--env');
        } else if (key === '--mode') {
            mode = assertOneOf(inlineValue ?? argv[++i], MODES, '--mode');
        } else if (key === '--port') {
            const parsed = Number(inlineValue ?? argv[++i]);
            if (Number.isFinite(parsed) && parsed > 0) {
                port = parsed;
            }
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return { env, mode, port, https };
}

function getHttpsOption(enabled: boolean): { key: Buffer; cert: Buffer } | undefined {
    if (!enabled) {
        return undefined;
    }
    if (fs.existsSync(MKCERT_KEY) && fs.existsSync(MKCERT_CERT)) {
        return { key: fs.readFileSync(MKCERT_KEY), cert: fs.readFileSync(MKCERT_CERT) };
    }
    console.warn(
        `[preview-csp] mkcert certificates not found at ${MKCERT_DIR}; serving over HTTP. ` +
            `Run 'nx dev' once to generate them, or pass --no-https to silence this.`
    );
    return undefined;
}

function makeCspResolver(env: CspEnv): (url: string) => string {
    const site = getCspValue({ env, scope: 'site' });
    const examples = getCspValue({ env, scope: 'examples' });
    const campaigns = getCspValue({ env, scope: 'campaigns' });
    return (url: string): string => {
        // Campaigns first: archived campaign pages (/archive/<version>/campaigns/) match
        // BOTH regexps and must get the bryntum-allowing campaigns policy — mirroring the
        // Apache <If> precedence where the campaigns block trails (and so overrides) examples.
        if (CAMPAIGNS_PATH_REGEXP.test(url)) {
            return campaigns;
        }
        if (EXAMPLES_PATH_REGEXP.test(url)) {
            return examples;
        }
        return site;
    };
}

async function main(): Promise<void> {
    const { env, mode, port, https } = parseArgs(process.argv.slice(2));
    const resolveCsp = makeCspResolver(env);
    const headerName = getCspHeaderName(mode);
    const httpsOption = getHttpsOption(https);
    const outDir = path.join(process.cwd(), 'dist');

    const server = await preview({
        configFile: false,
        root: process.cwd(),
        build: { outDir: 'dist' },
        // 'mpa' serves the static build as a multi-page app: each route maps to its
        // own .html file with no SPA fallback. The default 'spa' would serve the
        // homepage for any unmatched URL, which silently breaks example-runner
        // resource fetches and standalone example pages (they 'load' the homepage).
        appType: 'mpa',
        preview: {
            port,
            strictPort: true,
            host: true,
            https: httpsOption,
        },
        plugins: [
            {
                name: 'ag-preview-csp',
                configurePreviewServer(previewServer) {
                    previewServer.middlewares.use((req, res, next) => {
                        const rawUrl = req.url ?? '';
                        const queryIndex = rawUrl.indexOf('?');
                        const pathname = queryIndex === -1 ? rawUrl : rawUrl.slice(0, queryIndex);
                        const search = queryIndex === -1 ? '' : rawUrl.slice(queryIndex);

                        // Mimic the production host (Apache RewriteRule): redirect an
                        // extensionless directory path to a trailing slash so the
                        // browser lands on the canonical URL and relative asset paths
                        // resolve. Without this the example pages load with broken assets.
                        if (pathname !== '/' && !pathname.endsWith('/') && !path.extname(pathname)) {
                            const indexFile = path.join(outDir, decodeURIComponent(pathname), 'index.html');
                            if (fs.existsSync(indexFile)) {
                                res.statusCode = 308;
                                res.setHeader('Location', `${pathname}/${search}`);
                                res.end();
                                return;
                            }
                        }

                        res.setHeader(headerName, resolveCsp(pathname));
                        res.setHeader('X-Content-Type-Options', 'nosniff');

                        // Mirror the production .htaccess CORS headers so example
                        // embedders (Plunkr, CodeSandbox, Codespaces) can fetch the
                        // example bundles from /files/ cross-origin, as they do in prod.
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');

                        next();
                    });
                },
            },
        ],
    });

    server.printUrls();
    console.log(
        `\n[preview-csp] Serving dist with '${headerName}' — ${env} policy, ` +
            `path-scoped (site / examples / campaigns).\n`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
