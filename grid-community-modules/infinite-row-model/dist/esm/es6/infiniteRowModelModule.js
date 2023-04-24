import { ModuleNames } from "@ag-grid-community/core";
import { InfiniteRowModel } from "./infiniteRowModel/infiniteRowModel";
import { VERSION } from "./version";
export const InfiniteRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
};
