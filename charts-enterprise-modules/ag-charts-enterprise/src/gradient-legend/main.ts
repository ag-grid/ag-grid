import { _ModuleSupport, _Scale, _Theme } from 'ag-charts-community';
import { GradientLegend } from './gradientLegend';
import { GRADIENT_LEGEND_THEME } from './gradientLegendTheme';

export const GradientLegendModule: _ModuleSupport.LegendModule = {
    type: 'legend',
    optionsKey: 'legend',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],

    identifier: 'gradient',
    instanceConstructor: GradientLegend,

    themeTemplate: GRADIENT_LEGEND_THEME,
};
