import {ChartProxy, ChartProxyParams, UpdateParams} from '../chartProxy';
import {
    AgNightingaleSeriesOptions,
    AgPolarAxisOptions,
    AgPolarChartOptions,
    AgRadarAreaSeriesOptions,
    AgRadarLineSeriesOptions,
    AgRadialBarSeriesOptions,
    AgRadialColumnSeriesOptions
} from 'ag-charts-community';

type AgPolarSeriesOptions =
    AgRadarLineSeriesOptions |
    AgRadarAreaSeriesOptions |
    AgNightingaleSeriesOptions |
    AgRadialBarSeriesOptions |
    AgRadialColumnSeriesOptions;

export class PolarChartProxy extends ChartProxy<AgPolarChartOptions, 'radar-line' | 'radar-area' | 'nightingale' | 'radial-column' | 'radial-bar'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(_: UpdateParams): AgPolarAxisOptions[] {
        const radialBar = this.standaloneChartType === 'radial-bar';
        return [
            {type: radialBar ? 'angle-number' : 'angle-category'},
            {type: radialBar ? 'radius-category' : 'radius-number'},
        ];
    }

    public getSeries(params: UpdateParams): AgPolarSeriesOptions[] {
        const {fields} = params;
        const [category] = params.categories;
        const radialBar = this.standaloneChartType === 'radial-bar';

        return fields.map(f => ({
            type: this.standaloneChartType as AgRadarAreaSeriesOptions['type'],
            angleKey: radialBar ? f.colId : category.id,
            angleName: radialBar ? (f.displayName ?? undefined) : category.name,
            radiusKey: radialBar ? category.id : f.colId,
            radiusName: radialBar ? category.name : (f.displayName ?? undefined),
        }));
    }

    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgPolarChartOptions): AgPolarChartOptions {
        const axes = this.getAxes(params);

        return {
            ...commonChartOptions,
            data: this.getData(params, axes),
            axes,
            series: this.getSeries(params),
        };
    }

    private getData(params: UpdateParams, axes: AgPolarAxisOptions[]): any[] {
        const isCategoryAxis = axes.some((axis) => axis.type === 'angle-category' || axis.type === 'radius-category');
        if (isCategoryAxis) {
            const [category] = params.categories;
            return this.transformCategoryData(params.data, category.id);
        } else {
            return params.data;
        }
    }
}
