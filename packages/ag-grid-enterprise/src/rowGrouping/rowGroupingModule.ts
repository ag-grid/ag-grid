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
import { GroupColumnModule } from '../groupColumn/groupColumnModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { AgGridHeaderDropZonesSelector } from './columnDropZones/agGridHeaderDropZones';
import { GroupFilter } from './groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './groupFilter/groupFloatingFilter';
import { GroupHideOpenParentsService } from './groupHideOpenParentsService';
import { GroupStage } from './groupStage/groupStage';
import { PivotColsService } from './pivotColsService';
import { RowGroupColsService } from './rowGroupColsService';
import {
    addRowGroupColumns,
    getRowGroupColumns,
    moveRowGroupColumn,
    removeRowGroupColumns,
    setRowGroupColumns,
} from './rowGroupingApi';
import { ValueColsService } from './valueColsService';

export const RowGroupingCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingCoreModule'),
    beans: [GroupStage, GroupHideOpenParentsService],
    dependsOn: [EnterpriseCoreModule, AggregationModule, GroupColumnModule],
};

export const RowGroupingPanelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingPanelModule'),
    selectors: [AgGridHeaderDropZonesSelector],
    dependsOn: [RowGroupingCoreModule, PopupModule],
};

export const RowGroupingApiModule: _ModuleWithApi<_RowGroupingGridApi> = {
    ...baseEnterpriseModule('RowGroupingApiModule'),
    apiFunctions: {
        setRowGroupColumns,
        removeRowGroupColumns,
        addRowGroupColumns,
        getRowGroupColumns,
        moveRowGroupColumn,
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

export const RowGroupingNoPivotModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingNoPivotModule'),
    dependsOn: [
        RowGroupingCoreModule,
        RowGroupingApiModule,
        StickyRowModule,
        RowGroupingPanelModule,
        ClientSideRowModelExpansionModule,
        GroupFilterModule,
        GroupFloatingFilterModule,
    ],
};
