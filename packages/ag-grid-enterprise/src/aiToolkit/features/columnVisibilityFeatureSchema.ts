import type { BeanCollection, StructuredSchemaParams } from 'ag-grid-community';

import { s } from '../schemaBuilder';
import { buildAllColumnIdsEnum } from './columnIds';

// Monolithic schema: references the shared `allColumnIds` $def injected by getStructuredSchema.
export const buildColumnVisibilityFeatureSchema = () => {
    return s
        .object(
            {
                hiddenColIds: s.array(s.ref('allColumnIds'), 'Array of column IDs to hide'),
            },
            'Column visibility configuration for the grid'
        )
        .nullable();
};

// Individual tool schema: self-contained, inlining the column-id enum (no shared $def to ref).
export const buildColumnVisibilityToolSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    return s.object(
        {
            hiddenColIds: s.array(buildAllColumnIdsEnum(beans, params), 'Array of column IDs to hide'),
        },
        'Column visibility configuration for the grid'
    );
};
