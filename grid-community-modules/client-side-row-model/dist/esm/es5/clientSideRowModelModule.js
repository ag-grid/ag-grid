import { ModuleNames } from "@ag-grid-community/core";
import { ClientSideRowModel } from "./clientSideRowModel/clientSideRowModel";
import { FilterStage } from "./clientSideRowModel/filterStage";
import { SortStage } from "./clientSideRowModel/sortStage";
import { FlattenStage } from "./clientSideRowModel/flattenStage";
import { SortService } from "./clientSideRowModel/sortService";
import { FilterService } from "./clientSideRowModel/filterService";
import { ImmutableService } from "./clientSideRowModel/immutableService";
import { VERSION } from "./version";
export var ClientSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZVJvd01vZGVsTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDakUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFXO0lBQzVDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsd0JBQXdCO0lBQ2hELFFBQVEsRUFBRSxZQUFZO0lBQ3RCLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUM7Q0FDbEgsQ0FBQyJ9