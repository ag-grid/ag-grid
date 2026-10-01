import {
    anchorHrefs,
    countTags,
    headings,
    jsonLdNodes,
    linkHrefs,
    metaContents,
    nodesOfType,
    sections,
    stripTags,
} from '../core/html';
import type { Http } from '../core/http';
import { type CheckDef, Problems, fail, info, pass } from '../core/types';
import { FIRST_RUN, NEW_FINDING, PENDING, finding } from '../expected/lifecycle';
import { WWW } from '../expected/redirects';
import {
    DOCS_OFFER,
    FAQ_COUNT,
    HOME_GRAPH_TYPES,
    HOME_H1,
    OLD_BLOG_HREF,
    ORGANIZATION,
    OTHER_FRAMEWORKS,
    PAGES,
    REDIRECTING_HREFS,
    SITE_NAVIGATION,
} from '../expected/seo';

type PageKey = keyof typeof PAGES;

async function page(http: Http, key: PageKey): Promise<string> {
    const res = await http.get(`${WWW}${PAGES[key]}`);
    if (res.status !== 200) {
        throw new Error(`${PAGES[key]} returned ${res.status}`);
    }
    return res.body;
}

/** Defines one check that runs the same assertion on several pages. */
function perPage(
    id: string,
    title: string,
    refs: string[],
    keys: PageKey[],
    assert: (html: string, p: Problems, key: PageKey) => void,
    lifecycle: Pick<CheckDef, 'knownIssue' | 'fixedBy' | 'pending'> = {}
): CheckDef {
    return {
        id: `seo-content.${id}`,
        area: 'seo-content',
        title: `${title} (${keys.map((k) => PAGES[k]).join(', ')})`,
        refs,
        ...lifecycle,
        async run({ http }) {
            const p = new Problems();
            for (const key of keys) {
                const own = new Problems();
                assert(await page(http, key), own, key);
                p.merge(PAGES[key], own);
            }
            return p.outcome();
        },
    };
}

/** Every `offers` value anywhere inside a JSON-LD node (nested nodes included). */
function offersIn(node: unknown): unknown[] {
    if (Array.isArray(node)) {
        return node.flatMap(offersIn);
    }
    if (!node || typeof node !== 'object') {
        return [];
    }
    return Object.entries(node).flatMap(([k, v]) => (k === 'offers' ? [v] : offersIn(v)));
}

/** Drops aria-hidden spans (layout sizers), which carry duplicate text by design. */
const withoutAriaHidden = (html: string): string =>
    html.replace(/<span\b[^>]*aria-hidden="true"[^>]*>[^<]*<\/span>/gi, '');

