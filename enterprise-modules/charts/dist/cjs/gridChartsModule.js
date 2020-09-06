"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var chartService_1 = require("./chartAdaptor/chartService");
var chartTranslator_1 = require("./chartAdaptor/chartComp/chartTranslator");
var range_selection_1 = require("@ag-grid-enterprise/range-selection");
exports.GridChartsModule = {
    moduleName: core_1.ModuleNames.GridChartsModule,
    beans: [
        chartService_1.ChartService, chartTranslator_1.ChartTranslator
    ],
    dependantModules: [
        range_selection_1.RangeSelectionModule,
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=gridChartsModule.js.map