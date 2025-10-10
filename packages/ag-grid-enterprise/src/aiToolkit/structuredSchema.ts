import type { BeanCollection } from 'ag-grid-community';

import { buildAggregationFeatureSchema } from './features/aggregationFeatureSchema';
import { buildColumnGroupFeatureSchema } from './features/columnGroupFeatureSchema';
import { buildColumnSizingFeatureSchema } from './features/columnSizingFeatureSchema';
import { buildColumnVisibilityFeatureSchema } from './features/columnVisibilityFeatureSchema';
// import { buildFilterFeatureSchema } from './features/filterFeatureSchema';
import { buildPivotFeatureSchema } from './features/pivotFeatureSchema';
import { buildSortFeatureSchema } from './features/sortFeatureSchema';
import { createEnumSchema, createObjectSchema } from './schemaTypes';
import type { JSONSchema } from './schemaTypes';

export function getStructuredSchema(beans: BeanCollection): JSONSchema {
    const allColumnIds = beans.colModel.getCols().map((col) => col.getColId());

    const schema = [
        buildAggregationFeatureSchema(beans),
        // buildFilterFeatureSchema(beans),
        buildSortFeatureSchema(beans),
        buildPivotFeatureSchema(beans),
        buildColumnVisibilityFeatureSchema(),
        buildColumnSizingFeatureSchema(beans),
        buildColumnGroupFeatureSchema(beans),
    ]
        .filter(Boolean)
        .reduce(
            (acc, schema) => {
                if (!schema || !acc) {
                    return acc;
                }
                return {
                    ...acc,
                    $defs: {
                        ...acc.$defs,
                        ...schema.$defs,
                    },
                    properties: { ...acc.properties, ...schema.properties },
                };
            },

            createObjectSchema({
                properties: {},
                $defs: {
                    allColumnIds: createEnumSchema({
                        enum: allColumnIds,
                        description: 'Column ID that supports resizing',
                    }),
                },
            })
        );

    return schema as JSONSchema;
}
