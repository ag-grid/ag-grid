import type { BeanCollection } from 'ag-grid-community';
import { _getGroupSelectsDescendants, _isClientSideRowModel, _isServerSideRowModel } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildRowSelectionFeatureSchema = (beans: BeanCollection) => {
    const { selectionSvc, gos } = beans;
    // The service is present whenever its module is registered, so the grid option is what decides
    // whether rows can be selected.
    if (!selectionSvc || !gos.get('rowSelection')) {
        return;
    }

    if (_isClientSideRowModel(gos)) {
        return s.array(s.string('Row ID'), 'Row IDs of the selected rows');
    }

    // Group selection nests toggled nodes to arbitrary depth, which is not worth asking a model to
    // author, so it is left unsupported rather than partially described.
    if (!_isServerSideRowModel(gos) || _getGroupSelectsDescendants(gos)) {
        return;
    }

    return s.object(
        {
            selectAll: s.boolean('Whether the majority of rows are selected'),
            toggledNodes: s.array(s.string('Row ID'), 'Row IDs whose selection is the opposite of selectAll'),
        },
        'Row selection for the grid'
    );
};
