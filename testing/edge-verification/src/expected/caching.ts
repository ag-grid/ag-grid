import { type Lifecycle, PENDING } from './lifecycle';

/**
 * A stable URL per caching behaviour, used to prove the behaviour caches (two HEADs, the second
 * must be a cache hit). Hashed asset names change on every deploy, so those are discovered from
 * a page at run time rather than hard-coded.
 */
export interface CacheProbe extends Lifecycle {
    pattern: string;
    path?: string;
    discover?: { page: string; match: RegExp };
}

export const CACHE_PROBES: CacheProbe[] = [
    { pattern: '*/_astro/*', discover: { page: '/charts/', match: /\/charts\/_astro\/[\w.-]+\.css/ } },
    { pattern: '/images/*', path: '/images/moon.svg' },
    { pattern: '/example-assets/*', path: '/example-assets/gold-star.png' },
    { pattern: '/favicon.ico', path: '/favicon.ico' },
    { pattern: '/robots.txt', path: '/robots.txt' },
    { pattern: '/example/*', path: '/example/finance.png' },
    { pattern: '/scripts/*', discover: { page: '/', match: /\/scripts\/[\w.-]+\.js/ } },
    { pattern: '/theme-icons/*', path: '/theme-icons/alpine/aasc.svg' },
    { pattern: '/charts/scripts/*', discover: { page: '/charts/', match: /\/charts\/scripts\/[\w.-]+\.js/ } },
    { pattern: '/studio/scripts/*', discover: { page: '/studio/', match: /\/studio\/scripts\/[\w.-]+\.js/ } },
    {
        pattern: '/studio/images/*',
        discover: { page: '/studio/', match: /\/studio\/images\/[\w./-]+\.(?:png|svg|webp)/ },
    },
    { pattern: '/studio/videos/*', discover: { page: '/studio/', match: /\/studio\/videos\/[\w.-]+\.(?:webm|mp4)/ } },
    { pattern: '/archive/*', path: '/archive/35.0.0/react-data-grid/getting-started/', pending: PENDING.archiveCache },
    { pattern: '/charts/archive/*', path: '/charts/archive/11.2.0/', pending: PENDING.archiveCache },
];

/** Uncached pages that must never come back as a cache hit. */
export const NEVER_CACHED = ['/', '/react-data-grid/getting-started/', '/example/', '/example/index.html'];

/**
 * Pages on non-caching behaviours where a markdown request must not change what the next
 * browser request receives. /example/ and /studio/example/ are the 2026-09 incident's shape.
 */
export const POISON_PROBES = ['/react-data-grid/getting-started/', '/', '/example/', '/studio/example/'];

/** An archive page for the poisoning check once the archive behaviours exist. */
export const ARCHIVE_POISON_PROBE = '/charts/archive/11.2.0/';
