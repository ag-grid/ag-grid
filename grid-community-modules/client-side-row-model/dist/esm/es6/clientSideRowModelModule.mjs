import { ModuleNames } from "@ag-grid-community/core";
import { ClientSideRowModel } from "./clientSideRowModel/clientSideRowModel.mjs";
import { FilterStage } from "./clientSideRowModel/filterStage.mjs";
import { SortStage } from "./clientSideRowModel/sortStage.mjs";
import { FlattenStage } from "./clientSideRowModel/flattenStage.mjs";
import { SortService } from "./clientSideRowModel/sortService.mjs";
import { FilterService } from "./clientSideRowModel/filterService.mjs";
import { ImmutableService } from "./clientSideRowModel/immutableService.mjs";
import { VERSION } from "./version.mjs";
export const ClientSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
};
