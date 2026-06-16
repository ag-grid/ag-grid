import type { Plugin, ViteDevServer } from 'vite';

import { getCspValue } from '../src/utils/htaccess/cspRules';

const SITE_CSP = getCspValue({ env: 'dev', scope: 'site' });
const EXAMPLES_CSP = getCspValue({ env: 'dev', scope: 'examples' });
const CAMPAIGNS_CSP = getCspValue({ env: 'dev', scope: 'campaigns' });

// Mirror EXAMPLES_PATH_CONDITION / CAMPAIGNS_PATH_CONDITION in cspRules.ts, which
// scope the served .htaccess policy by URL path on staging/production.
const EXAMPLES_PATH = /^\/(examples|archive)\//;
const CAMPAIGNS_PATH = /^\/campaigns\//;

function getDevCsp(url: string): string {
    if (EXAMPLES_PATH.test(url)) {
        return EXAMPLES_CSP;
    }
    if (CAMPAIGNS_PATH.test(url)) {
        return CAMPAIGNS_CSP;
    }
    return SITE_CSP;
}

/**
 * Vite plugin serving the dev server's Content-Security-Policy header with the
 * same path-scoped split as the generated .htaccess: ordinary pages get the
 * 'site' policy (no 'unsafe-eval'), example-runner documents get the relaxed
 * 'examples' policy, and partnership campaign pages get the 'campaigns' policy
 * (bryntum.com allowed). Keeps local development honest about main-page eval use.
 */
export default function agDevCsp(): Plugin {
    return {
        name: 'ag-dev-csp',
        configureServer(server: ViteDevServer) {
            server.middlewares.use((req, res, next) => {
                res.setHeader('Content-Security-Policy', getDevCsp(req.url ?? ''));
                next();
            });
        },
    };
}
