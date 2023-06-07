import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { ContextMenuFactory } from "./menu/contextMenu";
import { MenuItemMapper } from "./menu/menuItemMapper";
import { VERSION } from "./version";
import { ChartMenuItemMapper } from "./menu/chartMenuItemMapper";
export var MenuModule = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudU1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZW51TW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUVqRSxNQUFNLENBQUMsSUFBTSxVQUFVLEdBQVc7SUFDOUIsT0FBTyxFQUFFLE9BQU87SUFDaEIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxVQUFVO0lBQ2xDLEtBQUssRUFBRSxDQUFDLHFCQUFxQixFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQztJQUN2RixnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtLQUN2QjtDQUNKLENBQUMifQ==