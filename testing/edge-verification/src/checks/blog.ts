import { anchorHrefs, linkHrefs, metaContents, nodesOfType, validJsonLdNodes } from '../core/html';
import { type Http, describeChain, header, headerAll } from '../core/http';
import { type CheckDef, Problems, budgeted } from '../core/types';
import { expectHeader, expectSecurityHeaders, isNoindexed } from './headers';

const BLOG = 'https://www.ag-grid.com/blog';

/** SE-85 QA (2026-09-28): pre-move dates that must survive. */
const LASTMOD = {
    'whats-new-in-ag-grid-35-3': '2026-05-13',
    'react-get-started-with-react-grid-in-5-minutes': '2021-10-04',
};
const REMOVED_POST = 'testing-ag-grid-react-jest-enzyme';
const MIGRATION_DAY = '2026-08-21';
const BLOG_SITEMAPS = ['sitemap-posts.xml', 'sitemap-pages.xml', 'sitemap-authors.xml'];
/** SE-199 (grid#15392): every tag page is noindex, so the tag sitemap is deliberately not listed. */
const UNLISTED_BLOG_SITEMAPS = ['sitemap-tags.xml'];

/** SE-188: legacy /blog/ paths the Ghost vhost answers itself, as observed live on 2026-10-02. */
const LEGACY_EXTRA: Array<{ path: string; status: number; to?: string; hops?: number }> = [
    { path: '/community', status: 301, to: 'https://www.ag-grid.com/community', hops: 2 },
    { path: '/react-data-grid', status: 301, to: 'https://www.ag-grid.com/react-data-grid', hops: 2 },
    { path: '/grid/add-delete-rows-context-menu/js/', status: 410 },
    { path: '/charts/ag-charts-13-release-demos/high-frequency-multi-series/', status: 410 },
    {
        path: '/charts/optimsing-javascript-charts-with-m4-algorithm/javascript/v10-v11-performance-comparison/index.html',
        status: 410,
    },
];

/** SE-40: blog page types beyond the home page and a post, each with its own security headers. */
const PAGE_TYPES = ['/tag/angular/', '/author/sean/', '/page/2/'];

/** SE-87: the post whose in-body links must reach their target directly. */
const SE87_POST = 'keeping-up-to-date-with-javascript-libraries';

/** SE-164: the hooks post, whose dead build.ag-grid.com / reactui links were replaced. */
const HOOKS_POST = 'how-to-optimize-a-react-application-using-hooks-and-ag-grid';

/** The www.ag-grid.com links in a fragment, absolute, de-duplicated, without anchors. */
function siteLinks(html: string, base: string): string[] {
    const urls = anchorHrefs(html)
        .filter((h) => !h.startsWith('#'))
        .map((h) => new URL(h.replace(/&amp;/g, '&'), base))
        .filter((u) => u.host === 'www.ag-grid.com')
        .map((u) => u.href.split('#')[0]);
    return [...new Set(urls)];
}

/** HEADs each URL: it must answer 200 itself, not through a redirect. */
async function answerDirectly(http: Http, p: Problems, urls: string[]): Promise<void> {
    p.check(urls.length > 0, 'no links to check');
    for (const url of urls) {
        const res = await http.head(url);
        p.check(res.status === 200, `${url}: ${res.status} ${header(res, 'location') ?? ''}`.trim());
    }
}

/** The body of a Ghost post: from its content block to the end of the article. */
const postBody = (html: string): string => {
    const start = html.indexOf('<div class="post-content"');
    if (start < 0) {
        return '';
    }
    const end = html.indexOf('</article>', start);
    return html.slice(start, end < 0 ? undefined : end);
};

