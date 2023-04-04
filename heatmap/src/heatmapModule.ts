import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { HeatmapSeries } from './heatmapSeries';
import { heatmapDefaults } from './heatmapDefaults';
import { getHeatmapDefaultTheme, getHeatmapDarkTheme } from './heatmapThemes';


export const HeatmapModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'heatmap',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],
    initialiseModule(ctx) {
        const factory = () => new HeatmapSeries();
        ctx.seriesFactory.add(factory);
        ctx.defaults.add(heatmapDefaults);
        ctx.themes.chartTheme.add(getHeatmapDefaultTheme);
        ctx.themes.darkTheme.add(getHeatmapDarkTheme);
        
        return {
            instance: {
                update() {},
                destroy: () => {
                    ctx.seriesFactory.delete();
                },
            },
        };
    },
};
