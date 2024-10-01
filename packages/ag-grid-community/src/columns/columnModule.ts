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

export const DataTypeModule = defineCommunityModule('DataTypeModule', {
    beans: [DataTypeService],
    dependsOn: [CheckboxCellRendererModule],
});

export const ControlsColumnModule = defineCommunityModule('ControlsColumnModule', {
    beans: [ControlsColService],
});

export const GetColumnDefsApiModule = defineCommunityModule<_GetColumnDefsApi<any>>('GetColumnDefsApiModule', {
    beans: [ColumnDefFactory],
    apiFunctions: {
        getColumnDefs,
    },
});

export const ColumnFlexModule = defineCommunityModule('ColumnFlexModule', {
    beans: [ColumnFlexService],
});

export const ColumnApiModule = defineCommunityModule<_ColumnGridApi<any>>('ColumnApiModule', {
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
