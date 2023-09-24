import { ModuleNames } from "@ag-grid-community/core";
import { InfiniteRowModel } from "./infiniteRowModel/infiniteRowModel.mjs";
import { VERSION } from "./version.mjs";
export const InfiniteRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
};
