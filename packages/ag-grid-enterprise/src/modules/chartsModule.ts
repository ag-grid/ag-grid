import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {ChartService} from "../chartAdaptor/chartService";
import {ChartTranslator} from "../chartAdaptor/chartComp/chartTranslator";

export const ChartsModule: Module = {
    moduleName: ModuleNames.ChartsModule,
    beans: [
        ChartService, ChartTranslator
    ]
};

ModuleRegistry.register(ChartsModule);
