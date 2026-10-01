import { existsSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';

import { FRAMEWORKS, FRAMEWORK_LANDING_HUBS } from '../constants';
import { SESSIONS, sessionSlug } from './beyondThePromptSessions';

/**
 * Resolves a site path against the Astro routes in `src/pages` and the docs content collection, so
 * a test can tell whether the build would emit it without needing a built `dist`.
 */

const PAGES_DIR = join(__dirname, '../pages');
const DOCS_CONTENT_DIR = join(__dirname, '../content/docs');
const CAMPAIGN_CONTENT_DIR = join(__dirname, '../content/campaigns/bryntum-products');

type Params = Record<string, string>;

const isFramework = (framework: string) => FRAMEWORKS.some((known) => known === framework);
const isDocsPage = (pageName: string) => existsSync(join(DOCS_CONTENT_DIR, pageName, 'index.mdoc'));
// `bryntum-scheduler-pro` is rendered from `schedulerpro.json`: the routes hyphenate two slugs.
const isBryntumCampaign = (product: string) =>
    /^bryntum-/.test(product) &&
    existsSync(join(CAMPAIGN_CONTENT_DIR, `${product.replace(/^bryntum-/, '').replaceAll('-', '')}.json`));
const isRecordedSession = (slug: string) =>
    SESSIONS.some((session) => session.youtubeUrl && sessionSlug(session.title) === slug);

/**
 * Which params each dynamic route's getStaticPaths accepts. A dynamic route missing from here never
 * resolves, so a test that starts relying on one fails until its params are described.
 */
const DYNAMIC_ROUTE_PARAMS: Record<string, (params: Params) => boolean> = {
    '[framework]-data-grid/index.astro': ({ framework }) => isFramework(framework),
    '[framework]-data-grid/[pageName].astro': ({ framework, pageName }) =>
        isFramework(framework) && isDocsPage(pageName),
    '[framework]-data-grid/[pageName].md.ts': ({ framework, pageName }) =>
        isFramework(framework) && isDocsPage(pageName),
    '[framework]-data-grid.md.ts': ({ framework }) => FRAMEWORK_LANDING_HUBS.some((hub) => hub === framework),
    'campaigns/[bryntumProduct].astro': ({ bryntumProduct }) => isBryntumCampaign(bryntumProduct),
    'campaigns/[bryntumProduct].md.ts': ({ bryntumProduct }) => isBryntumCampaign(bryntumProduct),
    'session/[slug].astro': ({ slug }) => isRecordedSession(slug),
    'session/[slug].md.ts': ({ slug }) => isRecordedSession(slug),
};

const REST_PARAM = /^\[\.\.\.(\w+)\]$/;
const PARAM = /^\[(\w+)\]$/;

/** The URL path a route file serves, e.g. `about.astro` → `about`, `llms.txt.ts` → `llms.txt`. */
const routePath = (file: string) =>
    file.endsWith('.astro') ? file.replace(/\.astro$/, '').replace(/(^|\/)index$/, '') : file.replace(/\.ts$/, '');

function routePattern(file: string): RegExp {
    const source = routePath(file)
        .split(/(\[(?:\.\.\.)?\w+\])/)
        .map((part) => {
            const rest = REST_PARAM.exec(part);
            const param = PARAM.exec(part);
            if (rest) {
                return `(?<${rest[1]}>.+)`;
            }
            return param ? `(?<${param[1]}>[^/]+)` : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('');
    // Pages are served as directories, so either spelling resolves; endpoints are exact files.
    const trailingSlash = file.endsWith('.astro') && source ? '/?' : '';
    return new RegExp(`^/${source}${trailingSlash}$`);
}

/** Every route file, relative to `src/pages` with `/` separators. */
export const ROUTE_FILES: string[] = readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => /\.(astro|ts)$/.test(file));

const ROUTES = ROUTE_FILES.map((file) => ({ file, pattern: routePattern(file) }));

/** The route file that would emit `pathname`, if any. */
export function resolveRoute(pathname: string): string | undefined {
    return ROUTES.find(({ file, pattern }) => {
        const match = pattern.exec(pathname);
        if (!match) {
            return false;
        }
        return !match.groups || DYNAMIC_ROUTE_PARAMS[file]?.(match.groups) === true;
    })?.file;
}

/** The URL a route file serves, with each `[param]` filled from `samples`. */
export const sampleRoutePath = (file: string, samples: Params) =>
    `/${routePath(file).replace(/\[(\w+)\]/g, (_, name: string) => samples[name] ?? `[${name}]`)}`;
