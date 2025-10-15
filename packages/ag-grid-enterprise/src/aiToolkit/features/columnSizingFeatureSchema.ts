import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildColumnSizingFeatureSchema = (beans: BeanCollection) => {
    const columns = beans.colModel.getCols();
    const resizableColumns = columns.filter((col) => col.isResizable());

    if (resizableColumns.length === 0) {
        return;
    }

    const resizableColumnIds = resizableColumns.map((col) => col.getColId());

    return s
        .object(
            {
                columnSizingModel: s.array(
                    s.union([
                        s.object({
                            colId: s.ref('resizableColumnId'),
                            width: s.number('Fixed width in pixels').minimum(20),
                        }),

                        s.object({
                            colId: s.ref('resizableColumnId'),
                            flex: s.number('Flex sizing ratio').minimum(0),
                        }),
                    ]),
                    'Array of column sizing configurations'
                ),
            },
            'Column sizing configuration for the grid'
        )
        .define('resizableColumnId', s.enum(resizableColumnIds, 'Column ID that supports resizing'));
};
