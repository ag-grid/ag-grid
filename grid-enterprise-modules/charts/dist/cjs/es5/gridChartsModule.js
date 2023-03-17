"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridChartsModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var chartService_1 = require("./charts/chartService");
var chartTranslationService_1 = require("./charts/chartComp/services/chartTranslationService");
var chartCrossFilterService_1 = require("./charts/chartComp/services/chartCrossFilterService");
var range_selection_1 = require("@ag-grid-enterprise/range-selection");
var agColorPicker_1 = require("./widgets/agColorPicker");
var agAngleSelect_1 = require("./widgets/agAngleSelect");
var version_1 = require("./version");
var validGridChartsVersion_1 = require("./utils/validGridChartsVersion");
exports.GridChartsModule = {
    version: version_1.VERSION,
    validate: function () {
        return validGridChartsVersion_1.validGridChartsVersion({
            gridVersion: version_1.VERSION,
            chartsVersion: chartService_1.ChartService.CHARTS_VERSION
        });
    },
    moduleName: core_1.ModuleNames.GridChartsModule,
    beans: [
        chartService_1.ChartService, chartTranslationService_1.ChartTranslationService, chartCrossFilterService_1.ChartCrossFilterService
    ],
    agStackComponents: [
        { componentName: 'AgColorPicker', componentClass: agColorPicker_1.AgColorPicker },
        { componentName: 'AgAngleSelect', componentClass: agAngleSelect_1.AgAngleSelect },
    ],
    dependantModules: [
        range_selection_1.RangeSelectionModule,
        core_2.EnterpriseCoreModule
    ]
};
