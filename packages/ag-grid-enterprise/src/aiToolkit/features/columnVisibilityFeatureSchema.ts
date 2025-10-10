import { createArraySchema, createObjectSchema } from '../schemaTypes';
import type { ObjectSchema } from '../schemaTypes';

/**
 * Builds a comprehensive column visibility schema for all columns in the grid
 */
export const buildColumnVisibilityFeatureSchema = (): ObjectSchema | undefined => {
    return createObjectSchema({
        description: 'Column visibility configuration for the grid',
        properties: {
            columnVisibility: createObjectSchema({
                properties: {
                    hiddenColIds: createArraySchema({
                        description: 'Array of column IDs to hide',
                        items: { $ref: '#/$defs/allColumnId' },
                    }),
                },
            }),
        },
    });
};
