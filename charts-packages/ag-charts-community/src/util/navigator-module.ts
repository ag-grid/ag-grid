import { Navigator } from '../chart/navigator/navigator';
import { Module, registerModule } from './module';

export const CHART_NAVIGATOR_MODULE: Module = {
    optionsKey: 'navigator',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};

registerModule(CHART_NAVIGATOR_MODULE);
