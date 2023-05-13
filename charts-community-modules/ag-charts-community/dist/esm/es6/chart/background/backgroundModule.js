import { Background } from './background';
import { registerModule } from '../../util/module';
export const CHART_BACKGROUND_MODULE = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'community',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    initialiseModule(ctx) {
        return {
            instance: new Background(ctx),
        };
    },
};
registerModule(CHART_BACKGROUND_MODULE);
