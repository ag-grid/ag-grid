import {Module, ModuleNames} from "@ag-community/grid-core";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: {'infinite': InfiniteRowModel}
};
