import type {
    AgChartThemeOverrides,
    AgConeFunnelSeriesOptions,
    AgFunnelSeriesOptions,
    AgPyramidSeriesOptions,
    AgStandaloneChartOptions,
} from 'ag-charts-types';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';

type FunnelTypes = AgPyramidSeriesOptions | AgFunnelSeriesOptions | AgConeFunnelSeriesOptions;
type FunnelChartTypes = FunnelTypes['type'];

export class FunnelChartProxy extends ChartProxy<AgStandaloneChartOptions, FunnelChartTypes> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected getUpdateOptions(
        params: UpdateParams,
        commonChartOptions: AgStandaloneChartOptions
    ): AgStandaloneChartOptions {
        return {
            ...commonChartOptions,
            data: params.data,
            series: this.getSeries(params) as AgStandaloneChartOptions['series'],
        };
    }

    protected override getSeriesChartThemeDefaults(): AgChartThemeOverrides[FunnelChartTypes] {
        return {
            axes: {
                category: {
                    crosshair: {
                        enabled: false,
                    },
                },
                number: {
                    crosshair: {
                        enabled: false,
                    },
                },
            },
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
