import { Module, ModuleNames, ModuleRegistry } from "ag-grid-community";
import { ChartService } from "./chartAdaptor/chartService";
import { ChartTranslator } from "./chartAdaptor/chartComp/chartTranslator";

export const GridChartsModule: Module = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator
    ]
};

ModuleRegistry.register(GridChartsModule);
