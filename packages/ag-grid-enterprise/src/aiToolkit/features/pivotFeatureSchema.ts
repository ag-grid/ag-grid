import type { BeanCollection } from 'ag-grid-community';

import { createArraySchema, createBooleanSchema, createEnumSchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

export const buildPivotFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const columns = beans.colModel.getCols();
    const pivotableColumnIds = columns.filter((col) => col.isAllowPivot()).map((col) => col.getColId());

    if (pivotableColumnIds.length === 0) {
        return;
    }

    return createObjectSchema({
        description: 'Pivot configuration for the grid',
        properties: {
            pivot: createObjectSchema({
                properties: {
                    pivotMode: createBooleanSchema({
                        description: 'Whether pivot mode is enabled',
                    }),
                    pivotColIds: createArraySchema({
                        description: 'Array of column IDs to use as pivot columns',
                        items: createEnumSchema({
                            enum: pivotableColumnIds,
                            description: 'Column ID that supports pivoting',
                        }),
                    }),
                },
            }),
        },
    });
};
