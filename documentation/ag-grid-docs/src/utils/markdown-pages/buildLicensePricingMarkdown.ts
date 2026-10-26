import type { Framework } from '@ag-grid-types';
import {
    BUNDLE_LINE,
    BUYING_ROUTES,
    COMMUNITY,
    CONTACT,
    ECOMMERCE_URLS,
    FAQS_HEADING,
    FEATURES,
    LIBRARY_PRODUCTS,
    type LibraryProduct,
    ONLINE_PURCHASE,
    PRICING_ANCHORS,
    PRICING_FAQS,
    PRICING_HERO,
    STUDIO_PRODUCT,
    STUDIO_TRIAL_PATH,
} from '@ag-website-shared/components/license-pricing/pricingContent';
import chartsFeaturesData from '@ag-website-shared/content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { PRODUCTION_STUDIO_SITE_URL } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import { buildGridFrontmatter } from './gridFrontmatter';

// The page is framework-agnostic; resolve its framework-prefixed doc links against a
// single framework, matching AGENTS.md.ts / llms.txt.ts.
const FRAMEWORK: Framework = 'javascript';

// Feature-matrix JSON shapes (see gridFeaturesMatrix.json / chartsFeaturesMatrix.json).
type FeatureValue = boolean | { value: boolean; detail?: string };
interface FeatureLeaf {
    label: { name: string; link: string };
    community: FeatureValue;
    enterprise: FeatureValue;
    chartsGrid: FeatureValue;
}
interface FeatureSubGroup {
    name: string;
    isSubGroup: true;
    items: FeatureItem[];
}
type FeatureItem = FeatureLeaf | FeatureSubGroup;
interface FeatureSection {
    group: { name: string };
    items: FeatureItem[];
}

function isSubGroup(item: FeatureItem): item is FeatureSubGroup {
    return (item as FeatureSubGroup).isSubGroup === true;
}

/** Flatten HTML fragments (used in plan descriptions / feature details) to plain text. */
function htmlToText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function featureCell(value: FeatureValue): string {
    const included = typeof value === 'object' ? value.value : value;
    const detail = typeof value === 'object' ? value.detail : undefined;
    const mark = included ? '✓' : '✗';
    return detail ? `${mark} (${htmlToText(detail)})` : mark;
}

function featureRow(leaf: FeatureLeaf, siteRoot?: string): string[] {
    // `resolveSharedUrl` turns the `grid:`/`charts:` prefix into the resolved doc URL
    // (absolute in a real build, since GRID_URL/CHARTS_URL carry the origin); toAbsoluteUrl
    // then fills in the origin for any root-relative result.
    const href = toAbsoluteUrl(resolveSharedUrl({ url: leaf.label.link, framework: FRAMEWORK }), siteRoot);
    return [
        `[${leaf.label.name}](${href})`,
        featureCell(leaf.community),
        featureCell(leaf.enterprise),
        featureCell(leaf.chartsGrid),
    ];
}

// Render a list of feature items to markdown: consecutive leaves become one table;
// a subgroup becomes a sub-heading followed by its own items (recursively).
function renderItems(items: FeatureItem[], depth: number, siteRoot?: string): string[] {
    const parts: string[] = [];
    let buffer: string[][] = [];
    const flush = () => {
        if (buffer.length) {
            parts.push(markdownTable(FEATURES.columns, buffer));
            buffer = [];
        }
    };
    for (const item of items) {
        if (isSubGroup(item)) {
            flush();
            parts.push(`${'#'.repeat(Math.min(depth, 6))} ${item.name}`);
            parts.push(...renderItems(item.items, depth + 1, siteRoot));
        } else {
            buffer.push(featureRow(item, siteRoot));
        }
    }
    flush();
    return parts;
}

function renderFeatureMatrix(heading: string, sections: FeatureSection[], siteRoot?: string): string {
    const parts = [`## ${heading}`];
    for (const section of sections) {
        parts.push(`### ${section.group.name}`);
        parts.push(...renderItems(section.items, 4, siteRoot));
    }
    return parts.join('\n\n');
}

