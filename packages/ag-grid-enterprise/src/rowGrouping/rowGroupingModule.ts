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
} from './rowGroupingApi';
import { ShowRowGroupColsService } from './showRowGroupColsService';

export const RowGroupingCoreModule = defineEnterpriseModule(`${ModuleNames.RowGroupingModule}-core`, {
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

export const RowGroupingSelectionModule = defineEnterpriseModule(`${ModuleNames.RowGroupingModule}-selection`, {
    beans: [SelectableService],
    dependsOn: [RowGroupingCoreModule],
});

export const PivotModule = defineEnterpriseModule('@ag-grid-enterprise/pivot', {
    beans: [PivotResultColsService, PivotColDefService, PivotStage],
    dependsOn: [RowGroupingCoreModule],
});

export const RowGroupingApiModule = defineEnterpriseModule<_RowGroupingGridApi<any>>(
    `${ModuleNames.RowGroupingModule}-api`,
    {
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
        dependsOn: [RowGroupingCoreModule],
    }
);

export const GroupFilterModule = defineEnterpriseModule('@ag-grid-enterprise/group-filter', {
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependsOn: [RowGroupingCoreModule, ColumnFilterModule],
});

export const GroupFloatingFilterModule = defineEnterpriseModule('@ag-grid-enterprise/group-floating-filter', {
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
