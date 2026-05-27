/**
 * Builders for schema.org JSON-LD structured data emitted in the page <head>.
 *
 * Builders return graph-node objects without `@context` — the surrounding
 * `<JsonLd>` component supplies a single `@context` at the top of the emitted
 * `@graph`. Stable `@id` URIs (derived from `canonicalUrlBase`) let nodes
 * reference each other (Organization, WebSite, SoftwareApplication).
 *
 * Shared across AG Grid, AG Charts, and AG Studio. Brand-specific values
 * (organisation name, product name, offers, etc.) are passed in by the caller.
 */

export type JsonLdObject = Record<string, unknown>;

interface OrgInput {
    canonicalUrlBase: string;
    name: string;
    logoUrl: string;
    sameAs: string[];
}

interface WebSiteInput {
    canonicalUrlBase: string;
    name: string;
    description: string;
}

interface SoftwareApplicationInput {
    canonicalUrlBase: string;
    name: string;
    version: string;
    applicationCategory?: string;
    operatingSystem?: string;
    offers?: JsonLdObject[];
}

interface TechArticleInput {
    canonicalUrlBase: string;
    pageUrl: string;
    title: string;
    description: string;
    /**
     * Optional `@id` of the entity this article is about (e.g. a
     * SoftwareApplication emitted elsewhere on the site). When omitted,
     * `about` is not set.
     */
    aboutEntityId?: string;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbListInput {
    pageUrl: string;
    items: BreadcrumbItem[];
}

/**
 * Build an absolute URL by resolving `pathWithFragment` against
 * `canonicalUrlBase`. Robust to a base that does or does not end in `/` —
 * `https://example.com` and `https://example.com/` both produce the same
 * absolute output, which is essential for stable `@id` references and for
 * intra-graph cross-links to resolve.
 */
function resolveUrl(canonicalUrlBase: string, pathWithFragment: string): string {
    return new URL(pathWithFragment, canonicalUrlBase).toString();
}

export const getOrganizationId = (canonicalUrlBase: string): string => resolveUrl(canonicalUrlBase, '/#organization');
export const getWebSiteId = (canonicalUrlBase: string): string => resolveUrl(canonicalUrlBase, '/#website');
export const getSoftwareApplicationId = (canonicalUrlBase: string): string =>
    resolveUrl(canonicalUrlBase, '/#software-application');

const ARTICLE_ID_FRAGMENT = '#article';
const BREADCRUMB_ID_FRAGMENT = '#breadcrumb';

export function buildOrganization({ canonicalUrlBase, name, logoUrl, sameAs }: OrgInput): JsonLdObject {
    return {
        '@type': 'Organization',
        '@id': getOrganizationId(canonicalUrlBase),
        name,
        url: resolveUrl(canonicalUrlBase, '/'),
        logo: logoUrl,
        sameAs,
    };
}

export function buildWebSite({ canonicalUrlBase, name, description }: WebSiteInput): JsonLdObject {
    return {
        '@type': 'WebSite',
        '@id': getWebSiteId(canonicalUrlBase),
        url: resolveUrl(canonicalUrlBase, '/'),
        name,
        description,
        inLanguage: 'en',
        publisher: { '@id': getOrganizationId(canonicalUrlBase) },
    };
}

export function buildSoftwareApplication({
    canonicalUrlBase,
    name,
    version,
    applicationCategory = 'DeveloperApplication',
    operatingSystem = 'Web Browser',
    offers,
}: SoftwareApplicationInput): JsonLdObject {
    const result: JsonLdObject = {
        '@type': 'SoftwareApplication',
        '@id': getSoftwareApplicationId(canonicalUrlBase),
        name,
        applicationCategory,
        operatingSystem,
        softwareVersion: version,
        url: resolveUrl(canonicalUrlBase, '/'),
        publisher: { '@id': getOrganizationId(canonicalUrlBase) },
    };
    if (offers && offers.length > 0) {
        result.offers = offers;
    }
    return result;
}

export function buildTechArticle({
    canonicalUrlBase,
    pageUrl,
    title,
    description,
    aboutEntityId,
}: TechArticleInput): JsonLdObject {
    const result: JsonLdObject = {
        '@type': 'TechArticle',
        '@id': `${pageUrl}${ARTICLE_ID_FRAGMENT}`,
        headline: title,
        description,
        inLanguage: 'en',
        url: pageUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        isPartOf: { '@id': getWebSiteId(canonicalUrlBase) },
        publisher: { '@id': getOrganizationId(canonicalUrlBase) },
    };
    if (aboutEntityId) {
        result.about = { '@id': aboutEntityId };
    }
    return result;
}

export function buildBreadcrumbList({ pageUrl, items }: BreadcrumbListInput): JsonLdObject {
    return {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}${BREADCRUMB_ID_FRAGMENT}`,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Wrap one or more graph-node objects into a single JSON-LD document with a
 * shared `@context`. Multiple nodes are combined under `@graph`; a single node
 * is inlined alongside `@context`.
 */
export function buildJsonLdDocument(nodes: JsonLdObject[]): JsonLdObject {
    if (nodes.length === 1) {
        return { '@context': 'https://schema.org', ...nodes[0] };
    }
    return { '@context': 'https://schema.org', '@graph': nodes };
}

/**
 * Serialise a JSON-LD object for embedding inside <script type="application/ld+json">.
 *
 * Escapes `</` to `<\/` so a stray `</script>` inside any string field cannot
 * close the script tag prematurely. `set:html` does not escape inside script
 * bodies, so the caller must.
 */
export function serializeJsonLd(data: JsonLdObject): string {
    return JSON.stringify(data).replace(/<\//g, '<\\/');
}
