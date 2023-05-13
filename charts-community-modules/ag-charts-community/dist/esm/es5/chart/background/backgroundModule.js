import { Background } from './background';
import { registerModule } from '../../util/module';
export var CHART_BACKGROUND_MODULE = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'community',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    initialiseModule: function (ctx) {
        return {
            instance: new Background(ctx),
        };
    },
};
registerModule(CHART_BACKGROUND_MODULE);
