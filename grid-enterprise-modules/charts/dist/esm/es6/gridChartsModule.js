import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslationService } from "./charts/chartComp/services/chartTranslationService";
import { ChartCrossFilterService } from "./charts/chartComp/services/chartCrossFilterService";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { VERSION as GRID_VERSION } from "./version";
import { validGridChartsVersion } from "./utils/validGridChartsVersion";
export const GridChartsModule = {
    version: GRID_VERSION,
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartService.CHARTS_VERSION
        });
    },
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslationService, ChartCrossFilterService
    ],
    agStackComponents: [
        { componentName: 'AgColorPicker', componentClass: AgColorPicker },
        { componentName: 'AgAngleSelect', componentClass: AgAngleSelect },
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZENoYXJ0c01vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmlkQ2hhcnRzTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDOUYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFFOUYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsT0FBTyxJQUFJLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUV4RSxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBVztJQUNwQyxPQUFPLEVBQUUsWUFBWTtJQUNyQixRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ1gsT0FBTyxzQkFBc0IsQ0FBQztZQUMxQixXQUFXLEVBQUUsWUFBWTtZQUN6QixhQUFhLEVBQUUsWUFBWSxDQUFDLGNBQWM7U0FDN0MsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELFVBQVUsRUFBRSxXQUFXLENBQUMsZ0JBQWdCO0lBQ3hDLEtBQUssRUFBRTtRQUNILFlBQVksRUFBRSx1QkFBdUIsRUFBRSx1QkFBdUI7S0FDakU7SUFDRCxpQkFBaUIsRUFBRTtRQUNmLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFO1FBQ2pFLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFO0tBQ3BFO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDZCxvQkFBb0I7UUFDcEIsb0JBQW9CO0tBQ3ZCO0NBQ0osQ0FBQyJ9