import {
    AgCharts,
    AgCartesianChartOptions,
    AgHeatmapSeriesOptions,
    AgChartThemeOverrides,
    AgHeatmapSeriesTooltipRendererParams,
    AgTooltipRendererResult,
} from 'ag-charts-community';
import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { flatMap } from '../../utils/array';

export const HEATMAP_SERIES_KEY = 'AG-GRID-DEFAULT-HEATMAP-SERIES-KEY';
export const HEATMAP_VALUE_KEY = 'AG-GRID-DEFAULT-HEATMAP-VALUE-KEY';

export class HeatmapChartProxy extends ChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public override update(params: UpdateParams): void {
        const xSeriesKey = HEATMAP_SERIES_KEY;
        const xValueKey = HEATMAP_VALUE_KEY;
        const options: AgCartesianChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            series: this.getSeries(params, xSeriesKey, xValueKey),
            data: this.getData(params, xSeriesKey, xValueKey),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    protected getSeries(params: UpdateParams, xSeriesKey: string, xValueKey: string): AgHeatmapSeriesOptions[] {
        const [category] = params.categories;
        return [
            {
                type: this.standaloneChartType as AgHeatmapSeriesOptions['type'],
                yKey: category.id,
                yName: category.name,
                xKey: xSeriesKey,
                colorKey: xValueKey,
                // We don't know how to label the 'x' series, as it is a synthetic series created from the set of all input columns
                // In future releases we may want to consider inferring the series label from column groupings etc
                xName: undefined,
                colorName: undefined,
            },
        ];
    }

    protected getData(params: UpdateParams, xSeriesKey: string, xValueKey: string): any[] {
        return flatMap(params.data, (row) =>
            params.fields.map(({ colId, displayName }) => ({
                ...row,
                [xSeriesKey]: displayName,
                [xValueKey]: row[colId],
            }))
        );
    }

    protected override getChartThemeDefaults(): AgChartThemeOverrides | undefined {
        return {
            heatmap: {
                gradientLegend: {
                    gradient: {
                        preferredLength: 200,
                    },
                },
                series: {
                    tooltip: {
                        renderer: renderHeatmapTooltip,
                    },
                },
            },
        };
    }

    protected override transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[] {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    }

    public override crossFilteringReset(): void {
        // cross filtering is not currently supported in heatmap charts
    }
}

function renderHeatmapTooltip(params: AgHeatmapSeriesTooltipRendererParams): string | AgTooltipRendererResult {
    const { xKey, yKey, colorKey, yName, seriesId, datum } = params;
    const item = datum[seriesId];
    const table: Array<{ label: string; value: string | undefined }> = [
        { label: yName, value: item[yKey] },
        { label: item[xKey], value: colorKey && item[colorKey] },
    ];
    const html = table
        .map(({ label, value }) => `<b>${sanitizeHtml(String(label))}:</b> ${sanitizeHtml(String(value))}`)
        .join('<br>');
    return {
        title: '',
        content: html,
    };
}

function sanitizeHtml(input: string): string {
    const ESCAPED_CHARS = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    const characterClass = `[${Object.keys(ESCAPED_CHARS).join('')}]`;
    const pattern = new RegExp(characterClass, 'g');
    return input.replace(pattern, (char: keyof typeof ESCAPED_CHARS) => ESCAPED_CHARS[char]);
}
