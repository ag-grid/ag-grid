// The live sites' redirects as the generators model them, for checking PRODUCTION rather than local
// Apache: the edge tests (ag-devops/edge-tests) import this from the deployed grid release branch.
//
// Each live .htaccess (grid root, /charts, /studio) is emitted fresh from source at the given refs,
// as the harness emits it, and modelled by the same generators that write expectations/generated-*.tsv.
// The archives and the in-flight patch are left out: only the live rules are modelled.
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { mainExpectations } from '../generators/gen-main-expectations.mjs';
import { subsiteExpectations } from '../generators/gen-subsite-expectations.mjs';
import { SITES, emitHtaccess, resolveSources } from './sources.mjs';

/**
 * Every live redirect rule of the three sites, and how each site answers any of its hosts.
 *
 * `env` takes the harness's source variables (GRID_REF, CHARTS_REPO/CHARTS_REF, STUDIO_REPO/STUDIO_REF);
 * all three sites are required. Returns `sources` (what was emitted, per site) and `sites`, each with
 * `hosts` (www first), `rules` (each rule's www samples: path, status, location, and for a known
 * defect the `actual` answer and the known-fail `marker`) and `firstHop(host, path)`.
 */
export function liveRedirectModel({ mainRepo, work, env }) {
    const resolved = resolveSources({
        mainRepo,
        work,
        htaccessEnv: 'production',
        env: { ...env, SKIP_CHARTS: '', SKIP_STUDIO: '' },
    });
    if (resolved.errors) {
        throw new Error(resolved.errors.join('\n'));
    }
    const { src } = resolved;
    const emit = (site, base) => {
        const dir = join(work, 'htdocs', base);
        mkdirSync(dir, { recursive: true });
        emitHtaccess(src[site].pkgDir, base, join(dir, '.htaccess'));
        return readFileSync(join(dir, '.htaccess'), 'utf8');
    };
    const subsite = (site) =>
        subsiteExpectations(emit(site, `/${site}`), {
            base: `/${site}`,
            slug: SITES[site].slug,
            label: `${site} /${site}/.htaccess`,
        });
    return {
        sources: Object.fromEntries(Object.entries(src).map(([site, s]) => [site, s.label])),
        sites: {
            grid: mainExpectations(emit('grid', ''), { label: 'grid /.htaccess' }),
            charts: subsite('charts'),
            studio: subsite('studio'),
        },
    };
}