export function blogChecks(): CheckDef[] {
    return [
        {
            id: 'blog.home',
            area: 'blog',
            title: '/blog/ renders the blog: one CSP (enforcing), one Referrer- and Permissions-Policy, no X-Robots-Tag, analytics tag',
            refs: ['SE-88', 'SE-93', 'SE-40', 'SE-90'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/`);
                const p = new Problems();
                p.eq('status', res.status, 200);
                expectSecurityHeaders(p, res);
                expectHeader(p, res, 'content-security-policy-report-only', null);
                expectHeader(p, res, 'x-robots-tag', null);
                p.check(/plausible|googletagmanager|gtag\(/.test(res.body), 'no analytics tag');
                p.check(
                    (res.body.match(/href="https:\/\/www\.ag-grid\.com\/blog\/[\w-]+\/"/g) ?? []).length > 3,
                    'no post links'
                );
                return p.outcome();
            },
        },
        {
            id: 'blog.post',
            area: 'blog',
            title: 'A migrated post: 200, self-canonical on www/blog, JSON-LD, not noindexed',
            refs: ['SE-85', 'SE-88', 'SE-90', 'SE-94'],
            async run({ http }) {
                const url = `${BLOG}/whats-new-in-ag-grid-36-1/`;
                const res = await http.get(url);
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.eq('canonical', linkHrefs(res.body, 'canonical'), [url]);
                p.check(validJsonLdNodes(res.body, (m) => p.add(m)).length > 0, 'no valid JSON-LD');
                p.check(!isNoindexed(res), 'post is noindexed');
                expectSecurityHeaders(p, res);
                return p.outcome();
            },
        },
        {
            id: 'blog.post-links',
            area: 'blog',
            title: 'Post bodies link /blog/, never blog.ag-grid.com',
            refs: ['SE-87', 'SE-113'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/keeping-up-to-date-with-javascript-libraries/`);
                const p = new Problems();
                p.eq('status', res.status, 200);
                const n = res.body.split('href="https://blog.ag-grid.com').length - 1;
                p.check(n === 0, `${n} links to blog.ag-grid.com`);
                return p.outcome();
            },
        },
        {
            id: 'blog.tag-noindex',
            area: 'blog',
            title: 'Framework tag pages stay noindexed by <meta name="robots">, not robots.txt',
            refs: ['SE-89', 'SE-94'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/tag/angular/`);
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.check(
                    metaContents(res.body, 'robots').some((v) => /noindex/.test(v)),
                    'no <meta name="robots" content="noindex">'
                );
                return p.outcome();
            },
        },
        {
            id: 'blog.pages',
            area: 'blog',
            title: 'Pagination, author and static pages resolve under /blog/',
            refs: ['SE-88', 'SE-91'],
            run: budgeted(async ({ http }, p) => {
                for (const path of ['/page/2/', '/author/sean/', '/newsletter/']) {
                    const res = await http.head(`${BLOG}${path}`);
                    p.check(res.status === 200, `${path}: ${res.status}`);
                }
                return p.outcome();
            }),
        },
        {
            id: 'blog.redirects.legacy-extra',
            area: 'blog',
            title: 'Legacy /blog/ paths: main-site sections 301 out, removed demos are 410',
            refs: ['SE-188'],
            run: budgeted(async ({ http }, p) => {
                for (const row of LEGACY_EXTRA) {
                    const url = `${BLOG}${row.path}`;
                    const chain = await http.follow(url, { maxHops: row.hops ?? 0 });
                    const first = chain[0];
                    const last = chain[chain.length - 1];
                    p.check(first.status === row.status, `${row.path}: ${describeChain(chain)}`);
                    if (row.to) {
                        p.eq(`${row.path} Location`, header(first, 'location'), row.to);
                        p.check(
                            chain.length - 1 === row.hops && last.status === 200,
                            `${row.path}: ${describeChain(chain)}, expected ${row.hops} hops to a 200`
                        );
                    }
                }
                return p.outcome(`${LEGACY_EXTRA.length} paths`);
            }),
        },
        {
            id: 'blog.headers.page-types',
            area: 'blog',
            title: 'Tag, author and paginated pages: one blog CSP (no sha256 hashes), Referrer- and Permissions-Policy, no X-Robots-Tag',
            refs: ['SE-40', 'SE-93'],
            run: budgeted(async ({ http }, p) => {
                for (const path of PAGE_TYPES) {
                    const res = await http.get(`${BLOG}${path}`);
                    const own = new Problems();
                    own.eq('status', res.status, 200);
                    expectSecurityHeaders(own, res);
                    own.check(
                        !headerAll(res, 'content-security-policy').some((v) => v.includes('sha256-')),
                        'CSP carries sha256 hashes (the main-site policy, not the blog one)'
                    );
                    expectHeader(own, res, 'x-robots-tag', null);
                    p.merge(path, own);
                }
                return p.outcome();
            }),
        },
        {
            id: 'blog.post-links.resolve-direct',
            area: 'blog',
            title: 'The www.ag-grid.com links in a migrated post body answer 200 without a redirect',
            refs: ['SE-87'],
            run: budgeted(async ({ http }, p) => {
                const url = `${BLOG}/${SE87_POST}/`;
                const res = await http.get(url);
                p.eq('status', res.status, 200);
                const links = siteLinks(postBody(res.body), url);
                await answerDirectly(http, p, links);
                return p.outcome(`${links.length} links`);
            }),
        },
        {
            id: 'blog.post-links.hooks-getting-started',
            area: 'blog',
            title: 'The hooks post links the React getting-started page, not build.ag-grid.com or reactui',
            refs: ['SE-164'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/${HOOKS_POST}/`);
                const p = new Problems();
                p.eq('status', res.status, 200);
                const body = postBody(res.body);
                p.check(body.length > 0, 'no post body found');
                p.check(!/build\.ag-grid\.com/.test(body), 'links build.ag-grid.com');
                p.check(!/reactui/.test(body), 'links reactui');
                p.check(
                    siteLinks(body, `${BLOG}/`).includes('https://www.ag-grid.com/react-data-grid/getting-started/'),
                    'no link to /react-data-grid/getting-started/'
                );
                return p.outcome();
            },
        },
        {
            id: 'blog.footer-links-final',
            area: 'blog',
            title: 'Every www.ag-grid.com link in the blog footer answers 200 without a redirect',
            refs: ['SE-166'],
            run: budgeted(async ({ http }, p) => {
                const res = await http.get(`${BLOG}/`);
                const footer = [...res.body.matchAll(/<footer class="site-footer"[^>]*>([\s\S]*?)<\/footer>/g)];
                p.eq('site footers', footer.length, 1);
                const links = siteLinks(footer[0]?.[1] ?? '', `${BLOG}/`);
                await answerDirectly(http, p, links);
                return p.outcome(`${links.length} links`);
            }),
        },
        {
            id: 'blog.features-markup',
            area: 'blog',
            title: 'Blog features after the move: WebSite / Article JSON-LD, search, the newsletter form, analytics',
            refs: ['SE-90'],
            run: budgeted(async ({ http }, p) => {
                for (const [path, type, newsletter] of [
                    ['/', 'WebSite', false],
                    [`/${SE87_POST}/`, 'Article', true],
                ] as const) {
                    const res = await http.get(`${BLOG}${path}`);
                    const own = new Problems();
                    own.eq('status', res.status, 200);
                    const nodes = validJsonLdNodes(res.body, (m) => own.add(m));
                    own.eq(`${type} nodes`, nodesOfType(nodes, type).length, 1);
                    own.check(/sodo-search/.test(res.body), 'no sodo-search (Ghost search)');
                    own.check(/plausible|googletagmanager|gtag\(/.test(res.body), 'no analytics tag');
                    if (newsletter) {
                        own.check(/list-manage\.com/.test(res.body), 'no Mailchimp newsletter form');
                    }
                    p.merge(path, own);
                }
                return p.outcome();
            }),
        },
        {
            id: 'blog.post-published-date',
            area: 'blog',
            title: 'Migrated posts keep their original publication date, not the migration day',
            refs: ['SE-85'],
            run: budgeted(async ({ http }, p) => {
                for (const [slug, lastmod] of Object.entries(LASTMOD)) {
                    const res = await http.get(`${BLOG}/${slug}/`);
                    const published = metaContents(res.body, 'article:published_time')[0] ?? '';
                    p.check(
                        /^\d{4}-\d{2}-\d{2}/.test(published) &&
                            published.slice(0, 10) < MIGRATION_DAY &&
                            published.slice(0, 10) <= lastmod,
                        `${slug}: article:published_time "${published}", expected before ${MIGRATION_DAY} and no later than its lastmod ${lastmod}`
                    );
                }
                return p.outcome();
            }),
        },
        {
            id: 'blog.404',
            area: 'blog',
            title: 'Blog 404: one CSP on the error page too',
            refs: ['SE-40'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/no-such-post-xyz/`);
                const p = new Problems();
                p.eq('status', res.status, 404);
                p.eq('CSP copies', headerAll(res, 'content-security-policy').length, 1);
                return p.outcome();
            },
        },
        {
            id: 'blog.rss',
            area: 'blog',
            title: 'RSS feed: items whose links are on www.ag-grid.com/blog/',
            refs: ['SE-90', 'SE-88'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/rss/`);
                const links = [...res.body.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1].trim());
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.check(/<item>/.test(res.body), 'no <item>');
                const off = links.filter((l) => !l.startsWith(`${BLOG}/`) && l !== `${BLOG}/`);
                p.check(!off.length, `links off /blog/: ${off.slice(0, 3).join(', ')}`);
                return p.outcome(`${links.length} links`);
            },
        },
        {
            id: 'blog.sitemap-index',
            area: 'blog',
            title: 'sitemap-index.xml lists the posts, pages and authors blog sitemaps, and not the noindexed tags one',
            refs: ['SE-85', 'SE-186', 'SE-199'],
            async run({ http }) {
                const res = await http.get('https://www.ag-grid.com/sitemap-index.xml');
                const p = new Problems();
                for (const s of BLOG_SITEMAPS) {
                    p.check(res.body.includes(`${BLOG}/${s}`), `missing ${BLOG}/${s}`);
                }
                for (const s of UNLISTED_BLOG_SITEMAPS) {
                    p.check(!res.body.includes(`${BLOG}/${s}`), `lists ${BLOG}/${s}, whose pages are all noindex`);
                }
                return p.outcome();
            },
        },
        {
            id: 'blog.sitemap-posts',
            area: 'blog',
            title: 'Posts sitemap: only /blog/ URLs, removed posts gone, pre-move lastmod dates kept',
            refs: ['SE-85', 'SE-94'],
            async run({ http }) {
                const res = await http.get(`${BLOG}/sitemap-posts.xml`);
                const locs = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
                const p = new Problems();
                p.eq('status', res.status, 200);
                const off = locs.filter((l) => !l.startsWith(`${BLOG}/`));
                p.check(!off.length, `${off.length} URLs outside /blog/`);
                p.check(!res.body.includes(REMOVED_POST), `still lists the removed post ${REMOVED_POST}`);
                p.check(
                    !res.body.includes(`<lastmod>${MIGRATION_DAY}`),
                    `lastmod ${MIGRATION_DAY} (migration day) present`
                );
                for (const [slug, date] of Object.entries(LASTMOD)) {
                    const m = new RegExp(`<loc>${BLOG}/${slug}/</loc>\\s*<lastmod>([^<]+)</lastmod>`).exec(res.body);
                    p.check(!!m && m[1].startsWith(date), `${slug} lastmod ${m?.[1]}, expected ${date}`);
                }
                return p.outcome(`${locs.length} posts`);
            },
        },
    ];
}
