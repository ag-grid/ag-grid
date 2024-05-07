import { Module, ModuleNames } from "@ag-grid-community/core";
import { ClientSideRowModel } from "./clientSideRowModel/clientSideRowModel";
import { SortStage } from "./clientSideRowModel/sortStage";
import { FlattenStage } from "./clientSideRowModel/flattenStage";
import { SortService } from "./clientSideRowModel/sortService";
import { ImmutableService } from "./clientSideRowModel/immutableService";
import { VERSION } from "./version";

export const ClientSideRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, SortStage, FlattenStage, SortService, ImmutableService],
};
