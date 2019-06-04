import { Grid, Module } from "ag-grid-community";
import { RangeChartService } from "../chartAdaptor/rangeChartService";
import { ModuleNames } from "ag-grid-community";

export const ChartsModule: Module = {
    moduleName: ModuleNames.ChartsModule,
    enterpriseBeans: [
        RangeChartService
    ],
    enterpriseComponents: [
    ]
};

Grid.addModule([ChartsModule]);