import { Background } from './background';
import { Module, registerModule } from '../../util/module';

export const CHART_BACKGROUND_MODULE: Module = {
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
