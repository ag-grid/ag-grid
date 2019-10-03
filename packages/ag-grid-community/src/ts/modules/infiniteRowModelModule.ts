import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {Grid} from "../grid";
import {InfiniteRowModel} from "../rowModels/infinite/infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    enterpriseBeans: [
    ],
    enterpriseComponents: [
    ]
};

Grid.addModule([InfiniteRowModelModule]);
