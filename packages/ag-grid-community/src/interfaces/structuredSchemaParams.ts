export const STRUCTURED_SCHEMA_FEATURES = [
    'aggregation',
    'filter',
    'sort',
    'pivot',
    'columnVisibility',
    'columnSizing',
    'rowGroup',
] as const;

export type StructuredSchemaFeature = (typeof STRUCTURED_SCHEMA_FEATURES)[number];

export type StructuredSchemaColumnParams = {
    description?: string;
    includeSetValues?: boolean;
};

export type StructuredSchemaParams = {
    exclude?: StructuredSchemaFeature[];
    columns?: Record<string, StructuredSchemaColumnParams>;
};
