import type { BeanCollection } from 'ag-grid-community';
import { _isClientSideRowModel } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildFocusedCellFeatureSchema = (beans: BeanCollection) => {
    // Focus is restored by row index, which only addresses a stable row for the client-side row model.
    if (!_isClientSideRowModel(beans.gos)) {
        return;
    }

    return s.object(
        {
            colId: s.ref('allColumnIds'),
            rowIndex: s.number('Zero-based index of the row to focus').minimum(0),
            rowPinned: s
                .enum(['top', 'bottom'], 'Pinned row container holding the row, or null for a regular row')
                .nullable(),
        },
        'Focused cell for the grid'
    );
};
