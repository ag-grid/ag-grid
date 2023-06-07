"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridChartsModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const chartService_1 = require("./charts/chartService");
const chartTranslationService_1 = require("./charts/chartComp/services/chartTranslationService");
const chartCrossFilterService_1 = require("./charts/chartComp/services/chartCrossFilterService");
const range_selection_1 = require("@ag-grid-enterprise/range-selection");
const agColorPicker_1 = require("./widgets/agColorPicker");
const agAngleSelect_1 = require("./widgets/agAngleSelect");
const version_1 = require("./version");
const validGridChartsVersion_1 = require("./utils/validGridChartsVersion");
exports.GridChartsModule = {
    version: version_1.VERSION,
    validate: () => {
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
