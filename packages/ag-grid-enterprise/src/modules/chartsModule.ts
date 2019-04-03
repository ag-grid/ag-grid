import {Grid, Module} from "ag-grid-community";
import {RangeChartService} from "../chartAdaptor/rangeChart/rangeChartService";
import {ChartControlComp} from "../chartAdaptor/chartControlComp";
import {ModuleNames} from "ag-grid-community";

export const ChartsModule: Module = {
    moduleName: ModuleNames.ChartsModule,
    enterpriseBeans: [
        RangeChartService
    ],
    enterpriseComponents: [
        {
            componentName: 'AgChartControl',
            theClass: ChartControlComp
        }
    ]
};

Grid.addModule([ChartsModule]);


