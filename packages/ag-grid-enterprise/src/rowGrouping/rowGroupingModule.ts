import type { _RowGroupingGridApi } from 'ag-grid-community';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames, PopupModule, StickyRowModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { GroupCellRenderer } from '../rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../rendering/groupCellRendererCtrl';
import { AggFuncService } from './aggFuncService';
import { AggregationStage } from './aggregationStage';
import { AutoColService } from './autoColService';
import { ColumnDropZoneService } from './columnDropZones/columnDropZoneService';
import { FilterAggregatesStage } from './filterAggregatesStage';
import { GroupFilter } from './groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './groupFilter/groupFloatingFilter';
import { GroupHideOpenParentsService } from './groupHideOpenParentsService';
import { GroupStage } from './groupStage/groupStage';
import { SelectableService } from './groupStage/selectableService';
import { PivotColDefService } from './pivotColDefService';
import { PivotResultColsService } from './pivotResultColsService';
import { PivotStage } from './pivotStage';
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

export const RowGroupingCoreModule = defineEnterpriseModule('RowGroupingCoreModule', {
    beans: [
        AggregationStage,
        FilterAggregatesStage,
        GroupStage,
        AggFuncService,
        AutoColService,
        ShowRowGroupColsService,
        ColumnDropZoneService,
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
    controllers: [{ name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl }],
    dependsOn: [
        EnterpriseCoreModule,
        PopupModule, // can be extracted into row group panel module
    ],
});

export const RowGroupingSelectionModule = defineEnterpriseModule('RowGroupingSelectionModule', {
    beans: [SelectableService],
    dependsOn: [RowGroupingCoreModule],
});

export const PivotModule = defineEnterpriseModule('PivotModule', {
    beans: [PivotResultColsService, PivotColDefService, PivotStage],
    dependsOn: [RowGroupingCoreModule],
});

export const RowGroupingApiModule = defineEnterpriseModule<_RowGroupingGridApi<any>>('RowGroupingApiModule', {
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
});

export const GroupFilterModule = defineEnterpriseModule('GroupFilterModule', {
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependsOn: [RowGroupingCoreModule, ColumnFilterModule],
});

export const GroupFloatingFilterModule = defineEnterpriseModule('GroupFloatingFilterModule', {
    userComponents: [{ name: 'agGroupColumnFloatingFilter', classImp: GroupFloatingFilterComp }],
    dependsOn: [GroupFilterModule, FloatingFilterModule],
});

export const RowGroupingModule = defineEnterpriseModule(ModuleNames.RowGroupingModule, {
    dependsOn: [
        RowGroupingCoreModule,
        RowGroupingApiModule,
        GroupFilterModule,
        GroupFloatingFilterModule,
        RowGroupingSelectionModule,
        StickyRowModule,
        PivotModule,
    ],
});
