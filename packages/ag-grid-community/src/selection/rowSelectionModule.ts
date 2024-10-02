import type { _RowSelectionGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
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

export const RowSelectionCoreModule: Module = {
    ...baseCommunityModule('RowSelectionCoreModule'),
    beans: [SelectionService],
};

export const RowSelectionApiModule: ModuleWithApi<_RowSelectionGridApi> = {
    ...baseCommunityModule('RowSelectionApiModule'),
    dependsOn: [RowSelectionCoreModule],
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
};

export const RowSelectionModule: Module = {
    ...baseCommunityModule('RowSelectionModule'),
    dependsOn: [RowSelectionApiModule],
};
