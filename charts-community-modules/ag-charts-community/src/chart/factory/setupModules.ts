import { REGISTERED_MODULES } from '../../util/module';
import { JSON_APPLY_PLUGINS } from '../chartOptions';
import { registerLegend } from './legendTypes';
import { registerSeries } from './seriesTypes';

export function setupModules() {
    for (const m of REGISTERED_MODULES) {
        if (m.factoryConstructors != null) {
            Object.assign(JSON_APPLY_PLUGINS.constructors, m.factoryConstructors);
        }

        if (m.type === 'series') {
            if (m.chartTypes.length > 1) throw new Error('AG Charts - Module definition error: ' + m.identifier);

            registerSeries(m.identifier, m.chartTypes[0], m.instanceConstructor, m.seriesDefaults, m.themeTemplate);
        }

        if (m.type === 'legend') {
            registerLegend(m.identifier, m.instanceConstructor);
        }
    }
}
