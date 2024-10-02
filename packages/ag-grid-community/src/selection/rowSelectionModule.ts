import type { _RowSelectionGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import {
    deselectAll,
    deselectAllFiltered,
    deselectAllOnCurrentPage,
    getSelectedNodes,
    getSelectedRows,
    selectAll,
    selectAllFiltered,
    selectAllOnCurrentPage,
    setNodesSelected,
} from './rowSelectionApi';
import { SelectionService } from './selectionService';

export const RowSelectionCoreModule = defineCommunityModule('RowSelectionCoreModule', {
    rowModels: ['clientSide', 'infinite', 'viewport'],
    beans: [SelectionService],
});

export const RowSelectionApiModule = defineCommunityModule<_RowSelectionGridApi>('RowSelectionApiModule', {
    apiFunctions: {
        setNodesSelected,
        selectAll,
        deselectAll,
        selectAllFiltered,
        deselectAllFiltered,
        selectAllOnCurrentPage,
        deselectAllOnCurrentPage,
        getSelectedNodes,
        getSelectedRows,
    },
});

export const RowSelectionModule = defineCommunityModule('RowSelectionModule', {
    dependsOn: [RowSelectionCoreModule, RowSelectionApiModule],
});
