"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var chartService_1 = require("./chartAdaptor/chartService");
var chartTranslator_1 = require("./chartAdaptor/chartComp/chartTranslator");
var grid_range_selection_1 = require("@ag-enterprise/grid-range-selection");
exports.GridChartsModule = {
    moduleName: grid_core_1.ModuleNames.GridChartsModule,
    beans: [
        chartService_1.ChartService, chartTranslator_1.ChartTranslator
    ],
    dependantModules: [
        grid_range_selection_1.RangeSelectionModule,
        grid_core_2.EnterpriseCoreModule
    ]
};
