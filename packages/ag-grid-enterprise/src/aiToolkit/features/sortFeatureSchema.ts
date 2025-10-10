import type { BeanCollection } from 'ag-grid-community';

import { createArraySchema, createEnumSchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

/**
 * Builds a comprehensive sort schema for all sortable columns in the grid
 */
export const buildSortFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const { sortSvc } = beans;
    if (!sortSvc) {
        return;
    }

    const columns = beans.colModel.getCols();
    const sortableColumns = columns.filter((col) => col.isSortable());

    if (sortableColumns.length === 0) {
        return;
    }

    const sortableColumnIds = sortableColumns.map((col) => col.getColId());

    return createObjectSchema({
        description: 'Sort configuration for the grid',

        properties: {
            sort: createObjectSchema({
                properties: {
                    sortModel: createArraySchema({
                        description: 'Array of sort configurations',
                        items: {
                            type: 'object',
                            properties: {
                                colId: createEnumSchema({
                                    enum: sortableColumnIds,
                                    description: 'Column ID that supports sorting',
                                }),
                                sort: createEnumSchema({
                                    enum: ['asc', 'desc'],
                                    description: 'Sort direction: ascending or descending',
                                }),
                            },
                            required: ['colId', 'sort'],
                            additionalProperties: false,
                        },
                    }),
                },
            }),
        },
    });
};
