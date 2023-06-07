import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { PrimaryColsHeaderPanel } from "./columnToolPanel/primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./columnToolPanel/primaryColsListPanel";
import { ColumnToolPanel } from "./columnToolPanel/columnToolPanel";
import { PrimaryColsPanel } from "./columnToolPanel/primaryColsPanel";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { ModelItemUtils } from "./columnToolPanel/modelItemUtils";
import { VERSION } from "./version";
export var ColumnsToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uc1Rvb2xQYW5lbE1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb2x1bW5zVG9vbFBhbmVsTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUNsRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLHNCQUFzQixHQUFXO0lBQzFDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsc0JBQXNCO0lBQzlDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQztJQUN2QixpQkFBaUIsRUFBRTtRQUNmLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixFQUFFLGNBQWMsRUFBRSxzQkFBc0IsRUFBRTtRQUNoRixFQUFFLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLEVBQUU7UUFDNUUsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRTtLQUN2RTtJQUNELGNBQWMsRUFBRTtRQUNaLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUU7S0FDM0U7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtRQUNwQixpQkFBaUI7UUFDakIsYUFBYTtLQUNoQjtDQUNKLENBQUMifQ==