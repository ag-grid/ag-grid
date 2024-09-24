import type { _RowGroupingGridApi } from 'ag-grid-community';
import { ModuleNames, StickyRowModule, _ColumnFilterModule, _FloatingFilterModule, _defineModule } from 'ag-grid-community';

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
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { GroupCellRenderer } from '../rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../rendering/groupCellRendererCtrl';

export const RowGroupingCoreModule = _defineModule({
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
    dependantModules: [EnterpriseCoreModule],
});

export const RowGroupingSelectionModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.RowGroupingModule}-selection`,
    beans: [SelectableService],
    dependantModules: [RowGroupingCoreModule],
});

export const RowGroupingApiModule = _defineModule<_RowGroupingGridApi<any>>({
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
});

export const GroupFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-filter',
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependantModules: [RowGroupingCoreModule, _ColumnFilterModule],
});

export const GroupFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-floating-filter',
    userComponents: [{ name: 'agGroupColumnFloatingFilter', classImp: GroupFloatingFilterComp }],
    dependantModules: [GroupFilterModule, _FloatingFilterModule],
});

export const RowGroupingModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    dependantModules: [
        RowGroupingCoreModule,
        RowGroupingApiModule,
        GroupFilterModule,
        GroupFloatingFilterModule,
        RowGroupingSelectionModule,
        StickyRowModule,
    ],
});
