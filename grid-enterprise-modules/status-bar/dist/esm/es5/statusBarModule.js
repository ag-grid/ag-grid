import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { StatusBarService } from "./statusBar/statusBarService";
import { StatusBar } from "./statusBar/statusBar";
import { NameValueComp } from "./statusBar/providedPanels/nameValueComp";
import { TotalAndFilteredRowsComp } from "./statusBar/providedPanels/totalAndFilteredRowsComp";
import { FilteredRowsComp } from "./statusBar/providedPanels/filteredRowsComp";
import { TotalRowsComp } from "./statusBar/providedPanels/totalRowsComp";
import { SelectedRowsComp } from "./statusBar/providedPanels/selectedRowsComp";
import { AggregationComp } from "./statusBar/providedPanels/aggregationComp";
import { VERSION } from "./version";
export var StatusBarModule = {
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [
        { componentName: 'AgStatusBar', componentClass: StatusBar },
        { componentName: 'AgNameValue', componentClass: NameValueComp },
    ],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0YXR1c0Jhck1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDekUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFcEMsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFXO0lBQ25DLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsZUFBZTtJQUN2QyxLQUFLLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztJQUN6QixpQkFBaUIsRUFBRTtRQUNmLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFO1FBQzNELEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFO0tBQ2xFO0lBQ0QsY0FBYyxFQUFFO1FBQ1osRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRTtRQUM1RSxFQUFFLGFBQWEsRUFBRSw2QkFBNkIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUU7UUFDbEYsRUFBRSxhQUFhLEVBQUUsMEJBQTBCLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRTtRQUM1RSxFQUFFLGFBQWEsRUFBRSw2QkFBNkIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUU7UUFDbEYsRUFBRSxhQUFhLEVBQUUscUNBQXFDLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFO0tBQ3JHO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDZCxvQkFBb0I7S0FDdkI7Q0FDSixDQUFDIn0=