import { Navigator } from '../chart/navigator/navigator';
import { registerModule } from './module';
export var CHART_NAVIGATOR_MODULE = {
    type: 'root',
    optionsKey: 'navigator',
    packageType: 'community',
    chartTypes: ['cartesian'],
    initialiseModule: function (ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};
registerModule(CHART_NAVIGATOR_MODULE);
