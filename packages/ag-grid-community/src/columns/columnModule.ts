import type { _ColumnGridApi, _GetColumnDefsApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { CheckboxCellRendererModule } from '../rendering/cellRenderers/cellRendererModule';
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
    setColumnsPinned,
    setColumnsVisible,
} from './columnApi';
import { ColumnDefFactory } from './columnDefFactory';
import { ColumnFlexService } from './columnFlexService';
import { ControlsColService } from './controlsColService';
import { DataTypeService } from './dataTypeService';

export const DataTypeModule = defineCommunityModule('@ag-grid-community/data-type', {
    beans: [DataTypeService],
    dependsOn: [CheckboxCellRendererModule],
});

export const ControlsColumnModule = defineCommunityModule('@ag-grid-community/controls-column', {
    beans: [ControlsColService],
});

export const GetColumnDefsModule = defineCommunityModule<_GetColumnDefsApi<any>>('@ag-grid-community/get-column-defs', {
    beans: [ColumnDefFactory],
    apiFunctions: {
        getColumnDefs,
    },
});

export const ColumnFlexModule = defineCommunityModule('@ag-grid-community/column-flex', {
    beans: [ColumnFlexService],
});

export const ColumnApiModule = defineCommunityModule<_ColumnGridApi<any>>('@ag-grid-community/column-api', {
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
        setColumnsVisible,
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
