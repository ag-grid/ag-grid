import {Module, ModuleNames, Grid} from "ag-grid-community";
import {ClientSideRowModel} from "./clientSideRowModel";
import {FilterStage} from "./filterStage";
import {SortStage} from "./sortStage";
import {FlattenStage} from "./flattenStage";
import {SortService} from "./sortService";
import {FilterService} from "./filterService";
import {ImmutableService} from "./immutableService";

export const ClientSideRowModelModule: Module = {
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService]
};

Grid.addModule([ClientSideRowModelModule]);
Grid.addRowModelClass('clientSide', ClientSideRowModel);
