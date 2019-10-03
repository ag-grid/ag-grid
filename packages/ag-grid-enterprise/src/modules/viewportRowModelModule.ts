import {Grid, Module, ModuleNames} from "ag-grid-community";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    enterpriseBeans: [
    ],
    enterpriseComponents: [
    ]
};

Grid.addModule([ViewportRowModelModule]);
