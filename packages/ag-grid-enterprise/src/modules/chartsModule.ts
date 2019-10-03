import { Grid, Module } from "ag-grid-community";
import { ChartService } from "../chartAdaptor/chartService";
import { ModuleNames } from "ag-grid-community";
import { ChartTranslator } from "../chartAdaptor/chartComp/chartTranslator";

export const ChartsModule: Module = {
    moduleName: ModuleNames.ChartsModule,
    beans: [
        ChartService, ChartTranslator
    ]
};

Grid.addModule([ChartsModule]);
