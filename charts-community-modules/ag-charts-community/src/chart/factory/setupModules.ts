import { REGISTERED_MODULES } from '../../util/module';
import { registerAxis, registerAxisThemeTemplate } from './axisTypes';
import { JSON_APPLY_PLUGINS } from '../chartOptions';
import { registerChartDefaults } from './chartTypes';
import { registerLegend } from './legendTypes';
import { registerSeries } from './seriesTypes';

export function setupModules() {
    for (const m of REGISTERED_MODULES) {
        if (JSON_APPLY_PLUGINS.constructors != null && m.optionConstructors != null) {
            Object.assign(JSON_APPLY_PLUGINS.constructors, m.optionConstructors);
        }

        if (m.type === 'root') {
            if (m.themeTemplate) {
                for (const chartType of m.chartTypes) {
                    registerChartDefaults(chartType, m.themeTemplate);
                }
            }
        }

        if (m.type === 'series') {
            if (m.chartTypes.length > 1) throw new Error('AG Charts - Module definition error: ' + m.identifier);

            registerSeries(
                m.identifier,
                m.chartTypes[0],
                m.instanceConstructor,
                m.seriesDefaults,
                m.themeTemplate,
                m.paletteFactory
            );
        }

        if (m.type === 'axis-option') {
            if (m.themeTemplate) {
                for (const axisType of m.axisTypes) {
                    registerAxisThemeTemplate(axisType, m.themeTemplate);
                }
            }
        }

        if (m.type === 'axis') {
            registerAxis(m.identifier, m.instanceConstructor);
            if (m.themeTemplate) {
                registerAxisThemeTemplate(m.identifier, m.themeTemplate);
            }
        }

        if (m.type === 'legend') {
            registerLegend(m.identifier, m.instanceConstructor);
        }
    }
}
