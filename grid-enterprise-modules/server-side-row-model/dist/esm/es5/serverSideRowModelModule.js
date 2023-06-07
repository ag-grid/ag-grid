import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import { StoreUtils } from "./serverSideRowModel/stores/storeUtils";
import { BlockUtils } from "./serverSideRowModel/blocks/blockUtils";
import { NodeManager } from "./serverSideRowModel/nodeManager";
import { TransactionManager } from "./serverSideRowModel/transactionManager";
import { ExpandListener } from "./serverSideRowModel/listeners/expandListener";
import { SortListener } from "./serverSideRowModel/listeners/sortListener";
import { FilterListener } from "./serverSideRowModel/listeners/filterListener";
import { StoreFactory } from "./serverSideRowModel/stores/storeFactory";
import { ListenerUtils } from "./serverSideRowModel/listeners/listenerUtils";
import { ServerSideSelectionService } from "./serverSideRowModel/services/serverSideSelectionService";
import { VERSION } from "./version";
export var ServerSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [ServerSideRowModel, ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils, ServerSideSelectionService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2lkZVJvd01vZGVsTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDL0UsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUN0RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFXO0lBQzVDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsd0JBQXdCO0lBQ2hELFFBQVEsRUFBRSxZQUFZO0lBQ3RCLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsa0JBQWtCO1FBQzdHLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLDBCQUEwQixDQUFDO0lBQzVFLGdCQUFnQixFQUFFO1FBQ2Qsb0JBQW9CO0tBQ3ZCO0NBQ0osQ0FBQyJ9