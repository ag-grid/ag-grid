import {Module, ModuleNames} from "@ag-grid-community/core";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: {'infinite': InfiniteRowModel}
};
