import type { Plugin, ViteDevServer } from 'vite';

import { CAMPAIGNS_PATH_REGEXP, EXAMPLES_PATH_REGEXP, getCspValue } from '../src/utils/htaccess/cspRules';

const SITE_CSP = getCspValue({ env: 'dev', scope: 'site' });
const EXAMPLES_CSP = getCspValue({ env: 'dev', scope: 'examples' });
const CAMPAIGNS_CSP = getCspValue({ env: 'dev', scope: 'campaigns' });

function getDevCsp(url: string): string {
    // Campaigns first: archived campaign pages (/archive/<version>/campaigns/) match
    // BOTH regexps, and must get the bryntum-allowing campaigns policy — mirroring the
    // Apache <If> precedence where the campaigns block trails (and so overrides) examples.
    if (CAMPAIGNS_PATH_REGEXP.test(url)) {
        return CAMPAIGNS_CSP;
    }
    if (EXAMPLES_PATH_REGEXP.test(url)) {
        return EXAMPLES_CSP;
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
