import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: {'infinite': InfiniteRowModel}
};
