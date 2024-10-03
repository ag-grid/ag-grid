import type { _RowSelectionGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
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

export const RowSelectionCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowSelectionCoreModule'),
    rowModels: ['clientSide', 'infinite', 'viewport'],
    beans: [SelectionService],
};

export const RowSelectionApiModule: _ModuleWithApi<_RowSelectionGridApi> = {
    ...baseCommunityModule('RowSelectionApiModule'),
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

export const RowSelectionModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowSelectionModule'),
    dependsOn: [RowSelectionCoreModule, RowSelectionApiModule],
};
