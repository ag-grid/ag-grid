import type { BeanCollection, StructuredSchemaFeature, StructuredSchemaParams } from 'ag-grid-community';
import { STRUCTURED_SCHEMA_FEATURES } from 'ag-grid-community';

import { buildAggregationFeatureSchema } from './features/aggregationFeatureSchema';
import { buildColumnGroupFeatureSchema } from './features/columnGroupFeatureSchema';
import { buildColumnSizingFeatureSchema } from './features/columnSizingFeatureSchema';
import { buildColumnVisibilityFeatureSchema } from './features/columnVisibilityFeatureSchema';
import { buildFilterFeatureSchema } from './features/filterFeatureSchema';
import { buildFocusedCellFeatureSchema } from './features/focusedCellFeatureSchema';
import { buildPaginationFeatureSchema } from './features/paginationFeatureSchema';
import { buildPivotFeatureSchema } from './features/pivotFeatureSchema';
import { buildRowGroupFeatureSchema } from './features/rowGroupFeatureSchema';
import { buildShowValuesAsFeatureSchema } from './features/showValuesAsFeatureSchema';
import { buildSideBarFeatureSchema } from './features/sideBarFeatureSchema';
import { buildSortFeatureSchema } from './features/sortFeatureSchema';
import type { SchemaBuilder } from './schemaBuilder';
import { s } from './schemaBuilder';
import type { JSONSchema } from './schemaTypes';

const StructuredSchemaBuilderMap: Record<
    StructuredSchemaFeature,
    (beans: BeanCollection, params?: StructuredSchemaParams) => SchemaBuilder | undefined
> = {
    aggregation: buildAggregationFeatureSchema,
    showValuesAs: buildShowValuesAsFeatureSchema,
    filter: buildFilterFeatureSchema,
    sort: buildSortFeatureSchema,
    pivot: buildPivotFeatureSchema,
    columnVisibility: buildColumnVisibilityFeatureSchema,
    columnSizing: buildColumnSizingFeatureSchema,
    rowGroup: buildRowGroupFeatureSchema,
    columnGroup: buildColumnGroupFeatureSchema,
    pagination: buildPaginationFeatureSchema,
    sideBar: buildSideBarFeatureSchema,
    focusedCell: buildFocusedCellFeatureSchema,
} as const;

export function getStructuredSchema(beans: BeanCollection, params?: StructuredSchemaParams): JSONSchema | undefined {
    const features: Record<string, SchemaBuilder> = {};

    for (const feature of STRUCTURED_SCHEMA_FEATURES) {
        if (params?.exclude?.includes(feature)) {
            continue;
        }
        const schema = StructuredSchemaBuilderMap[feature](beans, params);
        if (schema) {
            features[feature] = schema.nullable();
        }
    }

    // Single pass over colsList — collect ids and build descriptions in one go.
    const colsList = beans.colModel.colsList;
    const columnParams = params?.columns ?? {};
    const allColumnIds = new Array<string>(colsList.length);
    let descriptions = '';
    for (let i = 0, len = colsList.length; i < len; ++i) {
        const colId = colsList[i].colId;
        allColumnIds[i] = colId;
        const desc = columnParams[colId]?.description;
        if (i > 0) {
            descriptions += '\n';
        }
        descriptions += desc ? `${colId}: ${desc}` : colId;
    }

    return s.object(features).define('allColumnIds', s.enum(allColumnIds, descriptions)).toJSON();
}
