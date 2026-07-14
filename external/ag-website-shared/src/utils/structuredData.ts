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

export interface ContactPoint {
    /**
     * schema.org contactType, e.g. `sales` or `technical support`. These line
     * up with the enquiry-type options offered on the contact page.
     */
    contactType: string;
    url?: string;
    telephone?: string;
    email?: string;
    availableLanguage?: string | string[];
}

interface OrgInput {
    canonicalUrlBase: string;
    name: string;
    logoUrl: string;
    sameAs: string[];
    /**
     * Optional points of contact (sales, technical support, etc.). Emitted as
     * a `contactPoint` array on the Organization so any page referencing the
     * Organization by `@id` (e.g. the ContactPage) inherits them.
     */
    contactPoints?: ContactPoint[];
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

export interface FaqItem {
    question: string;
    answer: string;
}

interface FAQPageInput {
    pageUrl: string;
    items: FaqItem[];
}

export interface SiteNavigationItem {
    name: string;
    url: string;
}

interface SiteNavigationElementInput {
    canonicalUrlBase: string;
    items: SiteNavigationItem[];
}

interface ContactPageInput {
    canonicalUrlBase: string;
    pageUrl: string;
    name: string;
}

/**
 * Return `canonicalUrlBase` with a trailing slash, so callers can append a
 * site-root-relative path or fragment without worrying about the input form
 * or doubled slashes. Works for both host-level bases (`https://example.com`)
 * and subpath bases (`https://example.com/charts`) — both produce the same
 * output as their trailing-slash equivalents.
 *
 * `new URL('/x', base)` is NOT a safe substitute for subpath bases — the
 * absolute path resolves against the host and discards the subpath segment.
 */
export function siteRootUrl(canonicalUrlBase: string): string {
    return canonicalUrlBase.endsWith('/') ? canonicalUrlBase : `${canonicalUrlBase}/`;
}

export const getOrganizationId = (canonicalUrlBase: string): string => `${siteRootUrl(canonicalUrlBase)}#organization`;
export const getWebSiteId = (canonicalUrlBase: string): string => `${siteRootUrl(canonicalUrlBase)}#website`;
export const getSoftwareApplicationId = (canonicalUrlBase: string): string =>
    `${siteRootUrl(canonicalUrlBase)}#software-application`;
export const getSiteNavigationElementId = (canonicalUrlBase: string): string =>
    `${siteRootUrl(canonicalUrlBase)}#site-navigation`;

const ARTICLE_ID_FRAGMENT = '#article';
const BREADCRUMB_ID_FRAGMENT = '#breadcrumb';
const FAQ_ID_FRAGMENT = '#faq';
const CONTACT_PAGE_ID_FRAGMENT = '#contact-page';

export function buildOrganization({ canonicalUrlBase, name, logoUrl, sameAs, contactPoints }: OrgInput): JsonLdObject {
    const result: JsonLdObject = {
        '@type': 'Organization',
        '@id': getOrganizationId(canonicalUrlBase),
        name,
        url: siteRootUrl(canonicalUrlBase),
        logo: logoUrl,
        sameAs,
    };
    if (contactPoints && contactPoints.length > 0) {
        result.contactPoint = contactPoints.map((point) => ({ '@type': 'ContactPoint', ...point }));
    }
    return result;
}

export function buildWebSite({ canonicalUrlBase, name, description }: WebSiteInput): JsonLdObject {
    return {
        '@type': 'WebSite',
        '@id': getWebSiteId(canonicalUrlBase),
        url: siteRootUrl(canonicalUrlBase),
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
        url: siteRootUrl(canonicalUrlBase),
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
 * Build a `FAQPage` node from question/answer pairs. Answers should be plain
 * text (strip any markdown before passing them in) — schema.org allows limited
 * HTML, but the surrounding `serializeJsonLd` does not expect markdown markup.
 */
export function buildFAQPage({ pageUrl, items }: FAQPageInput): JsonLdObject {
    return {
        '@type': 'FAQPage',
        '@id': `${pageUrl}${FAQ_ID_FRAGMENT}`,
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };
}

/**
 * Build a `SiteNavigationElement` node describing the site's primary navigation.
 * Names and URLs are emitted as parallel arrays (a valid, compact schema.org
 * form) and the node references the `WebSite` it belongs to. URLs should be
 * absolute and canonical so crawlers resolve them without the framework prefix.
 */
export function buildSiteNavigationElement({ canonicalUrlBase, items }: SiteNavigationElementInput): JsonLdObject {
    return {
        '@type': 'SiteNavigationElement',
        '@id': getSiteNavigationElementId(canonicalUrlBase),
        name: items.map((item) => item.name),
        url: items.map((item) => item.url),
        isPartOf: { '@id': getWebSiteId(canonicalUrlBase) },
    };
}

/**
 * Build a `ContactPage` node for the contact page. `mainEntity` references the
 * `Organization` by `@id` rather than duplicating it, so the contact points
 * emitted on the Organization (see `buildOrganization`) describe this page.
 */
export function buildContactPage({ canonicalUrlBase, pageUrl, name }: ContactPageInput): JsonLdObject {
    return {
        '@type': 'ContactPage',
        '@id': `${pageUrl}${CONTACT_PAGE_ID_FRAGMENT}`,
        url: pageUrl,
        name,
        isPartOf: { '@id': getWebSiteId(canonicalUrlBase) },
        mainEntity: { '@id': getOrganizationId(canonicalUrlBase) },
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
