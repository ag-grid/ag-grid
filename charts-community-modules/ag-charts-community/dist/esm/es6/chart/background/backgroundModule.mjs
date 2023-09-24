import { Background } from './background.mjs';
import { registerModule } from '../../util/module.mjs';
export const CHART_BACKGROUND_MODULE = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'community',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    instanceConstructor: Background,
};
registerModule(CHART_BACKGROUND_MODULE);
