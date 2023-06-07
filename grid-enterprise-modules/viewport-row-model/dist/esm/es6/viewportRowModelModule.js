import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { VERSION } from "./version";
import { ViewportRowModel } from "./viewportRowModel/viewportRowModel";
export const ViewportRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRSb3dNb2RlbE1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3cG9ydFJvd01vZGVsTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRXZFLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFXO0lBQzFDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsc0JBQXNCO0lBQzlDLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLEtBQUssRUFBRSxDQUFDLGdCQUFnQixDQUFDO0lBQ3pCLGdCQUFnQixFQUFFO1FBQ2Qsb0JBQW9CO0tBQ3ZCO0NBQ0osQ0FBQyJ9