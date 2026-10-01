import { linkHrefs, metaContents, validJsonLdNodes } from '../core/html';
import { headerAll } from '../core/http';
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
