import type {
    AgChartThemeOverrides,
    AgConeFunnelSeriesOptions,
    AgFunnelSeriesOptions,
    AgPyramidSeriesOptions,
    AgStandaloneChartOptions,
} from 'ag-charts-types';

import type { UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';

type FunnelTypes = AgPyramidSeriesOptions | AgFunnelSeriesOptions | AgConeFunnelSeriesOptions;
type FunnelChartTypes = FunnelTypes['type'];

export class FunnelChartProxy extends ChartProxy<AgStandaloneChartOptions, FunnelChartTypes> {
    protected getUpdateOptions(
        params: UpdateParams,
        commonChartOptions: AgStandaloneChartOptions
    ): AgStandaloneChartOptions {
        return {
            ...commonChartOptions,
            data: this.transformFunnelCategories(params),
            series: this.getSeries(params) as AgStandaloneChartOptions['series'],
        };
    }

    private transformFunnelCategories(params: UpdateParams): any[] {
        const { data } = params;
        const [{ id }] = params.categories;

        return data.map((d, index) => ({
            ...d,
            [id]: {
                name: d[id],
                id: index,
                toString: () => d[id],
            },
        }));
    }

    protected override getSeriesChartThemeDefaults(): AgChartThemeOverrides[FunnelChartTypes] {
        const config = {
            crosshair: {
                enabled: false,
            },
        };

        return {
            zoom: {
                enabled: false,
            },
            ...(this.chartType !== 'pyramid' && {
                axes: {
                    category: config,
                    number: config,
                },
            }),
        };
    }

    private getSeries(params: UpdateParams): FunnelTypes[] {
        const [{ id }] = params.categories;
        const [{ colId }] = params.fields;

        const series: FunnelTypes = {
            type: this.standaloneChartType as FunnelChartTypes,
            stageKey: id,
            valueKey: colId,
        };

        return [series];
    }
}
