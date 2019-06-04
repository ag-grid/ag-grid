"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var rangeChartService_1 = require("./dist/lib/chartAdaptor/rangeChartService");
exports.ChartsModule = {
    moduleName: "chartsModule" /* ChartsModule */,
    enterpriseBeans: [
        rangeChartService_1.RangeChartService
    ],
    enterpriseComponents: []
};
ag_grid_community_1.Grid.addModule([exports.ChartsModule]);
