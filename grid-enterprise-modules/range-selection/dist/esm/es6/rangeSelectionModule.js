import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { RangeService } from "./rangeSelection/rangeService";
import { FillHandle } from "./rangeSelection/fillHandle";
import { RangeHandle } from "./rangeSelection/rangeHandle";
import { SelectionHandleFactory } from "./rangeSelection/selectionHandleFactory";
import { VERSION } from "./version";
export const RangeSelectionModule = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VTZWxlY3Rpb25Nb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmFuZ2VTZWxlY3Rpb25Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFcEMsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQVc7SUFDeEMsT0FBTyxFQUFFLE9BQU87SUFDaEIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxvQkFBb0I7SUFDNUMsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLHNCQUFzQixDQUFDO0lBQzdDLGlCQUFpQixFQUFFO1FBQ2YsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7UUFDN0QsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUU7S0FDbEU7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtLQUN2QjtDQUNKLENBQUMifQ==