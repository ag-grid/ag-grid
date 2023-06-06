import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { AggregationStage } from "./rowGrouping/aggregationStage";
import { GroupStage } from "./rowGrouping/groupStage";
import { PivotColDefService } from "./rowGrouping/pivotColDefService";
import { PivotStage } from "./rowGrouping/pivotStage";
import { AggFuncService } from "./rowGrouping/aggFuncService";
import { GridHeaderDropZones } from "./rowGrouping/columnDropZones/gridHeaderDropZones";
import { FilterAggregatesStage } from "./rowGrouping/filterAggregatesStage";
import { VERSION } from "./version";
import { GroupFilter } from "./rowGrouping/groupFilter/groupFilter";
import { GroupFloatingFilterComp } from "./rowGrouping/groupFilter/groupFloatingFilter";
export var RowGroupingModule = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    userComponents: [
        { componentName: 'agGroupColumnFilter', componentClass: GroupFilter },
        { componentName: 'agGroupColumnFloatingFilter', componentClass: GroupFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93R3JvdXBpbmdNb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm93R3JvdXBpbmdNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBRXhGLE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFXO0lBQ3JDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsaUJBQWlCO0lBQ3pDLEtBQUssRUFBRSxDQUFDLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDO0lBQzVHLGlCQUFpQixFQUFFO1FBQ2YsRUFBRSxhQUFhLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFO0tBQ2xGO0lBQ0QsY0FBYyxFQUFFO1FBQ1osRUFBRSxhQUFhLEVBQUUscUJBQXFCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRTtRQUNyRSxFQUFFLGFBQWEsRUFBRSw2QkFBNkIsRUFBRSxjQUFjLEVBQUUsdUJBQXVCLEVBQUU7S0FDNUY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtLQUN2QjtDQUNKLENBQUMifQ==