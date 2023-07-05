import { Background } from './background';
import type { Module } from '../../util/module';
import { registerModule } from '../../util/module';

export const CHART_BACKGROUND_MODULE: Module = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'community',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    instanceConstructor: Background,
};

registerModule(CHART_BACKGROUND_MODULE);
