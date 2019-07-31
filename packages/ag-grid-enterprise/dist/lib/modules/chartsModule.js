// ag-grid-enterprise v21.1.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var rangeChartService_1 = require("../chartAdaptor/rangeChartService");
var chartTranslator_1 = require("../chartAdaptor/chartComp/chartTranslator");
exports.ChartsModule = {
    moduleName: "chartsModule" /* ChartsModule */,
    enterpriseBeans: [
        rangeChartService_1.RangeChartService, chartTranslator_1.ChartTranslator
    ],
    enterpriseComponents: []
};
ag_grid_community_1.Grid.addModule([exports.ChartsModule]);
