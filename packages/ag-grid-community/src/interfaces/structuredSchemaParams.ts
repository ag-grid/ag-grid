export type StructuredSchemaFeature =
    | 'aggregation'
    | 'showValuesAs'
    | 'filter'
    | 'sort'
    | 'pivot'
    | 'columnVisibility'
    | 'columnSizing'
    | 'rowGroup'
    | 'columnGroup'
    | 'pagination'
    | 'sideBar'
    | 'focusedCell'
    | 'cellSelection'
    | 'rowSelection'
    | 'rowPinning'
    | 'rowGroupExpansion'
    | 'ssrmRowGroupExpansion';

export const STRUCTURED_SCHEMA_FEATURES: StructuredSchemaFeature[] = [
    'aggregation',
    'showValuesAs',
    'filter',
    'sort',
    'pivot',
    'columnVisibility',
    'columnSizing',
    'rowGroup',
    'columnGroup',
    'pagination',
    'sideBar',
    'focusedCell',
    'cellSelection',
    'rowSelection',
    'rowPinning',
    'rowGroupExpansion',
    'ssrmRowGroupExpansion',
];

export type StructuredSchemaColumnParams = {
    description?: string;
    includeSetValues?: boolean;
};

export type StructuredSchemaParams = {
    exclude?: StructuredSchemaFeature[];
    columns?: Record<string, StructuredSchemaColumnParams>;
};
