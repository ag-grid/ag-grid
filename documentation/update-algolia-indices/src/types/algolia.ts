export interface AlgoliaRecord {
    source: 'api' | 'docs' | 'campaigns';

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
