import type { Module } from '@ag-grid-community/core';
import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AggFuncService } from './rowGrouping/aggFuncService';
import { AggregationStage } from './rowGrouping/aggregationStage';
import { AgGridHeaderDropZones } from './rowGrouping/columnDropZones/agGridHeaderDropZones';
import { FilterAggregatesStage } from './rowGrouping/filterAggregatesStage';
import { GroupFilter } from './rowGrouping/groupFilter/groupFilter';
import { GroupFloatingFilterComp } from './rowGrouping/groupFilter/groupFloatingFilter';
import { GroupStage } from './rowGrouping/groupStage';
import { PivotColDefService } from './rowGrouping/pivotColDefService';
import { PivotStage } from './rowGrouping/pivotStage';
import { VERSION } from './version';

export const RowGroupingCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/row-grouping-core',
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [AgGridHeaderDropZones],
    dependantModules: [EnterpriseCoreModule],
};

export const GroupFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-filter',
    userComponents: [{ componentName: 'agGroupColumnFilter', componentClass: GroupFilter }],
    dependantModules: [RowGroupingCoreModule, ColumnFilterModule],
};

export const GroupFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/group-floating-filter',
    userComponents: [{ componentName: 'agGroupColumnFloatingFilter', componentClass: GroupFloatingFilterComp }],
    dependantModules: [GroupFilterModule, FloatingFilterModule],
};

export const RowGroupingModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    dependantModules: [RowGroupingCoreModule, GroupFilterModule, GroupFloatingFilterModule],
};
