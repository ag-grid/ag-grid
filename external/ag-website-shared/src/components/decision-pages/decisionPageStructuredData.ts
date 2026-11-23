import {
    type BreadcrumbItem,
    type JsonLdObject,
    buildBreadcrumbList,
    buildFAQPage,
    getSoftwareApplicationId,
    getWebSiteId,
    markdownToPlainText,
} from '@ag-website-shared/utils/structuredData';

import { toIsoDate } from './decisionPageText';
import type { Competitor, DecisionPageFaqItem } from './types';

interface DecisionPageStructuredDataInput {
    canonicalUrlBase: string;
    pageUrl: string;
    title: string;
    description: string;
    lastUpdated: Date;
    breadcrumbs: BreadcrumbItem[];
    /** The page's visible FAQ. `FAQPage` is only emitted when there is one, so markup matches content. */
    faq?: DecisionPageFaqItem[];
    /**
     * The competitor the page compares against, emitted as a mentioned `Thing` identified by its
     * site. Not a `SoftwareApplication`, which Google would read as an incomplete rich result.
     */
    competitor?: Pick<Competitor, 'name' | 'url'>;
}

/**
 * JSON-LD for a purchase-decision page: a `WebPage` about the product's `SoftwareApplication`
 * (emitted site-wide by each Layout, and referenced here by `@id`), its `BreadcrumbList`, and a
 * `FAQPage` when the page renders a FAQ. The site adds its reviewer nodes alongside, which share
 * the `WebPage` `@id` so the two merge into one node.
 */
export function buildDecisionPageStructuredData({
    canonicalUrlBase,
    pageUrl,
    title,
    description,
    lastUpdated,
    breadcrumbs,
    faq = [],
    competitor,
}: DecisionPageStructuredDataInput): JsonLdObject[] {
    const breadcrumbList = buildBreadcrumbList({ pageUrl, items: breadcrumbs });

    const webPage: JsonLdObject = {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description,
        dateModified: toIsoDate(lastUpdated),
        inLanguage: 'en',
        isPartOf: { '@id': getWebSiteId(canonicalUrlBase) },
        about: { '@id': getSoftwareApplicationId(canonicalUrlBase) },
        breadcrumb: { '@id': breadcrumbList['@id'] },
    };
    if (competitor) {
        webPage.mentions = { '@type': 'Thing', name: competitor.name, sameAs: competitor.url };
    }

    const nodes = [webPage, breadcrumbList];
    if (faq.length > 0) {
        nodes.push(
            buildFAQPage({
                pageUrl,
                items: faq.map(({ question, answer }) => ({ question, answer: markdownToPlainText(answer) })),
            })
        );
    }
    return nodes;
}
