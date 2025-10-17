import { STRUCTURED_SCHEMA_FEATURES } from 'ag-grid-community';
import type { BeanCollection, StructuredSchemaFeature, StructuredSchemaParams } from 'ag-grid-community';

import { buildAggregationFeatureSchema } from './features/aggregationFeatureSchema';
import { buildColumnSizingFeatureSchema } from './features/columnSizingFeatureSchema';
import { buildColumnVisibilityFeatureSchema } from './features/columnVisibilityFeatureSchema';
import { buildFilterFeatureSchema } from './features/filterFeatureSchema';
import { buildPivotFeatureSchema } from './features/pivotFeatureSchema';
import { buildRowGroupFeatureSchema } from './features/rowGroupFeatureSchema';
import { buildSortFeatureSchema } from './features/sortFeatureSchema';
import type { SchemaBuilder } from './schemaBuilder';
import { s } from './schemaBuilder';
import type { JSONSchema } from './schemaTypes';

const StructuredSchemaBuilderMap: Record<
    StructuredSchemaFeature,
    (beans: BeanCollection, params?: StructuredSchemaParams) => SchemaBuilder | undefined
> = {
    aggregation: buildAggregationFeatureSchema,
    filter: buildFilterFeatureSchema,
    sort: buildSortFeatureSchema,
    pivot: buildPivotFeatureSchema,
    columnVisibility: buildColumnVisibilityFeatureSchema,
    columnSizing: buildColumnSizingFeatureSchema,
    rowGroup: buildRowGroupFeatureSchema,
} as const;

export function getStructuredSchema(beans: BeanCollection, params?: StructuredSchemaParams): JSONSchema | undefined {
    const allColumnIds = beans.colModel.getCols().map((col) => col.getColId());

    const features: Record<string, SchemaBuilder> = {};

    for (const feature of STRUCTURED_SCHEMA_FEATURES) {
        if (params?.exclude?.includes(feature)) {
            continue;
        }

        const builder = StructuredSchemaBuilderMap[feature];

        const schema = builder(beans, params);

        if (schema) {
            features[feature] = schema.nullable();
        }
    }

    const columnParams = params?.columns ?? {};

    const descriptions = allColumnIds
        .map((colId) => {
            if (columnParams[colId]?.description) {
                return `${colId}: ${columnParams[colId].description}`;
            } else {
                return colId;
            }
        })
        .filter(Boolean)
        .join('\n');

    const schema = s.object(features).define('allColumnIds', s.enum(allColumnIds, descriptions));

    return schema.toJSON();
}
