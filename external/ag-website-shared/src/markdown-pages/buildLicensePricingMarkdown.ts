import type { Framework } from '@ag-grid-types';
import {
    BUNDLE_LINE,
    BUYING_ROUTES,
    COMMUNITY,
    CONTACT,
    ECOMMERCE_URLS,
    ENTERPRISE_TRIAL_PATH,
    FAQS_HEADING,
    FEATURES,
    INTEGRATED_CHARTS_PATH,
    LIBRARY_PRODUCTS,
    type LibraryProduct,
    ONLINE_PURCHASE,
    PRICING_ANCHORS,
    PRICING_FAQS,
    PRICING_HERO,
    PRICING_PAGE,
    STUDIO_PRODUCT,
    STUDIO_TRIAL_PATH,
} from '@ag-website-shared/components/license-pricing/pricingContent';
import chartsFeaturesData from '@ag-website-shared/content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { PRODUCTION_STUDIO_SITE_URL } from '@constants';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from './markdownFrontmatter';

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
    // resolveSharedUrl only yields an absolute URL in a real build, so fill in the origin after.
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
    const trialUrls: Record<LibraryProduct['id'], string> = {
        grid: toAbsoluteUrl(gridUrlWithPrefix({ framework: FRAMEWORK, url: ENTERPRISE_TRIAL_PATH }), siteRoot),
        charts: chartsUrlWithPrefix({ framework: FRAMEWORK, url: ENTERPRISE_TRIAL_PATH }),
    };
    const libraries = LIBRARY_PRODUCTS.map((product) =>
        [
            `### ${product.name}`,
            product.tagline,
            `**${product.enterprise.name}** — ${product.enterprise.description}`,
            `${ONLINE_PURCHASE.limit} ${ONLINE_PURCHASE.otherwise}`,
            `[Contact sales](${contactUrl}) · [Buy Enterprise online](${ECOMMERCE_URLS[product.id]}) · [Start a 30-Day free trial](${trialUrls[product.id]})`,
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
        `**${BUNDLE_LINE.subheading}**`,
        BUNDLE_LINE.body,
        `${BUNDLE_LINE.integratedCharts} [${BUNDLE_LINE.integratedChartsLink}](${toAbsoluteUrl(gridUrlWithPrefix({ framework: FRAMEWORK, url: INTEGRATED_CHARTS_PATH }), siteRoot)})`,
        `[Contact sales](${contactUrl}) · [Buy the Enterprise Bundle online](${ECOMMERCE_URLS.bundle}) · [Start a 30-Day free trial](${trialUrls.grid})`,
    ].join('\n\n');

    return ['## Products', ...libraries, studio, bundle].join('\n\n');
}

function renderBuyingRoutes(siteRoot?: string): string {
    const contactUrl = toAbsoluteUrl(`/license-pricing/#${PRICING_ANCHORS.contact}`, siteRoot);
    return [
        `## ${BUYING_ROUTES.tailored.heading}`,
        BUYING_ROUTES.tailored.body,
        BUYING_ROUTES.tailored.supporting,
        `[Contact sales](${contactUrl})`,
        `## ${BUYING_ROUTES.online.heading}`,
        BUYING_ROUTES.online.body,
        `[Buy AG Grid](${ECOMMERCE_URLS.grid}) · [Buy AG Charts](${ECOMMERCE_URLS.charts}) · [Buy the bundle](${ECOMMERCE_URLS.bundle})`,
    ].join('\n\n');
}

function renderCommunity(siteRoot?: string): string {
    const gridUrl = toAbsoluteUrl(gridUrlWithPrefix({ framework: FRAMEWORK, url: './getting-started/' }), siteRoot);
    const chartsUrl = chartsUrlWithPrefix({ framework: FRAMEWORK, url: './quick-start' });
    return [
        `## ${COMMUNITY.heading}`,
        COMMUNITY.body,
        COMMUNITY.studioNote,
        `[Get started with AG Grid](${gridUrl}) · [Get started with AG Charts](${chartsUrl})`,
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
 * Build the markdown twin of the /license-pricing/ page: buying routes, the AG Grid, AG Charts and
 * AG Studio products, Community, the Grid and Charts feature-comparison matrices, the sales contact
 * link and FAQs. The page is React-driven with no Markdoc source, so this reads the same data the
 * page renders (pricingContent.ts + the two feature-matrix JSON files) and serialises it directly.
 *
 * Product-agnostic: every product site serves the same page and differs only in its frontmatter.
 */
export function buildLicensePricingMarkdown({
    siteRoot,
    siteFrontmatter,
}: {
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
} = {}): string {
    const document = [
        buildMarkdownFrontmatter({
            ...siteFrontmatter,
            title: PRICING_PAGE.title,
            description: PRICING_PAGE.description,
        }),
        `# ${PRICING_HERO.headline}`,
        PRICING_HERO.intro,
        renderBuyingRoutes(siteRoot),
        renderProducts(siteRoot),
        renderCommunity(siteRoot),
        `## ${FEATURES.heading}`,
        FEATURES.intro,
        renderFeatureMatrix('Compare AG Grid features', gridFeaturesData as FeatureSection[], siteRoot),
        renderFeatureMatrix('Compare AG Charts features', chartsFeaturesData as FeatureSection[], siteRoot),
        renderContact(siteRoot),
        renderFaqs(),
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
