import { PENDING, finding } from './lifecycle';

/**
 * grid#15430: scripts/migrate-archive-htaccess.mjs, run on each web host by
 * scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh, patches the .htaccess of
 * every already-deployed archive. Expectations derived from the script and its
 * __fixtures__/deployed-archives (regenerated from the grid 36.x, charts 14.x and studio 2.x/3.0
 * release tags):
 *
 * - every site: one block straight after the first `RewriteEngine On` 301s each alias host to the
 *   SAME archive URL on www (`https://www.ag-grid.com%{REQUEST_URI}`, so the full path and the query
 *   string are kept). It does not add a trailing slash: a slash-less URL still takes the archive's
 *   own add-slash afterwards, so only slashed URLs are one hop.
 * - grid: removes every rule that leaves the archive (the prefix-dropping host and index.php rules,
 *   the single-hop rewrites such as react-data-grid/whats-new, live-URL redirects such as
 *   sitemap.xml); those URLs now 404 inside the archive, or take an in-archive redirect.
 * - grid archives with markdown twins (36.1.0, 36.2.0): negotiation on Accept: text/markdown under
 *   the archive base, plus Vary: Accept on the HTML.
 * - --apply keeps the previous file as `.htaccess.bak-<timestamp>` beside it, which Apache's
 *   `.ht*` rule must keep from being served.
 *
 * Both web hosts carry their own copy of every archive and CloudFront spreads requests across them,
 * so a run after only one host is migrated gives mixed results: verify after both.
 */
export interface MigratedSite {
    site: 'grid' | 'charts' | 'studio';
    /** The archive's public base path, no trailing slash. */
    base: (version: string) => string;
    /** Every version the migration patches (lowest first); the default run samples the first and last. */
    versions: string[];
    /** A page below the base that every listed version serves (blank: the archive root). */
    page: string;
    /** Versions whose archive serves markdown twins, which the migration negotiates. */
    markdown?: string[];
    /** Grid rules that send a request out of the archive today, per version ('*' = every version). */
    leaks?: Record<string, string[]>;
}

export const MIGRATED_SITES: MigratedSite[] = [
    {
        site: 'grid',
        base: (v) => `/archive/${v}`,
        versions: ['36.0.0', '36.0.1', '36.0.2', '36.1.0', '36.2.0'],
        page: 'react-data-grid/getting-started/',
        markdown: ['36.1.0', '36.2.0'],
        leaks: {
            // `RewriteRule ^index\.php$ / [R=301,L]` (every 36.x fixture) sends it to the live root.
            '*': ['index.php'],
            // 36.2.0 fixture: the single-hop `^/?react-data-grid/whats-new$` rewrite to the live
            // /whats-new/, and `Redirect 301 /archive/36.2.0/sitemap.xml .../sitemap-index.xml`.
            '36.2.0': ['react-data-grid/whats-new', 'sitemap.xml'],
        },
    },
    {
        site: 'charts',
        base: (v) => `/charts/archive/${v}`,
        versions: ['14.0.0', '14.0.2', '14.1.0', '14.2.0'],
        page: 'react/quick-start/',
    },
    {
        site: 'studio',
        base: (v) => `/studio/archive/${v}`,
        versions: ['2.0.0', '2.0.1', '2.1.0', '2.1.2', '3.0.0'],
        page: '',
    },
];

/**
 * The alias hosts the migration block canonicalises that CloudFront serves (angulargrid.com and
 * www.angulargrid.com are in the block but not in DNS). The lowest version is asked on the apex and
 * the highest on blog.: some charts 14.2.0 rules already send the apex to www, but no archive sends
 * blog. anywhere today, so the highest version cannot pass before the migration.
 */
export const MIGRATION_HOSTS = {
    lowest: 'ag-grid.com',
    highest: 'blog.ag-grid.com',
    others: [
        'angular-grid.ag-grid.com',
        'javascript-grid.ag-grid.com',
        'react-grid.ag-grid.com',
        'angulargrid.ag-grid.com',
    ],
};

export const MIGRATION_QUERY = '?utm_source=edge-check';
/** A backup name the patcher's `.htaccess.bak-<timestamp>` pattern covers. */
export const BACKUP_NAME = '.htaccess.bak-20261001000000';

export const MIGRATION_REFS = ['grid#15430', finding(3), finding(20)];
export const MIGRATION_PENDING = PENDING.archiveMigration;
