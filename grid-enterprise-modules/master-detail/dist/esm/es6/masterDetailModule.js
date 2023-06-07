import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { DetailCellRenderer } from "./masterDetail/detailCellRenderer";
import { DetailCellRendererCtrl } from "./masterDetail/detailCellRendererCtrl";
import { VERSION } from "./version";
export const MasterDetailModule = {
    version: VERSION,
    moduleName: ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer }
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: DetailCellRendererCtrl }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzdGVyRGV0YWlsTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21hc3RlckRldGFpbE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdkUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVwQyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBVztJQUN0QyxPQUFPLEVBQUUsT0FBTztJQUNoQixVQUFVLEVBQUUsV0FBVyxDQUFDLGtCQUFrQjtJQUMxQyxLQUFLLEVBQUUsRUFBRTtJQUNULGNBQWMsRUFBRTtRQUNaLEVBQUUsYUFBYSxFQUFFLHNCQUFzQixFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtLQUNoRjtJQUNELFdBQVcsRUFBRTtRQUNULEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRTtLQUNwRjtJQUNELGdCQUFnQixFQUFFO1FBQ2Qsb0JBQW9CO0tBQ3ZCO0NBQ0osQ0FBQyJ9