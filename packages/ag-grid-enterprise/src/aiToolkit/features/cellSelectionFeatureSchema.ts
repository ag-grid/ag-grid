import type { BeanCollection } from 'ag-grid-community';
import { _isCellSelectionEnabled } from 'ag-grid-community';

import { s } from '../schemaBuilder';

const buildRowPositionSchema = (description: string) =>
    s.object(
        {
            rowIndex: s.number('Zero-based index of the row').minimum(0),
            rowPinned: s
                .enum(['top', 'bottom'], 'Pinned row container holding the row, or null for a regular row')
                .nullable(),
        },
        description
    );

export const buildCellSelectionFeatureSchema = (beans: BeanCollection) => {
    const { rangeSvc, gos } = beans;
    if (!rangeSvc || !_isCellSelectionEnabled(gos)) {
        return;
    }

    return s.object(
        {
            cellRanges: s.array(
                s.object({
                    startRow: buildRowPositionSchema('First row in the range'),
                    endRow: buildRowPositionSchema('Last row in the range'),
                    colIds: s.array(s.ref('allColumnIds'), 'Columns spanned by the range'),
                    startColId: s.ref('allColumnIds'),
                }),
                'Selected cell ranges'
            ),
        },
        'Cell selection for the grid'
    );
};