const oneMain = (html: string, p: Problems) => p.eq('<main> count', countTags(html, 'main'), 1);
const viewport = (html: string, p: Problems) => {
    const v = metaContents(html, 'viewport');
    p.eq('viewport tags', v.length, 1);
    p.check(/initial-scale=1/.test(v[0] ?? ''), `viewport "${v[0]}" lacks initial-scale=1`);
};
const absoluteSocialImages = (html: string, p: Problems) => {
    for (const key of ['og:image', 'twitter:image']) {
        const v = metaContents(html, key);
        p.check(
            v.length === 1 && /^https:\/\/www\.ag-grid\.com\/\S+$/.test(v[0]) && !/\/\/images/.test(v[0]),
            `${key} is ${JSON.stringify(v)}`
        );
    }
};
const noRedirectingHrefs = (html: string, p: Problems) => {
    const internal = anchorHrefs(html).map((h) => h.replace(/^https:\/\/www\.ag-grid\.com/, '').split(/[?#]/)[0]);
    const bad = [...new Set(internal.filter((h) => REDIRECTING_HREFS.includes(h)))];
    p.check(!bad.length, `links to redirecting URLs: ${bad.join(', ')}`);
};
const selfCanonical = (html: string, p: Problems, key: PageKey) => {
    p.eq('canonical', linkHrefs(html, 'canonical'), [`${WWW}${PAGES[key]}`]);
};

export function seoContentChecks(): CheckDef[] {
    return [
        perPage(
            'h1.home',
            'Home: exactly one server-rendered H1, default framework, no <noscript> H1',
            ['SE-41', 'SE-8'],
            ['home'],
            (html, p) => {
                const h1 = headings(withoutAriaHidden(html)).filter((h) => h.level === 1);
                p.eq('H1 count', h1.length, 1);
                p.check(HOME_H1.test(h1[0]?.text ?? ''), `H1 text "${h1[0]?.text}"`);
                const raw = /<h1\b[\s\S]*?<\/h1>/i.exec(html)?.[0] ?? '';
                p.check(!OTHER_FRAMEWORKS.test(stripTags(raw)), 'the H1 HTML contains another framework word');
                p.check(!sections(html, 'noscript').some((n) => /<h1/i.test(n)), '<noscript> contains an <h1>');
            }
        ),
        perPage(
            'h1.charts-home',
            'Charts home: exactly one H1',
            [finding(15), 'ag-charts#8432'],
            ['chartsHome'],
            (html, p) => {
                p.eq('H1 count', headings(html).filter((h) => h.level === 1).length, 1);
            },
            { knownIssue: `${finding(15)} (charts home page has two H1s)`, fixedBy: PENDING.chartsSeo }
        ),
        perPage(
            'headings.no-empty',
            'No empty heading elements in the server HTML',
            ['SE-42', 'SE-8'],
            ['home', 'reactDocs'],
            (html, p) => {
                const empty = headings(html).filter((h) => !h.text);
                p.check(
                    !empty.length,
                    `${empty.length} empty headings (${empty.map((h) => 'h' + h.level).join(', ')})`
                );
            }
        ),
        perPage(
            'json-ld.home-graph',
            'Home JSON-LD: one @graph with Organization, WebSite, SoftwareApplication, SiteNavigationElement, FAQPage',
            ['SE-43', 'SE-47'],
            ['home'],
            (html, p) => {
                const nodes = jsonLdNodes(html);
                p.check(!nodes.some((n) => n['@type'] === 'INVALID_JSON'), 'a JSON-LD block does not parse');
                for (const t of HOME_GRAPH_TYPES) {
                    p.eq(`${t} nodes`, nodesOfType(nodes, t).length, 1);
                }
            }
        ),
        perPage(
            'json-ld.site-navigation',
            'SiteNavigationElement names map to the agreed URLs and belong to #website',
            ['SE-43', 'SE-166'],
            ['home'],
            (html, p) => {
                const nav = nodesOfType(jsonLdNodes(html), 'SiteNavigationElement')[0] as any;
                const pairs = new Map<string, string>((nav?.name ?? []).map((n: string, i: number) => [n, nav.url[i]]));
                for (const [name, url] of Object.entries(SITE_NAVIGATION)) {
                    p.eq(`nav "${name}"`, pairs.get(name), url);
                }
                p.eq('isPartOf', nav?.isPartOf?.['@id'], 'https://www.ag-grid.com/#website');
            }
        ),
        {
            id: 'seo-content.json-ld.site-navigation-resolves',
            area: 'seo-content',
            title: 'Every SiteNavigationElement URL answers 200 directly',
            refs: ['SE-43', 'SE-166'],
            async run({ http }) {
                const nav = nodesOfType(jsonLdNodes(await page(http, 'home')), 'SiteNavigationElement')[0] as any;
                const p = new Problems();
                for (const url of nav?.url ?? []) {
                    const res = await http.head(url);
                    p.check(res.status === 200, `${url}: ${res.status}`);
                }
                return p.outcome(`${(nav?.url ?? []).length} URLs`);
            },
        },
        perPage(
            'json-ld.faq',
            `FAQPage: ${FAQ_COUNT} questions with plain-text answers`,
            ['SE-47'],
            ['home'],
            (html, p) => {
                const faq = nodesOfType(jsonLdNodes(html), 'FAQPage')[0] as any;
                const qs: any[] = faq?.mainEntity ?? [];
                p.eq('questions', qs.length, FAQ_COUNT);
                for (const q of qs) {
                    const a = q.acceptedAnswer?.text ?? '';
                    p.check(q['@type'] === 'Question' && !!a, `"${q.name}" has no acceptedAnswer`);
                    p.check(!/\]\(|\*\*|`/.test(a), `"${q.name}" answer has markdown artefacts`);
                }
            }
        ),
        perPage(
            'json-ld.faq-home-only',
            'FAQPage appears only on the home page',
            ['SE-47'],
            ['reactDocs', 'pricing'],
            (html, p) => {
                p.eq('FAQPage nodes', nodesOfType(jsonLdNodes(html), 'FAQPage').length, 0);
            }
        ),
        perPage(
            'json-ld.organization',
            'Organization node: company facts, founder, identifiers, sameAs (one per page)',
            ['SE-71'],
            ['home', 'about', 'reactDocs'],
            (html, p) => {
                const nodes = jsonLdNodes(html);
                const orgs = nodesOfType(nodes, 'Organization') as any[];
                p.eq('Organization nodes', orgs.length, 1);
                const o = orgs[0] ?? {};
                for (const k of ['@id', 'url', 'name', 'legalName', 'description', 'foundingDate'] as const) {
                    p.eq(k, o[k], ORGANIZATION[k]);
                }
                p.eq('streetAddress', o.address?.streetAddress, ORGANIZATION.streetAddress);
                const ids = Object.fromEntries((o.identifier ?? []).map((i: any) => [i.propertyID, i.value]));
                p.eq('identifiers', ids, ORGANIZATION.identifiers);
                const sameAs: string[] = o.sameAs ?? [];
                for (const url of ORGANIZATION.sameAsMustInclude) {
                    p.check(sameAs.includes(url), `sameAs lacks ${url}`);
                }
                for (const host of ORGANIZATION.sameAsMustIncludeHost) {
                    p.check(
                        sameAs.some((s) => new URL(s).host === host),
                        `sameAs lacks a ${host} entry`
                    );
                }
                for (const re of ORGANIZATION.sameAsMustExclude) {
                    p.check(!sameAs.some((s) => re.test(s)), `sameAs contains ${re}`);
                }
                p.eq(
                    'founder',
                    { type: o.founder?.['@type'], name: o.founder?.name },
                    { type: 'Person', name: ORGANIZATION.founder.name }
                );
                p.check(
                    [o.founder?.sameAs].flat().includes(ORGANIZATION.founder.sameAs),
                    'founder sameAs lacks the Wikidata item'
                );
                p.check(
                    (o.contactPoint ?? []).length > 0 &&
                        (o.contactPoint ?? []).every((c: any) => c.areaServed === ORGANIZATION.contactAreaServed),
                    'contactPoint entries lack areaServed Worldwide'
                );
                const app = nodesOfType(nodes, 'SoftwareApplication')[0] as any;
                p.check(
                    [app?.sameAs].flat().includes(ORGANIZATION.softwareSameAs),
                    'SoftwareApplication sameAs lacks the npm package'
                );
                p.eq('SoftwareApplication publisher', app?.publisher?.['@id'], ORGANIZATION['@id']);
            }
        ),
        perPage(
            'json-ld.docs-offers',
            'Docs SoftwareApplication carries only the Community offer (no priceless Enterprise offer)',
            ['SE-162'],
            ['reactDocs', 'jsDocs'],
            (html, p) => {
                const app = nodesOfType(jsonLdNodes(html), 'SoftwareApplication')[0] as any;
                const offers = [app?.offers ?? []].flat();
                p.eq(
                    'offers',
                    offers.map((o: any) => ({ name: o.name, price: o.price })),
                    [DOCS_OFFER]
                );
            }
        ),
        perPage(
            'json-ld.studio-no-offers',
            'Studio structured data carries no offers at all (AG Studio has no free tier)',
            ['SE-162', 'ag-studio#3087'],
            ['studioHome', 'studioDocs'],
            (html, p) => {
                const nodes = jsonLdNodes(html);
                p.check(nodes.length > 0, 'no JSON-LD');
                const offers = nodes.flatMap((n) => offersIn(n));
                p.check(!offers.length, `offers: ${JSON.stringify(offers)}`);
            },
            { pending: PENDING.studioNoOffers }
        ),
        perPage(
            'json-ld.docs-article',
            'Docs pages: TechArticle for the page and SoftwareSourceCode for its examples',
            ['SE-63', 'SE-193', 'SE-194'],
            ['reactDocs'],
            (html, p, key) => {
                const nodes = jsonLdNodes(html);
                const article = nodesOfType(nodes, 'TechArticle')[0] as any;
                p.eq('TechArticle url', article?.url, `${WWW}${PAGES[key]}`);
                p.check(nodesOfType(nodes, 'SoftwareSourceCode').length > 0, 'no SoftwareSourceCode node');
            }
        ),
        perPage(
            'canonical.self',
            'Self-referencing canonical',
            ['SE-85', 'SE-63'],
            ['home', 'reactDocs', 'chartsDocs', 'studioDocs'],
            selfCanonical
        ),
        perPage(
            'footer.no-headings',
            'Footer column titles are not headings and label their lists',
            ['SE-45', 'SE-8'],
            ['home', 'reactDocs'],
            (html, p) => {
                // Testimonial cards use <footer> for the quote attribution; the site footer is the one
                // whose link lists are labelled by footer-* ids.
                const site = sections(html, 'footer').filter((f) => /aria-labelledby="footer-/.test(f));
                p.eq('site footers', site.length, 1);
                p.check(!site.some((f) => /<h[1-6]\b/i.test(f)), 'heading element inside the site footer');
            }
        ),
        perPage(
            'social-images.absolute',
            'og:image and twitter:image are absolute https URLs',
            ['SE-48', 'SE-8'],
            ['home', 'reactDocs', 'pricing', 'beyondThePrompt'],
            absoluteSocialImages
        ),
        perPage(
            'social-images.absolute-charts',
            'og:image and twitter:image are absolute on charts',
            ['SE-48', finding(15), 'ag-charts#8432'],
            ['chartsHome'],
            absoluteSocialImages,
            { knownIssue: `${finding(15)} (SE-48 PARTIAL: relative on charts)`, fixedBy: PENDING.chartsSeo }
        ),
        perPage(
            'social-images.absolute-studio',
            'og:image and twitter:image are absolute on studio',
            ['SE-48', finding(15), 'ag-studio#3087'],
            ['studioHome'],
            absoluteSocialImages,
            { knownIssue: `${finding(15)} (SE-48 PARTIAL: relative on studio)`, fixedBy: PENDING.studioSeo }
        ),
        {
            id: 'seo-content.social-images.resolve',
            area: 'seo-content',
            title: 'The home og:image loads',
            refs: ['SE-48'],
            async run({ http }) {
                const img = metaContents(await page(http, 'home'), 'og:image')[0];
                const res = await http.head(img);
                return res.status === 200 && /^image\//.test(res.headers.get('content-type')?.[0] ?? '')
                    ? pass(img)
                    : fail(`${img}: ${res.status}`);
            },
        },
        perPage(
            'landmark.main',
            'Exactly one <main> landmark',
            ['SE-49', 'SE-8'],
            ['home', 'jsDocs', 'letsCook', 'powerOfCharts'],
            oneMain
        ),
        perPage(
            'landmark.main-charts',
            'Exactly one <main> landmark on charts',
            ['SE-49', finding(15), 'ag-charts#8432'],
            ['chartsHome', 'chartsDocs'],
            oneMain,
            { knownIssue: `${finding(15)} (SE-49 PARTIAL: no <main> on charts)`, fixedBy: PENDING.chartsSeo }
        ),
        perPage(
            'landmark.main-studio',
            'Exactly one <main> landmark on studio',
            ['SE-49', finding(15), 'ag-studio#3087'],
            ['studioHome', 'studioDocs'],
            oneMain,
            { knownIssue: `${finding(15)} (SE-49 PARTIAL: no <main> on studio)`, fixedBy: PENDING.studioSeo }
        ),
        perPage(
            'viewport',
            'One viewport meta with initial-scale=1',
            ['SE-50', 'SE-8'],
            ['home', 'jsDocs', 'pricing', 'chartsHome'],
            viewport
        ),
        perPage(
            'viewport-studio',
            'One viewport meta with initial-scale=1 on studio',
            ['SE-50', finding(15), 'ag-studio#3087'],
            ['studioHome'],
            viewport,
            {
                knownIssue: `${finding(15)} (SE-50 PARTIAL: studio viewport lacks initial-scale=1)`,
                fixedBy: PENDING.studioSeo,
            }
        ),
        perPage(
            'links.no-redirecting-hrefs',
            'No internal link points at a known redirecting URL',
            ['SE-166', 'SE-60'],
            ['home', 'reactDocs', 'chartsHome'],
            noRedirectingHrefs
        ),
        perPage(
            'links.no-redirecting-hrefs-studio',
            'No internal link points at a known redirecting URL on studio',
            ['SE-166', FIRST_RUN],
            ['studioHome'],
            noRedirectingHrefs,
            {
                knownIssue: NEW_FINDING(
                    'the studio header cookie-settings link is href="/studio#manage_cookies", which 301s'
                ),
            }
        ),
        perPage(
            'links.no-old-blog-host',
            'No link points at blog.ag-grid.com',
            ['SE-113', 'SE-87'],
            ['home', 'reactDocs', 'chartsHome', 'studioHome', 'chartsWhatsNew', 'studioCommunity'],
            (html, p) => {
                const n = html.split(OLD_BLOG_HREF).length - 1;
                p.check(n === 0, `${n} ${OLD_BLOG_HREF}… attributes`);
            }
        ),
        ...['SE-44', 'SE-46'].map((ticket): CheckDef => ({
            id: `seo-content.not-checkable.${ticket}`,
            area: 'seo-content',
            title: `${ticket} needs a real browser (client-rendered DOM) - not checked here`,
            refs: [ticket, finding(15)],
            async run() {
                return info(
                    `${finding(15)}: ${ticket === 'SE-44' ? 'consent banner is client-injected (OneTrust replaced by Enzuzo)' : 'hero grid alt text is client-rendered'}`
                );
            },
        })),
    ];
}
