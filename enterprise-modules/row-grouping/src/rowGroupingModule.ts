import type { Module } from '@ag-grid-community/core';
import { ModuleNames, _ColumnFilterModule, _FloatingFilterModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule, GroupCellRenderer, GroupCellRendererCtrl } from '@ag-grid-enterprise/core';

import { AggFuncService } from './rowGrouping/aggFuncService';
import { AggregationStage } from './rowGrouping/aggregationStage';
import { AutoColService } from './rowGrouping/autoColService';
import { FilterAggregatesStage } from './rowGrouping/filterAggregatesStage';
import { GroupFilter } from './rowGrouping/groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './rowGrouping/groupFilter/groupFloatingFilter';
import { GroupStage } from './rowGrouping/groupStage';
import { PivotColDefService } from './rowGrouping/pivotColDefService';
import { PivotStage } from './rowGrouping/pivotStage';
import {
    addAggFunc,
    addAggFuncs,
    addPivotColumn,
    addPivotColumns,
    addRowGroupColumn,
    addRowGroupColumns,
    addValueColumn,
    addValueColumns,
    clearAggFuncs,
    getPivotColumns,
    getPivotResultColumn,
    getPivotResultColumns,
    getRowGroupColumns,
    getValueColumns,
    isPivotMode,
    moveRowGroupColumn,
    removePivotColumn,
    removePivotColumns,
    removeRowGroupColumn,
    removeRowGroupColumns,
    removeValueColumn,
    removeValueColumns,
    setColumnAggFunc,
    setPivotColumns,
    setPivotResultColumns,
    setRowGroupColumns,
    setValueColumns,
} from './rowGrouping/rowGroupingApi';
import { ShowRowGroupColsService } from './rowGrouping/showRowGroupColsService';
import { VERSION } from './version';

export const RowGroupingCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.RowGroupingModule}-core`,
    beans: [
        AggregationStage,
        FilterAggregatesStage,
        GroupStage,
        PivotColDefService,
        PivotStage,
        AggFuncService,
        AutoColService,
        ShowRowGroupColsService,
    ],
    userComponents: [
        {
            name: 'agGroupRowRenderer',
            classImp: GroupCellRenderer,
        },
        {
            name: 'agGroupCellRenderer',
            classImp: GroupCellRenderer,
        },
    ],
    controllers: [{ name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl }],
    dependantModules: [EnterpriseCoreModule],
};

export const RowGroupingApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.RowGroupingModule}-api`,
    apiFunctions: {
        addAggFunc,
        addAggFuncs,
        clearAggFuncs,
        setColumnAggFunc,
        isPivotMode,
        getPivotResultColumn,
        setValueColumns,
        getValueColumns,
        removeValueColumn,
        removeValueColumns,
        addValueColumn,
        addValueColumns,
        setRowGroupColumns,
        removeRowGroupColumn,
        removeRowGroupColumns,
        addRowGroupColumn,
        addRowGroupColumns,
        getRowGroupColumns,
        moveRowGroupColumn,
        setPivotColumns,
        removePivotColumn,
        removePivotColumns,
        addPivotColumn,
        addPivotColumns,
        getPivotColumns,
        setPivotResultColumns,
        getPivotResultColumns,
    },
    dependantModules: [RowGroupingCoreModule],
};

export const GroupFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-filter',
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependantModules: [RowGroupingCoreModule, _ColumnFilterModule],
};

export const GroupFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-floating-filter',
    userComponents: [{ name: 'agGroupColumnFloatingFilter', classImp: GroupFloatingFilterComp }],
    dependantModules: [GroupFilterModule, _FloatingFilterModule],
};

export const RowGroupingModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    dependantModules: [RowGroupingCoreModule, RowGroupingApiModule, GroupFilterModule, GroupFloatingFilterModule],
};
