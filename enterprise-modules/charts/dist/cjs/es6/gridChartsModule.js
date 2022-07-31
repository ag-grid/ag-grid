"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const chartService_1 = require("./charts/chartService");
const chartTranslationService_1 = require("./charts/chartComp/services/chartTranslationService");
const chartCrossFilterService_1 = require("./charts/chartComp/services/chartCrossFilterService");
const range_selection_1 = require("@ag-grid-enterprise/range-selection");
exports.GridChartsModule = {
    moduleName: core_1.ModuleNames.GridChartsModule,
    beans: [
        chartService_1.ChartService, chartTranslationService_1.ChartTranslationService, chartCrossFilterService_1.ChartCrossFilterService
    ],
    dependantModules: [
        range_selection_1.RangeSelectionModule,
        core_2.EnterpriseCoreModule
    ]
};
