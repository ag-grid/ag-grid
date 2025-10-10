import type { BeanCollection } from 'ag-grid-community';

import { createArraySchema, createEnumSchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

export const buildAggregationFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const { aggFuncSvc } = beans;
    if (!aggFuncSvc) {
        return;
    }

    const columns = beans.colModel.getCols();
    const aggregatableColumns = columns.filter((col) => col.isAllowValue() && aggFuncSvc.getFuncNames(col).length > 0);

    if (aggregatableColumns.length === 0) {
        return;
    }

    return createObjectSchema({
        description: 'Aggregation configuration for the grid',
        properties: {
            aggregation: createObjectSchema({
                properties: {
                    aggregationModel: createArraySchema({
                        description: 'Array of aggregation configurations',
                        items: {
                            anyOf: aggregatableColumns.map((col) => ({
                                type: 'object',
                                properties: {
                                    colId: createEnumSchema({
                                        enum: [col.getColId()],
                                        description: 'Column identifier',
                                    }),
                                    aggFunc: createEnumSchema({
                                        enum: beans.aggFuncSvc?.getFuncNames(col) || [],
                                        description: 'Aggregation function',
                                    }),
                                },
                                required: ['colId', 'aggFunc'],
                                additionalProperties: false,
                            })),
                        },
                    }),
                },
            }),
        },
    });
};
