import {Module, ModuleNames, Grid, ModuleRegistry} from "ag-grid-community";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: { 'infinite': InfiniteRowModel }
};

ModuleRegistry.register(InfiniteRowModelModule);
