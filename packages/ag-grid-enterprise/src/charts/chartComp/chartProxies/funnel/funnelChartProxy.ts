import type { AgPyramidSeriesOptions, AgStandaloneChartOptions } from 'ag-charts-types';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';

export class FunnelChartProxy extends ChartProxy<AgStandaloneChartOptions, 'funnel' | 'cone-funnel' | 'pyramid'> {
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
            series: this.getSeries(params),
        };
    }

    private getSeries(params: UpdateParams): AgPyramidSeriesOptions[] {
        const [groupField] = params.categories;
        const [valueField] = params.fields;

        const series: AgPyramidSeriesOptions = {
            type: this.standaloneChartType as AgPyramidSeriesOptions['type'],
            stageKey: groupField.id,
            stageLabel: {
                enabled: true,
            },
            valueKey: valueField.colId,
            label: {
                enabled: true,
            },
        };

        return [series];
    }
}
