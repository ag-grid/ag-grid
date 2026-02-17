export interface AlgoliaRecord {
    source: 'api' | 'docs';

    objectID: string;
    title: string;
    heading?: string;
    subHeading?: string;
    text: string;
    codeWords?: string[];
    breadcrumb: string;
    path: string;
    rank: number;
    positionInPage?: number;
}
