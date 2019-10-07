import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {Grid} from "../grid";
import {InfiniteRowModel} from "./infiniteRowModel/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule
};

Grid.addModule([InfiniteRowModelModule]);
Grid.addRowModelClass('infinite', InfiniteRowModel);
