import type { _ModuleSupport } from 'ag-charts-community';
import { _Scale } from 'ag-charts-community';
import { GradientLegend } from './gradientLegend';

export const GradientLegendModule: _ModuleSupport.LegendModule = {
    type: 'legend',
    optionsKey: 'legend',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],

    identifier: 'gradient',
    instanceConstructor: GradientLegend,
};
