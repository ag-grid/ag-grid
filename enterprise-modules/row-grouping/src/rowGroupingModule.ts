import type { Module } from '@ag-grid-community/core';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule, GroupCellRenderer, GroupCellRendererCtrl } from '@ag-grid-enterprise/core';

import { AggFuncService } from './rowGrouping/aggFuncService';
import { AggregationStage } from './rowGrouping/aggregationStage';
import { AutoColService } from './rowGrouping/autoColService';
import { AgGridHeaderDropZones } from './rowGrouping/columnDropZones/agGridHeaderDropZones';
import { FilterAggregatesStage } from './rowGrouping/filterAggregatesStage';
import { GroupFilter } from './rowGrouping/groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './rowGrouping/groupFilter/groupFloatingFilter';
import { GroupStage } from './rowGrouping/groupStage';
import { PivotColDefService } from './rowGrouping/pivotColDefService';
import { PivotStage } from './rowGrouping/pivotStage';
import { ShowRowGroupColsService } from './rowGrouping/showRowGroupColsService';
import { VERSION } from './version';

export const RowGroupingCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/row-grouping-core',
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
    agStackComponents: [AgGridHeaderDropZones],
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

export const GroupFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-filter',
    userComponents: [{ name: 'agGroupColumnFilter', classImp: GroupFilter }],
    dependantModules: [RowGroupingCoreModule, ColumnFilterModule],
};

export const GroupFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-floating-filter',
    userComponents: [{ name: 'agGroupColumnFloatingFilter', classImp: GroupFloatingFilterComp }],
    dependantModules: [GroupFilterModule, FloatingFilterModule],
};

export const RowGroupingModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    dependantModules: [RowGroupingCoreModule, GroupFilterModule, GroupFloatingFilterModule],
};
