import type { EditionFeatureGroup, FeatureCell, FeatureGroup } from './types';

/**
 * A two-column feature table, as `FeatureMatrix` and its markdown twin render it: the product against
 * a competitor, or the product's Community edition against its Enterprise edition. The first column
 * carries the brand highlight.
 */
export interface FeatureMatrixGroup {
    name: string;
    rows: Array<{
        feature: string;
        docsUrl?: string;
        cells: [FeatureCell, FeatureCell];
    }>;
}

export const competitorFeatureMatrix = (groups: FeatureGroup[]): FeatureMatrixGroup[] =>
    groups.map(({ name, rows }) => ({
        name,
        rows: rows.map(({ feature, docsUrl, product, competitor }) => ({
            feature,
            docsUrl,
            cells: [product, competitor],
        })),
    }));

export const editionFeatureMatrix = (groups: EditionFeatureGroup[]): FeatureMatrixGroup[] =>
    groups.map(({ name, rows }) => ({
        name,
        rows: rows.map(({ feature, docsUrl, community, enterprise }) => ({
            feature,
            docsUrl,
            cells: [community, enterprise],
        })),
    }));
