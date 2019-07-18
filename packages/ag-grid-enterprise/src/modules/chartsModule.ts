import { Grid, Module } from "ag-grid-community";
import { RangeChartService } from "../chartAdaptor/rangeChartService";
import { ModuleNames } from "ag-grid-community";
import { ChartTranslator } from "../chartAdaptor/chartComp/chartTranslator";

export const ChartsModule: Module = {
    moduleName: ModuleNames.ChartsModule,
    enterpriseBeans: [
        RangeChartService, ChartTranslator
    ],
    enterpriseComponents: [
    ]
};

Grid.addModule([ChartsModule]);