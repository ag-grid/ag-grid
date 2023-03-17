import { Navigator } from '../chart/navigator/navigator';
import { registerModule } from './module';
export const CHART_NAVIGATOR_MODULE = {
    type: 'root',
    optionsKey: 'navigator',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};
registerModule(CHART_NAVIGATOR_MODULE);
