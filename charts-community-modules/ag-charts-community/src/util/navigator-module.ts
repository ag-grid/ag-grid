import { Navigator } from '../chart/navigator/navigator';
import { Module, registerModule } from './module';

export const CHART_NAVIGATOR_MODULE: Module = {
    type: 'root',
    optionsKey: 'navigator',
    packageType: 'community',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};

registerModule(CHART_NAVIGATOR_MODULE);
