"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModules = void 0;
const module_1 = require("../../util/module");
const chartAxesTypes_1 = require("../chartAxesTypes");
const chartOptions_1 = require("../chartOptions");
const chartTypes_1 = require("./chartTypes");
const legendTypes_1 = require("./legendTypes");
const seriesTypes_1 = require("./seriesTypes");
function setupModules() {
    for (const m of module_1.REGISTERED_MODULES) {
        if (m.optionConstructors != null) {
            Object.assign(chartOptions_1.JSON_APPLY_PLUGINS.constructors, m.optionConstructors);
        }
        if (m.type === 'root') {
            if (m.themeTemplate) {
                for (const chartType of m.chartTypes) {
                    chartTypes_1.registerChartDefaults(chartType, m.themeTemplate);
                }
            }
        }
        if (m.type === 'series') {
            if (m.chartTypes.length > 1)
                throw new Error('AG Charts - Module definition error: ' + m.identifier);
            seriesTypes_1.registerSeries(m.identifier, m.chartTypes[0], m.instanceConstructor, m.seriesDefaults, m.themeTemplate);
        }
        if (m.type === 'axis') {
            if (m.themeTemplate) {
                for (const axisType of m.axisTypes) {
                    chartAxesTypes_1.registerAxisThemeTemplate(axisType, m.themeTemplate);
                }
            }
        }
        if (m.type === 'legend') {
            legendTypes_1.registerLegend(m.identifier, m.instanceConstructor);
        }
    }
}
exports.setupModules = setupModules;
