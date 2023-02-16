import { ModuleNames } from "@ag-grid-community/core";
import { InfiniteRowModel } from "./infiniteRowModel/infiniteRowModel";
import { VERSION } from "./version";
export var InfiniteRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: { infinite: InfiniteRowModel }
};
