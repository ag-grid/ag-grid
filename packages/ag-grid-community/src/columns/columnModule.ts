import type { _ColumnGridApi, _GetColumnDefsApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
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

export const DataTypeModule: Module = {
    ...baseCommunityModule('DataTypeModule'),
    beans: [DataTypeService],
    dependsOn: [CheckboxCellRendererModule],
};

export const ControlsColumnModule: Module = {
    ...baseCommunityModule('ControlsColumnModule'),
    beans: [ControlsColService],
};

export const GetColumnDefsApiModule: ModuleWithApi<_GetColumnDefsApi<any>> = {
    ...baseCommunityModule('GetColumnDefsApiModule'),
    beans: [ColumnDefFactory],
    apiFunctions: {
        getColumnDefs,
    },
};

export const ColumnFlexModule: Module = {
    ...baseCommunityModule('ColumnFlexModule'),
    beans: [ColumnFlexService],
};

export const ColumnApiModule: ModuleWithApi<_ColumnGridApi<any>> = {
    ...baseCommunityModule('ColumnApiModule'),
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
};
