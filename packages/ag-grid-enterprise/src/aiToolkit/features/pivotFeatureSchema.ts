import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildPivotFeatureSchema = (beans: BeanCollection) => {
    const columns = beans.colModel.getCols();
    const pivotableColumnIds = columns.filter((col) => col.isAllowPivot()).map((col) => col.getColId());

    if (pivotableColumnIds.length === 0) {
        return;
    }

    return s
        .object(
            {
                pivotMode: s.boolean('Whether pivot mode is enabled'),
                pivotColIds: s.array(
                    s.enum(pivotableColumnIds, 'Column ID that supports pivoting'),
                    'Array of column IDs to use as pivot columns'
                ),
            },
            'Pivot configuration for the grid'
        )
        .nullable();
};
