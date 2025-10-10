import type { BeanCollection } from 'ag-grid-community';

import { createArraySchema, createEnumSchema, createNumberSchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

export const buildColumnSizingFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const columns = beans.colModel.getCols();
    const resizableColumns = columns.filter((col) => col.isResizable());

    if (resizableColumns.length === 0) {
        return;
    }

    const resizableColumnIds = resizableColumns.map((col) => col.getColId());

    return createObjectSchema({
        description: 'Column sizing configuration for the grid',
        $defs: {
            resizableColumnId: createEnumSchema({
                enum: resizableColumnIds,
                description: 'Column ID that supports resizing',
            }),
        },
        properties: {
            columnSizing: createObjectSchema({
                properties: {
                    columnSizingModel: createArraySchema({
                        description: 'Array of column sizing configurations',
                        items: {
                            anyOf: [
                                {
                                    type: 'object',
                                    properties: {
                                        colId: { $ref: '#/$defs/resizableColumnId' },
                                        width: createNumberSchema({
                                            description: 'Fixed width in pixels',
                                            minimum: 20,
                                        }),
                                    },
                                    required: ['colId', 'width'],
                                    additionalProperties: false,
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        colId: { $ref: '#/$defs/resizableColumnId' },
                                        flex: createNumberSchema({
                                            description: 'Flexible sizing ratio',
                                            minimum: 0,
                                        }),
                                    },
                                    required: ['colId', 'flex'],
                                    additionalProperties: false,
                                },
                            ],
                        },
                    }),
                },
            }),
        },
    });
};