function renderProducts(siteRoot?: string): string {
    const contactUrl = toAbsoluteUrl(`/license-pricing/#${PRICING_ANCHORS.contact}`, siteRoot);
    const gettingStartedUrls: Record<LibraryProduct['id'], string> = {
        grid: toAbsoluteUrl(urlWithPrefix({ framework: FRAMEWORK, url: './getting-started/' }), siteRoot),
        charts: chartsUrlWithPrefix({ framework: FRAMEWORK, url: './quick-start' }),
    };
    const libraries = LIBRARY_PRODUCTS.map((product) =>
        [
            `### ${product.name}`,
            product.tagline,
            [
                `- **${product.community.name}** — ${product.community.description}`,
                `- **${product.enterprise.name}** — ${product.enterprise.description}`,
            ].join('\n'),
            `${ONLINE_PURCHASE.limit} ${ONLINE_PURCHASE.otherwise}`,
            `[Get started free](${gettingStartedUrls[product.id]}) · [Buy Enterprise online](${ECOMMERCE_URLS[product.id]}) · [Contact sales](${contactUrl})`,
        ].join('\n\n')
    );
    const studio = [
        `### ${STUDIO_PRODUCT.name}`,
        STUDIO_PRODUCT.tagline,
        `**${STUDIO_PRODUCT.pricing}** ${STUDIO_PRODUCT.description}`,
        `[Contact sales](${contactUrl}) · [Start a 45-day free trial](${PRODUCTION_STUDIO_SITE_URL}${STUDIO_TRIAL_PATH})`,
        STUDIO_PRODUCT.trialNote,
    ].join('\n\n');
    const bundle = [
        `### ${BUNDLE_LINE.heading}`,
        BUNDLE_LINE.body,
        `[Buy the Enterprise Bundle](${ECOMMERCE_URLS.bundle})`,
    ].join('\n\n');

    return ['## Products', ...libraries, studio, bundle].join('\n\n');
}

function renderBuyingRoutes(siteRoot?: string): string {
    const contactUrl = toAbsoluteUrl(`/license-pricing/#${PRICING_ANCHORS.contact}`, siteRoot);
    return [
        `## ${BUYING_ROUTES.online.heading}`,
        BUYING_ROUTES.online.body,
        `[Buy AG Grid](${ECOMMERCE_URLS.grid}) · [Buy AG Charts](${ECOMMERCE_URLS.charts}) · [Buy the bundle](${ECOMMERCE_URLS.bundle})`,
        `## ${BUYING_ROUTES.tailored.heading}`,
        BUYING_ROUTES.tailored.body,
        BUYING_ROUTES.tailored.supporting,
        `[Contact sales](${contactUrl})`,
        `## ${COMMUNITY.heading}`,
        COMMUNITY.body,
        COMMUNITY.studioNote,
    ].join('\n\n');
}

function renderFaqs(): string {
    const faqs = PRICING_FAQS.map(({ question, answer }) => `### ${question}\n\n${answer}`);
    return [`## ${FAQS_HEADING}`, ...faqs].join('\n\n');
}

function renderContact(siteRoot?: string): string {
    const contactUrl = toAbsoluteUrl(`/license-pricing/#${PRICING_ANCHORS.contact}`, siteRoot);
    return [`## ${CONTACT.heading}`, CONTACT.intro, `[Contact sales](${contactUrl})`].join('\n\n');
}

/**
 * Build the markdown twin of the unified /license-pricing/ page: the AG Grid, AG Charts and
 * AG Studio products, buying routes, the Grid and Charts feature-comparison matrices, FAQs and
 * the sales contact link. The page is React-driven with no Markdoc source, so this reads the
 * same data the page renders (pricingContent.ts + the two feature-matrix JSON files) and
 * serialises it directly.
 */
export function buildLicensePricingMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const frontmatter = buildGridFrontmatter({
        pageUrl: '/license-pricing/',
        siteRoot,
        title: 'Pricing',
        description:
            'Pricing for AG Grid, AG Charts and AG Studio: free Community editions, online purchase for small teams, tailored pricing from sales, and a Community vs Enterprise feature comparison.',
    });

    const document = [
        frontmatter,
        `# ${PRICING_HERO.headline}`,
        PRICING_HERO.intro,
        renderProducts(siteRoot),
        renderBuyingRoutes(siteRoot),
        `## ${FEATURES.heading}`,
        FEATURES.intro,
        renderFeatureMatrix('Compare AG Grid features', gridFeaturesData as FeatureSection[], siteRoot),
        renderFeatureMatrix('Compare AG Charts features', chartsFeaturesData as FeatureSection[], siteRoot),
        renderFaqs(),
        renderContact(siteRoot),
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
