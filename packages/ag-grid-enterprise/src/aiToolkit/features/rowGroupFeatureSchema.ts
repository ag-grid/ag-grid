import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildRowGroupFeatureSchema = (beans: BeanCollection) => {
    const columns = beans.colModel.getCols();
    const groupableColumns = columns.filter((col) => col.isAllowRowGroup());

    if (groupableColumns.length === 0) {
        return;
    }

    const groupableColumnIds = groupableColumns.map((col) => col.getColId());

    return s.object(
        {
            groupColIds: s.array(
                s.enum(groupableColumnIds, 'Column ID that supports row grouping'),
                'Array of column IDs to group by'
            ),
        },
        'Row grouping configuration for the grid'
    );
};
