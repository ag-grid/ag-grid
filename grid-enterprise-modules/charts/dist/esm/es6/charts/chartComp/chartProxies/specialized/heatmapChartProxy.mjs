import { AgCharts, } from 'ag-charts-community';
import { ChartProxy } from '../chartProxy.mjs';
import { flatMap } from '../../utils/array.mjs';
export const HEATMAP_CATEGORY_KEY = 'AG-GRID-DEFAULT-HEATMAP-CATEGORY-KEY';
export const HEATMAP_SERIES_KEY = 'AG-GRID-DEFAULT-HEATMAP-SERIES-KEY';
export const HEATMAP_VALUE_KEY = 'AG-GRID-DEFAULT-HEATMAP-VALUE-KEY';
export class HeatmapChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
    }
    update(params) {
        const xSeriesKey = HEATMAP_SERIES_KEY;
        const xValueKey = HEATMAP_VALUE_KEY;
        const yKey = HEATMAP_CATEGORY_KEY;
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, xSeriesKey, xValueKey, yKey), data: this.getData(params, xSeriesKey, xValueKey, yKey) });
        AgCharts.update(this.getChartRef(), options);
    }
    getSeries(params, xSeriesKey, xValueKey, yKey) {
        const [category] = params.categories;
        return [
            {
                type: this.standaloneChartType,
                // The axis keys reference synthetic fields based on the category values and series column names
                yKey,
                xKey: xSeriesKey,
                // The color key references a synthetic field based on the series column value for a specific cell
                colorKey: xValueKey,
                yName: category.name,
                // We don't know how to label the 'x' series, as it is a synthetic series created from the set of all input columns
                // In future releases we may want to consider inferring the series label from column groupings etc
                xName: undefined,
                colorName: undefined,
            },
        ];
    }
    getData(params, xSeriesKey, xValueKey, yKey) {
        const [category] = params.categories;
        // Heatmap chart expects a flat array of data, with each row representing a single cell in the heatmap
        // This means we need to explode the list of input rows into their individual cells
        return flatMap(params.data, (datum, index) => {
            // We need to create a unique y value object for each row to prevent unintended category grouping
            // when there are multiple rows with the same category value
            const value = datum[category.id];
            const valueString = value == null ? '' : String(value);
            const yValue = { id: index, value, toString: () => valueString };
            // Return a flat list of output data items corresponding to each cell,
            // appending the synthetic series and category fields to the cell data
            return params.fields.map(({ colId, displayName }) => (Object.assign(Object.assign({}, datum), { [xSeriesKey]: displayName, [xValueKey]: datum[colId], [yKey]: yValue })));
        });
    }
    getChartThemeDefaults() {
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
    transformData(data, categoryKey, categoryAxis) {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    }
    crossFilteringReset() {
        // cross filtering is not currently supported in heatmap charts
    }
}
function renderHeatmapTooltip(params) {
    const { xKey, yKey, colorKey, yName, seriesId, datum } = params;
    const item = datum[seriesId];
    const table = [
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
function sanitizeHtml(input) {
    const ESCAPED_CHARS = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    const characterClass = `[${Object.keys(ESCAPED_CHARS).join('')}]`;
    const pattern = new RegExp(characterClass, 'g');
    return input.replace(pattern, (char) => ESCAPED_CHARS[char]);
}
