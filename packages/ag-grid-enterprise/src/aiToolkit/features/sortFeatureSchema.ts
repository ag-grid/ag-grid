import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildSortFeatureSchema = (beans: BeanCollection) => {
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

    return s
        .object(
            {
                sortModel: s.array(
                    s.object({
                        colId: s.enum(sortableColumnIds, 'Column ID that supports sorting'),
                        sort: s.enum(['asc', 'desc'], 'Sort direction: ascending or descending'),
                    }),
                    'Array of sort configurations'
                ),
            },
            'Sort configuration for the grid'
        )
        .nullable();
};
