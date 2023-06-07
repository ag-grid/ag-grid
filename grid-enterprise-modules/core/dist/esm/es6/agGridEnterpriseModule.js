import { ModuleNames } from "@ag-grid-community/core";
import { GridLicenseManager as LicenseManager } from "./license/gridLicenseManager";
import { WatermarkComp } from "./license/watermark";
export { WatermarkComp } from "./license/watermark";
import { VERSION } from "./version";
export const EnterpriseCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: WatermarkComp }
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdHcmlkRW50ZXJwcmlzZU1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hZ0dyaWRFbnRlcnByaXNlTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLElBQUksY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDcEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXBELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFXO0lBQ3hDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsb0JBQW9CO0lBQzVDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQztJQUN2QixpQkFBaUIsRUFBRTtRQUNmLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFO0tBQ2xFO0NBQ0osQ0FBQyJ9