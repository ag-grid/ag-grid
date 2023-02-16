import { Navigator } from '../chart/navigator/navigator';
import { registerModule } from './module';
export var CHART_NAVIGATOR_MODULE = {
    optionsKey: 'navigator',
    chartTypes: ['cartesian'],
    initialiseModule: function (ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};
registerModule(CHART_NAVIGATOR_MODULE);
