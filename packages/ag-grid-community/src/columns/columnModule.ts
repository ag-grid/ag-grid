import type { _ColumnGridApi, _GetColumnDefsApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { CheckboxCellRendererModule } from '../rendering/cellRenderers/cellRendererModule';
import { VERSION } from '../version';
import {
    applyColumnState,
    getAllDisplayedColumnGroups,
    getAllDisplayedColumns,
    getAllDisplayedVirtualColumns,
    getAllGridColumns,
    getCenterDisplayedColumnGroups,
    getColumn,
    getColumnDef,
    getColumnDefs,
    getColumnGroup,
    getColumnGroupState,
    getColumnState,
    getColumns,
    getDisplayNameForColumn,
    getDisplayNameForColumnGroup,
    getDisplayedCenterColumns,
    getDisplayedColAfter,
    getDisplayedColBefore,
    getDisplayedLeftColumns,
    getDisplayedRightColumns,
    getLeftDisplayedColumnGroups,
    getProvidedColumnGroup,
    getRightDisplayedColumnGroups,
    isPinning,
    isPinningLeft,
    isPinningRight,
    resetColumnGroupState,
    resetColumnState,
    setColumnGroupOpened,
    setColumnGroupState,
    setColumnPinned,
    setColumnVisible,
    setColumnsPinned,
    setColumnsVisible,
} from './columnApi';
import { ColumnDefFactory } from './columnDefFactory';
import { ControlsColService } from './controlsColService';
import { DataTypeService } from './dataTypeService';

export const DataTypeModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/data-type',
    beans: [DataTypeService],
    dependantModules: [CheckboxCellRendererModule],
});

export const ControlsColumnModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/controls-column',
    beans: [ControlsColService],
});

export const GetColumnDefsModule = _defineModule<_GetColumnDefsApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/get-column-defs',
    beans: [ColumnDefFactory],
    apiFunctions: {
        getColumnDefs,
    },
});

export const ColumnApiModule = _defineModule<_ColumnGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-api',
    apiFunctions: {
        getColumnDef,
        setColumnGroupOpened,
        getColumnGroup,
        getProvidedColumnGroup,
        getDisplayNameForColumn,
        getDisplayNameForColumnGroup,
        getColumn,
        getColumns,
        applyColumnState,
        getColumnState,
        resetColumnState,
        getColumnGroupState,
        setColumnGroupState,
        resetColumnGroupState,
        isPinning,
        isPinningLeft,
        isPinningRight,
        getDisplayedColAfter,
        getDisplayedColBefore,
        setColumnVisible,
        setColumnsVisible,
        setColumnPinned,
        setColumnsPinned,
        getAllGridColumns,
        getDisplayedLeftColumns,
        getDisplayedCenterColumns,
        getDisplayedRightColumns,
        getAllDisplayedColumns,
        getAllDisplayedVirtualColumns,
        getLeftDisplayedColumnGroups,
        getCenterDisplayedColumnGroups,
        getRightDisplayedColumnGroups,
        getAllDisplayedColumnGroups,
    },
});
