import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { FiltersToolPanelHeaderPanel } from "./filterToolPanel/filtersToolPanelHeaderPanel";
import { FiltersToolPanelListPanel } from "./filterToolPanel/filtersToolPanelListPanel";
import { FiltersToolPanel } from "./filterToolPanel/filtersToolPanel";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { VERSION } from "./version";
export const FiltersToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel },
    ],
    dependantModules: [
        SideBarModule,
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbE1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9maWx0ZXJzVG9vbFBhbmVsTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUM1RixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUN4RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVwQyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBVztJQUMxQyxPQUFPLEVBQUUsT0FBTztJQUNoQixVQUFVLEVBQUUsV0FBVyxDQUFDLHNCQUFzQjtJQUM5QyxLQUFLLEVBQUUsRUFBRTtJQUNULGlCQUFpQixFQUFFO1FBQ2YsRUFBRSxhQUFhLEVBQUUsMEJBQTBCLEVBQUUsY0FBYyxFQUFFLDJCQUEyQixFQUFFO1FBQzFGLEVBQUUsYUFBYSxFQUFFLHdCQUF3QixFQUFFLGNBQWMsRUFBRSx5QkFBeUIsRUFBRTtLQUN6RjtJQUNELGNBQWMsRUFBRTtRQUNaLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRTtLQUM1RTtJQUNELGdCQUFnQixFQUFFO1FBQ2QsYUFBYTtRQUNiLG9CQUFvQjtLQUN2QjtDQUNKLENBQUMifQ==