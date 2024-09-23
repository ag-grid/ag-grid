import type { _RowSelectionGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
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

export const RowSelectionCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/row-selection-core',
    beans: [SelectionService],
});

export const RowSelectionApiModule = _defineModule<_RowSelectionGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/row-selection-api',
    dependantModules: [RowSelectionCoreModule],
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

export const RowSelectionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/row-selection',
    dependantModules: [RowSelectionApiModule],
});
