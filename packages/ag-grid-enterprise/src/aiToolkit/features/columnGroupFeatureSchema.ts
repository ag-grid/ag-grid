import type { BeanCollection } from 'ag-grid-community';

import { createArraySchema, createEnumSchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

/**
 * Builds a comprehensive row grouping schema for all groupable columns in the grid
 */
export const buildColumnGroupFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const columns = beans.colModel.getCols();
    const groupableColumns = columns.filter((col) => col.isAllowRowGroup());

    if (groupableColumns.length === 0) {
        return;
    }

    const groupableColumnIds = groupableColumns.map((col) => col.getColId());

    return createObjectSchema({
        description: 'Row grouping configuration for the grid',
        properties: {
            rowGroup: createObjectSchema({
                properties: {
                    groupColIds: createArraySchema({
                        description: 'Array of column IDs to group by',
                        items: createEnumSchema({
                            enum: groupableColumnIds,
                            description: 'Column ID that supports row grouping',
                        }),
                    }),
                },
            }),
        },
    });
};
