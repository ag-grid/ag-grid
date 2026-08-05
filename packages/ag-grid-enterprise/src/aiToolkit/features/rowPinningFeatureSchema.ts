import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildRowPinningFeatureSchema = (beans: BeanCollection) => {
    const { pinnedRowModel, gos } = beans;
    // The model is present whenever its module is registered, so the grid option is what decides
    // whether rows can be pinned.
    if (!pinnedRowModel || !gos.get('enableRowPinning')) {
        return;
    }

    return s.object(
        {
            top: s.array(s.string('Row ID'), 'Row IDs to pin above the scrolling rows'),
            bottom: s.array(s.string('Row ID'), 'Row IDs to pin below the scrolling rows'),
        },
        'Manually pinned rows for the grid. Omit a row ID to unpin it.'
    );
};
