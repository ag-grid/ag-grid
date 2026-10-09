import type { ChartType } from 'ag-grid-community';

import type { MiniChartSvgShape, MiniChartSvgSlot, MiniChartSvgTemplate } from './miniChartSvgTypes';

const fills = (index: number): MiniChartSvgSlot => ({ palette: 'fills', index });
const strokes = (index: number): MiniChartSvgSlot => ({ palette: 'strokes', index });

const OUTLINE = { 'stroke-width': 1, 'stroke-opacity': 0.75 };

const rectPath = (x1: number, y1: number, x2: number, y2: number): string =>
    `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;

/** A column or bar with corners (x1, y1) and (x2, y2), filled with the series colour. */
const rect = (x1: number, y1: number, x2: number, y2: number, series: number): MiniChartSvgShape => ({
    d: rectPath(x1, y1, x2, y2),
    fill: fills(series),
});

/** A histogram bin with corners (x1, y1) and (x2, y2), outlined like today's histogram series. */
const bin = (x1: number, y1: number, x2: number, y2: number): MiniChartSvgShape => ({
    d: rectPath(x1, y1, x2, y2),
    fill: fills(0),
    stroke: strokes(0),
    attrs: OUTLINE,
});

/** A line series, stroked with the series fill colour. */
const line = (d: string, series: number): MiniChartSvgShape => ({
    d,
    stroke: fills(series),
    attrs: { 'stroke-width': 3, 'stroke-linecap': 'round' },
});

/** A stacked area band, filled with the series colour. */
const area = (d: string, series: number): MiniChartSvgShape => ({ d, fill: fills(series) });

/** A translucent, outlined area series. */
const outlinedArea = (d: string, series: number): MiniChartSvgShape => ({
    d,
    fill: fills(series),
    stroke: strokes(series),
    attrs: { 'fill-opacity': 0.7, ...OUTLINE },
});

/** Thumbnail geometry for the chart types drawn as inline SVG in the chart settings panel. */
export const MINI_CHART_SVG_GEOMETRY: Partial<Record<ChartType, MiniChartSvgTemplate>> = {
    groupedColumn: {
        tooltip: 'groupedColumnTooltip',
        series: [rect(9, 29, 20, 53, 0), rect(24, 17, 34, 53, 1), rect(38, 5, 49, 53, 2)],
    },
    stackedColumn: {
        tooltip: 'stackedColumnTooltip',
        series: [
            rect(9, 29, 20, 53, 0),
            rect(24, 17, 34, 53, 0),
            rect(38, 5, 49, 53, 0),
            rect(9, 35, 20, 53, 1),
            rect(24, 26, 34, 53, 1),
            rect(38, 17, 49, 53, 1),
            rect(9, 47, 20, 53, 2),
            rect(24, 44, 34, 53, 2),
            rect(38, 41, 49, 53, 2),
        ],
    },
    normalizedColumn: {
        tooltip: 'normalizedColumnTooltip',
        series: [
            rect(9, 5, 20, 53, 0),
            rect(24, 5, 34, 53, 0),
            rect(38, 5, 49, 53, 0),
            rect(9, 24, 20, 53, 1),
            rect(24, 19, 34, 53, 1),
            rect(38, 15, 49, 53, 1),
            rect(9, 43, 20, 53, 2),
            rect(24, 34, 34, 53, 2),
            rect(38, 24, 49, 53, 2),
        ],
    },
    groupedBar: {
        tooltip: 'groupedBarTooltip',
        series: [rect(5, 9, 29, 20, 0), rect(5, 24, 41, 34, 1), rect(5, 38, 53, 49, 2)],
    },
    stackedBar: {
        tooltip: 'stackedBarTooltip',
        series: [
            rect(5, 9, 29, 20, 0),
            rect(5, 24, 41, 34, 0),
            rect(5, 38, 53, 49, 0),
            rect(5, 9, 23, 20, 1),
            rect(5, 24, 32, 34, 1),
            rect(5, 38, 41, 49, 1),
            rect(5, 9, 11, 20, 2),
            rect(5, 24, 14, 34, 2),
            rect(5, 38, 17, 49, 2),
        ],
    },
    normalizedBar: {
        tooltip: 'normalizedBarTooltip',
        series: [
            rect(5, 9, 53, 20, 0),
            rect(5, 24, 53, 34, 0),
            rect(5, 38, 53, 49, 0),
            rect(5, 9, 34, 20, 1),
            rect(5, 24, 39, 34, 1),
            rect(5, 38, 43, 49, 1),
            rect(5, 9, 15, 20, 2),
            rect(5, 24, 24, 34, 2),
            rect(5, 38, 34, 49, 2),
        ],
    },
    line: {
        tooltip: 'lineTooltip',
        clip: true,
        series: [
            line('M 5 46.143 L 29 32.429 L 53 18.714', 0),
            line('M 5 39.286 L 29 11.857 L 53 25.571', 1),
            line('M 5 18.714 L 29 32.429 L 53 46.143', 2),
        ],
    },
    stackedLine: {
        tooltip: 'stackedLineTooltip',
        clip: true,
        series: [
            line('M 5 49.308 L 29 41.923 L 53 34.538', 0),
            line('M 5 41.923 L 29 19.769 L 53 19.769', 1),
            line('M 5 23.462 L 29 8.692 L 53 16.077', 2),
        ],
    },
    normalizedLine: {
        tooltip: 'normalizedLineTooltip',
        clip: true,
        series: [
            line('M 5 50.423 L 29 44.302 L 53 32.06', 0),
            line('M 5 38.181 L 29 19.819 L 53 12.474', 1),
            line('M 5 7.577 L 29 7.577 L 53 7.577', 2),
        ],
    },
    area: {
        tooltip: 'groupedAreaTooltip',
        clip: true,
        series: [
            outlinedArea('M 5 46.143 L 29 32.429 L 53 18.714 L 53 53 L 29 53 L 5 53 L 5 46.143', 0),
            outlinedArea('M 5 39.286 L 29 11.857 L 53 25.571 L 53 53 L 29 53 L 5 53 L 5 39.286', 1),
            outlinedArea('M 5 18.714 L 29 32.429 L 53 46.143 L 53 53 L 29 53 L 5 53 L 5 18.714', 2),
        ],
    },
    stackedArea: {
        tooltip: 'stackedAreaTooltip',
        clip: true,
        series: [
            area('M 5 49.308 L 29 41.923 L 53 34.538 L 53 53 L 29 53 L 5 53 L 5 49.308', 0),
            area('M 5 41.923 L 29 19.769 L 53 19.769 L 53 34.538 L 29 41.923 L 5 49.308 L 5 41.923', 1),
            area('M 5 23.462 L 29 8.692 L 53 16.077 L 53 19.769 L 29 19.769 L 5 41.923 L 5 23.462', 2),
        ],
    },
    normalizedArea: {
        tooltip: 'normalizedAreaTooltip',
        clip: true,
        series: [
            area('M 5 50.423 L 29 44.302 L 53 32.06 L 53 56.544 L 29 56.544 L 5 56.544 L 5 50.423', 0),
            area('M 5 38.181 L 29 19.819 L 53 12.474 L 53 32.06 L 29 44.302 L 5 50.423 L 5 38.181', 1),
            area('M 5 7.577 L 29 7.577 L 53 7.577 L 53 12.474 L 29 19.819 L 5 38.181 L 5 7.577', 2),
        ],
    },
    histogram: {
        tooltip: 'histogramTooltip',
        series: [
            bin(5.5, 46.5, 11.5, 52.5),
            bin(12.5, 35.5, 18.5, 52.5),
            bin(19.5, 12.5, 25.5, 52.5),
            bin(26.5, 5.5, 31.5, 52.5),
            bin(32.5, 16.5, 38.5, 52.5),
            bin(39.5, 31.5, 45.5, 52.5),
            bin(46.5, 49.5, 52.5, 52.5),
        ],
    },
};
