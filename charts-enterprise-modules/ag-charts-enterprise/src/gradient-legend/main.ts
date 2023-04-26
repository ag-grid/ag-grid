import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { GradientLegend } from './gradientLegend';

export const GradientLegendModule: _ModuleSupport.LegendModule = {
    type: 'legend',
    optionsKey: 'gradient',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    initialiseModule(ctx) {
        ctx.legendFactory.add((ctx) => new GradientLegend(ctx));

        return {
            instance: {
                update() {},
                destroy: () => {
                    ctx.legendFactory.delete();
                },
            },
        };
    },
};
