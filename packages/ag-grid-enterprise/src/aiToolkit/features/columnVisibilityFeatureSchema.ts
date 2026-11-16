import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';

export const buildColumnVisibilityFeatureSchema = (): SchemaBuilder => {
    return s
        .object(
            {
                hiddenColIds: s.array(s.ref('allColumnIds'), 'Array of column IDs to hide'),
            },
            'Column visibility configuration for the grid'
        )
        .nullable();
};
