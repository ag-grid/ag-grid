import {Module, ModuleNames, Grid} from "ag-grid-community";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule
};

Grid.addModule([InfiniteRowModelModule]);
Grid.addRowModelClass('infinite', InfiniteRowModel);
