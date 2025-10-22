export type StructuredSchemaFeature =
    | 'aggregation'
    | 'filter'
    | 'sort'
    | 'pivot'
    | 'columnVisibility'
    | 'columnSizing'
    | 'rowGroup';

export const STRUCTURED_SCHEMA_FEATURES: StructuredSchemaFeature[] = [
    'aggregation',
    'filter',
    'sort',
    'pivot',
    'columnVisibility',
    'columnSizing',
    'rowGroup',
];

export type StructuredSchemaColumnParams = {
    description?: string;
    includeSetValues?: boolean;
};

export type StructuredSchemaParams = {
    exclude?: StructuredSchemaFeature[];
    columns?: Record<string, StructuredSchemaColumnParams>;
};
