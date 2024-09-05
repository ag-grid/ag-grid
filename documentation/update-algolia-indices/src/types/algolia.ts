export interface AlgoliaRecord {
    source: 'api' | 'docs';

    objectID: string;
    title: string;
    heading?: string;
    subHeading?: string;
    text: string;
    breadcrumb: string;
    path: string;
    rank: number;
    metaTag?: string;
    positionInPage?: number;
}
