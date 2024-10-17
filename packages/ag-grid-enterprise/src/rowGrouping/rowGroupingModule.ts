import type { _ModuleWithApi, _ModuleWithoutApi, _RowGroupingGridApi } from 'ag-grid-community';
import {
    ColumnFilterModule,
    ColumnGroupCoreModule,
    FloatingFilterModule,
    PopupModule,
    StickyRowModule,
} from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AggregationModule } from '../aggregation/aggregationModule';
import { ClientSideRowModelExpansionModule } from '../expansion/expansionModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { GroupCellRenderer } from '../rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../rendering/groupCellRendererCtrl';
import { AggFuncService } from './aggFuncService';
import { AggregationStage } from './aggregationStage';
import { AutoColService } from './autoColService';
import { AgGridHeaderDropZonesSelector } from './columnDropZones/agGridHeaderDropZones';
import { FilterAggregatesStage } from './filterAggregatesStage';
import { GroupFilter } from './groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './groupFilter/groupFloatingFilter';
import { GroupHideOpenParentsService } from './groupHideOpenParentsService';
import { GroupStage } from './groupStage/groupStage';
import { PivotColDefService } from './pivotColDefService';
import { PivotResultColsService } from './pivotResultColsService';
import { PivotStage } from './pivotStage';
import { RowChildrenService } from './rowChildrenService';
import {
    addAggFuncs,
    addPivotColumns,
    addRowGroupColumns,
    addValueColumns,
    clearAggFuncs,
    getPivotColumns,
    getPivotResultColumn,
    getPivotResultColumns,
    getRowGroupColumns,
    getValueColumns,
    isPivotMode,
    moveRowGroupColumn,
    removePivotColumns,
    removeRowGroupColumns,
    removeValueColumns,
    setColumnAggFunc,
    setPivotColumns,
    setPivotResultColumns,
    setRowGroupColumns,
    setValueColumns,
} from './rowGroupingApi';
import { ShowRowGroupColsService } from './showRowGroupColsService';

export const RowChildrenModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowChildrenModule'),
    beans: [RowChildrenService],
};

export const RowGroupingCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingCoreModule'),
    beans: [
        AggregationStage,
        FilterAggregatesStage,
        GroupStage,
        AggFuncService,
        AutoColService,
        ShowRowGroupColsService,
        GroupHideOpenParentsService,
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
    dynamicBeans: [{ name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl }],
    selectors: [AgGridHeaderDropZonesSelector],
    dependsOn: [
        EnterpriseCoreModule,
        PopupModule, // can be extracted into row group panel module
        AggregationModule,
        RowChildrenModule,
    ],
};

export const PivotModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('PivotModule'),
    beans: [PivotResultColsService, PivotColDefService, PivotStage],
    dependsOn: [RowGroupingCoreModule, ColumnGroupCoreModule],
};

export const RowGroupingApiModule: _ModuleWithApi<_RowGroupingGridApi<any>> = {
    ...baseEnterpriseModule('RowGroupingApiModule'),
    apiFunctions: {
        addAggFuncs,
        clearAggFuncs,
        setColumnAggFunc,
        isPivotMode,
        getPivotResultColumn,
        setValueColumns,
        getValueColumns,
        removeValueColumns,
        addValueColumns,
        setRowGroupColumns,
        removeRowGroupColumns,
        addRowGroupColumns,
        getRowGroupColumns,
        moveRowGroupColumn,
        setPivotColumns,
        removePivotColumns,
        addPivotColumns,
        getPivotColumns,
        setPivotResultColumns,
        getPivotResultColumns,
    },
    dependsOn: [RowGroupingCoreModule],
};

export const GroupFilterModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GroupFilterModule'),
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependsOn: [RowGroupingCoreModule, ColumnFilterModule],
};

export const GroupFloatingFilterModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GroupFloatingFilterModule'),
    userComponents: [{ name: 'agGroupColumnFloatingFilter', classImp: GroupFloatingFilterComp }],
    dependsOn: [GroupFilterModule, FloatingFilterModule],
};

export const RowGroupingModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingModule'),
    dependsOn: [
        RowGroupingCoreModule,
        RowGroupingApiModule,
        GroupFilterModule,
        GroupFloatingFilterModule,
        StickyRowModule,
        PivotModule,
        ClientSideRowModelExpansionModule,
    ],
};
