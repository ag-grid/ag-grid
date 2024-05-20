import { Module, ModuleNames } from '@ag-grid-community/core';
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

export const RowGroupingModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [AgGridHeaderDropZones],
    userComponents: [
        { componentName: 'agGroupColumnFilter', componentClass: GroupFilter },
        { componentName: 'agGroupColumnFloatingFilter', componentClass: GroupFloatingFilterComp },
    ],
    dependantModules: [EnterpriseCoreModule],
};
