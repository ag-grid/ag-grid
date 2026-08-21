import type { Framework } from '@ag-grid-types';
import { DEV_LICENSE_DATA } from '@ag-website-shared/components/license-pricing/licenseData';
import { YOUTUBE_LICENSE_PRICING_URL, ZENDESK_URL } from '@ag-website-shared/constants';
import chartsFeaturesData from '@ag-website-shared/content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

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

const FEATURE_HEADERS = ['Feature', 'Community', 'Enterprise', 'Bundle'];

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
            parts.push(markdownTable(FEATURE_HEADERS, buffer));
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

function renderPlans(siteRoot?: string): string {
    const rows = DEV_LICENSE_DATA.map((plan) => {
        const suffix = plan.description ? ` (${htmlToText(plan.description)})` : '';
        // Quoted plans carry no price, and their buy link is an anchor on the pricing page itself,
        // which is no use once the markdown is read out of context — resolve it to the page.
        const isQuoted = !plan.priceFullDollars;
        const price = isQuoted
            ? 'Contact us'
            : plan.priceFullDollars === '0'
              ? 'Free'
              : `$${plan.priceFullDollars} USD per developer`;
        const cta = isQuoted ? 'Contact us' : plan.id === 'community' ? 'Get started' : 'Buy now';
        const buyLink = toAbsoluteUrl(isQuoted ? `/license-pricing/${plan.buyLink}` : plan.buyLink, siteRoot);
        return [`${plan.subHeading}${suffix}`, price, `[${cta}](${buyLink})`];
    });
    return `## Plans\n\n${markdownTable(['Plan', 'Price', 'Buy'], rows)}`;
}

function renderTrial(siteRoot?: string): string {
    const trialUrl = toAbsoluteUrl(
        urlWithPrefix({
            framework: FRAMEWORK,
            url: './community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence',
        }),
        siteRoot
    );
    const licenceInstallUrl = toAbsoluteUrl(
        urlWithPrefix({ framework: FRAMEWORK, url: './license-install/' }),
        siteRoot
    );
    return [
        '## 30-Day Enterprise Bundle Trial',
        'Explore the full enterprise capabilities of AG Grid and AG Charts with a free 30-day trial licence — no restrictions, no watermarks.',
        [
            '- **Full enterprise features** — access all advanced grid and charts features without console warnings or watermarks.',
            '- **30 days of access** — enough time to evaluate integration, performance, and fit.',
            `- **Engineering support** — direct assistance from our developers via [Zendesk](${ZENDESK_URL}) throughout your trial.`,
        ].join('\n'),
        `[Get a trial licence](${trialUrl})`,
        `Already have a licence? See [Installing Your Licence Key](${licenceInstallUrl}).`,
        `Not sure which licence you need? [Watch our short explainer video](${YOUTUBE_LICENSE_PRICING_URL}).`,
    ].join('\n\n');
}

/**
 * Build the markdown twin of the /license-pricing/ page: plans & prices, the Grid and
 * Charts feature-comparison matrices, and the trial / licence-install links. The page
 * is React-driven with no Markdoc source, so this reads the same data the page renders
 * (DEV_LICENSE_DATA + the two feature-matrix JSON files) and serialises it directly.
 */
export function buildLicensePricingMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const frontmatter = [
        '---',
        'title: "Licence & Pricing"',
        'description: "AG Grid and AG Charts licence plans, prices, and a full Community vs Enterprise vs Bundle feature comparison."',
        '---',
    ].join('\n');

    const document = [
        frontmatter,
        '# Licence & Pricing',
        'Licence plans and prices for AG Grid and AG Charts, with a full feature comparison across Community, Enterprise, and the Enterprise Bundle. Prices are per developer.',
        renderPlans(siteRoot),
        renderFeatureMatrix('Feature Comparison — AG Grid', gridFeaturesData as FeatureSection[], siteRoot),
        renderFeatureMatrix('Feature Comparison — AG Charts', chartsFeaturesData as FeatureSection[], siteRoot),
        renderTrial(siteRoot),
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
