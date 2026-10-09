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

/** A shape filled with the series colour, such as a pie sector, a marker or a funnel stage. */
const filled = (d: string, series: number, fillOpacity?: number): MiniChartSvgShape =>
    fillOpacity == null
        ? { d, fill: fills(series) }
        : { d, fill: fills(series), attrs: { 'fill-opacity': fillOpacity } };

/** A circular marker centred on (cx, cy), filled with the series colour. */
const dot = (cx: number, cy: number, r: number, series: number, fillOpacity?: number): MiniChartSvgShape =>
    filled(`M ${cx} ${cy} m ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`, series, fillOpacity);

const RADAR_OUTLINE = { 'stroke-width': 1, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' };

/** A radar line series, stroked with the series fill colour. */
const radarLine = (d: string, series: number): MiniChartSvgShape => ({
    d,
    stroke: fills(series),
    attrs: RADAR_OUTLINE,
});

/** A translucent, outlined radar area series. */
const radarArea = (d: string, series: number): MiniChartSvgShape => ({
    d,
    fill: fills(series),
    stroke: strokes(series),
    attrs: { 'fill-opacity': 0.8, ...RADAR_OUTLINE },
});

const DONUT: MiniChartSvgTemplate = {
    tooltip: 'donutTooltip',
    axes: 'none',
    series: [
        filled(
            'M 29.75 5.762 C 37.785 6.021 45.116 10.413 49.135 17.375 C 53.155 24.337 53.292 32.882 49.5 39.97 L 42.479 35.916 C 44.828 31.338 44.693 25.881 42.12 21.425 C 39.548 16.969 34.889 14.123 29.75 13.869 Z',
            0
        ),
        filled(
            'M 48.75 41.268 C 42.281 51.681 28.839 55.283 18.03 49.5 L 22.084 42.479 C 29.012 46.034 37.507 43.758 41.729 37.215 Z',
            1
        ),
        filled(
            'M 16.732 48.75 C 10.129 44.648 6.013 37.519 5.762 29.75 L 13.869 29.75 C 14.11 34.624 16.685 39.083 20.785 41.729 Z',
            2
        ),
        filled(
            'M 5.762 28.25 C 5.877 24.678 6.814 21.181 8.5 18.03 L 15.521 22.084 C 14.538 23.998 13.975 26.101 13.869 28.25 Z',
            3
        ),
        filled(
            'M 9.25 16.732 C 11.136 13.696 13.696 11.136 16.732 9.25 L 20.785 16.271 C 18.977 17.438 17.438 18.977 16.271 20.785 Z',
            4
        ),
        filled(
            'M 18.03 8.5 C 21.181 6.814 24.678 5.877 28.25 5.762 L 28.25 13.869 C 26.101 13.975 23.998 14.538 22.084 15.521 Z',
            5
        ),
    ],
};

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
    pie: {
        tooltip: 'pieTooltip',
        axes: 'none',
        series: [
            filled(
                'M 29.65 28.625 L 29.75 5.762 C 37.785 6.021 45.116 10.413 49.135 17.375 C 53.155 24.337 53.292 32.882 49.5 39.97 Z',
                0
            ),
            filled('M 29.194 29.724 L 48.75 41.268 C 42.281 51.681 28.839 55.283 18.03 49.5 Z', 1),
            filled('M 27.701 29.75 L 16.732 48.75 C 10.129 44.648 6.013 37.519 5.762 29.75 Z', 2),
            filled('M 26.201 28.25 L 5.762 28.25 C 5.877 24.678 6.814 21.181 8.5 18.03 Z', 3),
            filled('M 26.951 26.951 L 9.25 16.732 C 11.136 13.696 13.696 11.136 16.732 9.25 Z', 4),
            filled('M 28.25 26.201 L 18.03 8.5 C 21.181 6.814 24.678 5.877 28.25 5.762 Z', 5),
        ],
    },
    donut: DONUT,
    doughnut: DONUT,
    sunburst: {
        tooltip: 'sunburstTooltip',
        axes: 'none',
        series: [
            filled(
                'M 29.65 28.625 L 29.749 17.775 C 33.494 18.025 36.867 20.125 38.743 23.375 C 40.619 26.625 40.751 30.596 39.096 33.963 Z',
                0
            ),
            filled(
                'M 29.75 5.762 C 37.519 6.013 44.648 10.129 48.75 16.732 L 39.648 21.987 C 37.435 18.627 33.766 16.509 29.75 16.272 Z',
                0
            ),
            filled(
                'M 49.5 18.03 C 53.167 24.884 53.167 33.116 49.5 39.97 L 40.398 34.715 C 42.201 31.118 42.201 26.882 40.398 23.285 Z',
                0
            ),
            filled(
                'M 29 29.75 L 38.346 35.262 C 36.258 38.379 32.752 40.25 29 40.25 C 25.248 40.25 21.742 38.379 19.654 35.262 Z',
                1
            ),
            filled(
                'M 48.75 41.268 C 44.648 47.871 37.519 51.987 29.75 52.238 L 29.75 41.728 C 33.766 41.491 37.435 39.373 39.648 36.013 Z',
                1
            ),
            filled(
                'M 28.25 52.238 C 20.481 51.987 13.352 47.871 9.25 41.268 L 18.352 36.013 C 20.565 39.373 24.234 41.491 28.25 41.728 Z',
                1
            ),
            filled(
                'M 28.35 28.625 L 18.904 33.963 C 17.249 30.596 17.381 26.625 19.257 23.375 C 21.133 20.125 24.506 18.025 28.251 17.775 Z',
                2
            ),
            filled(
                'M 8.5 39.97 C 4.833 33.116 4.833 24.884 8.5 18.03 L 17.602 23.285 C 15.799 26.882 15.799 31.118 17.602 34.715 Z',
                2
            ),
            filled(
                'M 9.25 16.732 C 13.352 10.129 20.481 6.013 28.25 5.762 L 28.25 16.272 C 24.234 16.509 20.565 18.627 18.352 21.987 Z',
                2
            ),
        ],
    },
    nightingale: {
        tooltip: 'nightingaleTooltip',
        axes: 'polar',
        seriesOverAxes: true,
        series: [
            filled('M 29 29 L 22.143 29 C 22.143 27.305 22.77 25.671 23.904 24.412 Z', 0),
            filled('M 29 29 L 23.286 19.103 C 25.732 17.69 28.614 17.234 31.376 17.821 Z', 0),
            filled('M 29 29 L 34.143 20.092 C 36.344 21.363 37.997 23.404 38.782 25.822 Z', 0),
            filled('M 29 29 L 38.143 29 C 38.143 31.259 37.306 33.439 35.794 35.118 Z', 0),
            filled('M 29 29 L 33 35.928 C 31.288 36.917 29.27 37.236 27.337 36.825 Z', 0),
            filled('M 29 29 L 24.429 36.918 C 22.472 35.788 21.003 33.974 20.305 31.825 Z', 0),
            filled(
                'M 17.571 29 C 17.571 26.176 18.617 23.452 20.507 21.353 L 23.904 24.412 C 22.77 25.671 22.143 27.305 22.143 29 Z',
                1
            ),
            filled(
                'M 19.857 13.164 C 23.77 10.905 28.382 10.174 32.802 11.114 L 31.376 17.821 C 28.614 17.234 25.732 17.69 23.286 19.103 Z',
                1
            ),
            filled(
                'M 37 15.144 C 40.424 17.121 42.995 20.295 44.217 24.056 L 38.782 25.822 C 37.997 23.404 36.344 21.363 34.143 20.092 Z',
                1
            ),
            filled(
                'M 42.714 29 C 42.714 32.389 41.459 35.658 39.192 38.177 L 35.794 35.118 C 37.306 33.439 38.143 31.259 38.143 29 Z',
                1
            ),
            filled(
                'M 35.857 40.877 C 32.922 42.571 29.464 43.119 26.149 42.415 L 27.337 36.825 C 29.27 37.236 31.288 36.917 33 35.928 Z',
                1
            ),
            filled(
                'M 21.571 41.867 C 18.392 40.031 16.005 37.083 14.87 33.591 L 20.305 31.825 C 21.003 33.974 22.472 35.788 24.429 36.918 Z',
                1
            ),
            filled(
                'M 14.143 29 C 14.143 25.329 15.502 21.787 17.959 19.059 L 20.507 21.353 C 18.617 23.452 17.571 26.176 17.571 29 Z',
                2
            ),
            filled(
                'M 17 8.215 C 22.136 5.25 28.189 4.291 33.99 5.524 L 32.802 11.114 C 28.382 10.174 23.77 10.905 19.857 13.164 Z',
                2
            ),
            filled(
                'M 39.286 11.185 C 43.688 13.726 46.994 17.808 48.565 22.643 L 44.217 24.056 C 42.995 20.295 40.424 17.121 37 15.144 Z',
                2
            ),
            filled(
                'M 46.143 29 C 46.143 33.236 44.574 37.323 41.74 40.471 L 39.192 38.177 C 41.459 35.658 42.714 32.389 42.714 29 Z',
                2
            ),
            filled(
                'M 38.143 44.836 C 34.23 47.095 29.618 47.826 25.198 46.886 L 26.149 42.415 C 29.464 43.119 32.922 42.571 35.857 40.877 Z',
                2
            ),
            filled(
                'M 17.571 48.795 C 12.68 45.971 9.007 41.435 7.262 36.063 L 14.87 33.591 C 16.005 37.083 18.392 40.031 21.571 41.867 Z',
                2
            ),
        ],
    },
    radialBar: {
        tooltip: 'radialBarTooltip',
        axes: 'polar',
        seriesOverAxes: true,
        series: [
            filled('M 29 18.4 C 34.854 18.4 39.6 23.146 39.6 29 L 36.42 29 C 36.42 24.902 33.098 21.58 29 21.58 Z', 0),
            filled(
                'M 29 12.04 C 35.059 12.04 40.658 15.273 43.688 20.52 C 46.717 25.767 46.717 32.233 43.688 37.48 L 40.934 35.89 C 43.395 31.626 43.395 26.374 40.934 22.11 C 38.472 17.846 33.923 15.22 29 15.22 Z',
                0
            ),
            filled(
                'M 29 5.68 C 39.555 5.68 48.794 12.769 51.525 22.964 C 54.257 33.159 49.801 43.918 40.66 49.196 L 39.07 46.442 C 46.964 41.884 50.813 32.592 48.454 23.787 C 46.094 14.983 38.115 8.86 29 8.86 Z',
                0
            ),
            filled(
                'M 39.6 29 C 39.6 32.787 37.58 36.286 34.3 38.18 L 32.71 35.426 C 35.006 34.1 36.42 31.651 36.42 29 Z',
                1
            ),
            filled(
                'M 43.688 37.48 C 40.658 42.727 35.059 45.96 29 45.96 L 29 42.78 C 33.923 42.78 38.472 40.154 40.934 35.89 Z',
                1
            ),
            filled(
                'M 40.66 49.196 C 35.304 52.288 28.938 53.126 22.964 51.525 L 23.787 48.454 C 28.947 49.836 34.444 49.112 39.07 46.442 Z',
                1
            ),
            filled(
                'M 34.3 38.18 C 30.145 40.579 24.897 39.888 21.505 36.495 L 23.753 34.247 C 26.128 36.621 29.802 37.105 32.71 35.426 Z',
                2
            ),
            filled(
                'M 29 45.96 C 22.941 45.96 17.342 42.727 14.312 37.48 L 17.066 35.89 C 19.528 40.154 24.077 42.78 29 42.78 Z',
                2
            ),
            filled(
                'M 22.964 51.525 C 19.01 50.466 15.405 48.384 12.51 45.49 L 14.759 43.241 C 17.259 45.741 20.373 47.539 23.787 48.454 Z',
                2
            ),
        ],
    },
    radialColumn: {
        tooltip: 'radialColumnTooltip',
        axes: 'polar',
        seriesOverAxes: true,
        series: [
            filled('M 38.581 28.393 C 38.757 31.181 37.711 33.908 35.714 35.862 L 41.01 37.895 L 43.877 30.426 Z', 0),
            filled('M 34.316 36.994 C 31.99 38.541 29.105 38.998 26.414 38.245 L 27.552 45.429 L 35.454 44.177 Z', 0),
            filled('M 24.735 37.601 C 22.232 36.36 20.394 34.09 19.701 31.383 L 12.805 36.967 L 17.84 43.185 Z', 0),
            filled('M 19.419 29.607 C 19.243 26.819 20.289 24.092 22.286 22.138 L 19.977 21.252 L 17.11 28.721 Z', 0),
            filled('M 23.684 21.006 C 26.01 19.459 28.895 19.002 31.586 19.755 L 30.698 14.152 L 22.797 15.403 Z', 0),
            filled('M 33.265 20.399 C 35.768 21.64 37.606 23.91 38.299 26.617 L 42.086 23.55 L 37.052 17.333 Z', 0),
            filled('M 43.877 30.426 L 46.864 31.573 L 43.998 39.042 L 41.01 37.895 Z', 1),
            filled('M 35.454 44.177 L 35.954 47.338 L 28.053 48.589 L 27.552 45.429 Z', 1),
            filled('M 17.84 43.185 L 15.974 44.695 L 10.94 38.478 L 12.805 36.967 Z', 1),
            filled('M 17.11 28.721 L 12.629 27 L 15.496 19.532 L 19.977 21.252 Z', 1),
            filled('M 22.797 15.403 L 22.296 12.242 L 30.198 10.991 L 30.698 14.152 Z', 1),
            filled('M 37.052 17.333 L 39.539 15.319 L 44.573 21.536 L 42.086 23.55 Z', 1),
            filled('M 46.864 31.573 L 50.599 33.006 L 47.732 40.475 L 43.998 39.042 Z', 2),
            filled('M 35.954 47.338 L 36.455 50.498 L 28.553 51.75 L 28.053 48.589 Z', 2),
            filled('M 15.974 44.695 L 14.731 45.702 L 9.696 39.485 L 10.94 38.478 Z', 2),
            filled('M 12.629 27 L 5.907 24.42 L 8.774 16.952 L 15.496 19.532 Z', 2),
            filled('M 22.296 12.242 L 30.198 10.991 L 29.249 5.001 C 26.564 4.973 23.893 5.396 21.347 6.253 Z', 2),
            filled('M 39.539 15.319 L 44.573 21.536 L 49.908 17.216 C 48.589 14.877 46.888 12.775 44.873 10.999 Z', 2),
        ],
    },
    radarLine: {
        tooltip: 'radarLineTooltip',
        axes: 'polar',
        series: [
            radarLine(
                'M 29 9.8 L 42.135 18.525 L 47.719 33.272 L 36.289 44.136 L 20.669 46.299 L 10.281 33.272 L 15.865 18.525 L 29 9.8 Z',
                0
            ),
            dot(29, 9.8, 2, 0),
            dot(42.135, 18.525, 2, 0),
            dot(47.719, 33.272, 2, 0),
            dot(36.289, 44.136, 2, 0),
            dot(20.669, 46.299, 2, 0),
            dot(10.281, 33.272, 2, 0),
            dot(15.865, 18.525, 2, 0),
            dot(29, 9.8, 2, 0),
            radarLine(
                'M 29 14.6 L 44.011 17.029 L 40.699 31.67 L 39.413 50.623 L 22.752 41.974 L 12.621 32.738 L 21.494 23.014 L 29 14.6 Z',
                1
            ),
            dot(29, 14.6, 2, 1),
            dot(44.011, 17.029, 2, 1),
            dot(40.699, 31.67, 2, 1),
            dot(39.413, 50.623, 2, 1),
            dot(22.752, 41.974, 2, 1),
            dot(12.621, 32.738, 2, 1),
            dot(21.494, 23.014, 2, 1),
            dot(29, 14.6, 2, 1),
            radarLine(
                'M 29 29 L 34.629 24.511 L 36.019 30.602 L 34.207 39.812 L 24.835 37.649 L 19.641 31.136 L 25.247 26.007 L 29 29 Z',
                2
            ),
            dot(29, 29, 2, 2),
            dot(34.629, 24.511, 2, 2),
            dot(36.019, 30.602, 2, 2),
            dot(34.207, 39.812, 2, 2),
            dot(24.835, 37.649, 2, 2),
            dot(19.641, 31.136, 2, 2),
            dot(25.247, 26.007, 2, 2),
            dot(29, 29, 2, 2),
        ],
    },
    radarArea: {
        tooltip: 'radarAreaTooltip',
        axes: 'polar',
        series: [
            radarArea(
                'M 29 8.48 L 47.764 14.036 L 43.916 32.405 L 37.148 45.92 L 23.117 41.217 L 20.869 30.856 L 17.038 19.461 L 29 8.48 Z',
                0
            ),
            radarArea(
                'M 29 20.66 L 35.52 23.8 L 38.827 31.243 L 37.148 45.92 L 20.852 45.92 L 8.994 33.566 L 10.236 14.036 L 29 20.66 Z',
                1
            ),
            radarArea(
                'M 29 15.44 L 40.962 19.461 L 50.702 33.953 L 38.658 49.056 L 23.117 41.217 L 19.173 31.243 L 19.759 21.63 L 29 15.44 Z',
                2
            ),
        ],
    },
    scatter: {
        tooltip: 'scatterTooltip',
        clip: true,
        series: [
            dot(17.644, 11, 2.5, 0),
            dot(25.289, 36.2, 2.5, 1),
            dot(33.889, 42.2, 2.5, 2),
            dot(47.267, 18.2, 2.5, 3),
            dot(14.778, 43.4, 2.5, 4),
            dot(24.333, 23, 2.5, 5),
            dot(37.711, 30.2, 2.5, 6),
            dot(43.444, 47, 2.5, 7),
        ],
    },
    bubble: {
        tooltip: 'bubbleTooltip',
        clip: true,
        series: [
            dot(14.3, 38.6, 5, 0, 0.7),
            dot(31.5, 33.8, 7, 1, 0.7),
            dot(18.6, 14.6, 7, 2, 0.7),
            dot(44.4, 19.4, 5, 3, 0.7),
            dot(40.1, 38.6, 9, 4, 0.7),
        ],
    },
    rangeBar: {
        tooltip: 'rangeBarTooltip',
        series: [rect(9, 10, 20, 38, 0), rect(24, 15, 34, 48, 1), rect(38, 10, 49, 38, 2)],
    },
    rangeArea: {
        tooltip: 'rangeAreaTooltip',
        series: [
            filled('M 5 14.222 L 11 10 L 35 26.889 L 53 14.222 L 53 29 L 35 41.667 L 11 24.778 L 5 29', 0, 0.8),
            filled('M 5 20.556 L 11 16.333 L 35 33.222 L 53 20.556 L 53 35.333 L 35 48 L 11 31.111 L 5 35.333', 2, 0.8),
            filled('M 5 22.667 L 17 31.111 L 41 14.222 L 53 22.667 L 53 37.444 L 41 29 L 17 45.889 L 5 37.444', 1, 0.8),
        ],
    },
    columnLineCombo: {
        tooltip: 'columnLineComboTooltip',
        clip: true,
        series: [rect(15, 17, 24, 53, 0), rect(34, 5, 43, 53, 1), line('M 5 29 L 17 41 L 29 17 L 41 29 L 53 41', 2)],
    },
    areaColumnCombo: {
        tooltip: 'areaColumnComboTooltip',
        clip: true,
        series: [
            filled('M 5 13 L 17 21 L 29 5 L 41 13 L 53 21 L 53 53 L 5 53', 0, 0.8),
            rect(15, 29, 24, 53, 1),
            rect(34, 17, 43, 53, 2),
        ],
    },
    customCombo: {
        tooltip: 'customComboTooltip',
        clip: true,
        series: [
            rect(15, 17, 24, 53, 0),
            rect(34, 5, 43, 53, 1),
            line('M 5 29 L 17 41 L 29 17 L 41 29 L 53 41', 2),
            {
                d: 'M 25.76 43.46 L 31.27 48.53 M 49.86 22 L 49.86 22 C 49.02 21.318 47.896 21.096 46.86 21.41 L 46.86 21.41 C 45.555 21.773 44.388 22.518 43.51 23.55 L 25.51 43.8 L 25.43 43.89 L 23.01 51.89 L 22.83 52.46 L 31.02 48.86 L 49.02 28.52 L 49.02 28.52 C 49.941 27.522 50.543 26.272 50.75 24.93 L 50.75 24.93 C 50.954 23.866 50.621 22.771 49.86 22 Z M 41.76 25.5 L 47.34 30.5 M 40.74 26.65 L 46.25 31.71',
                fill: 'whitesmoke',
                stroke: 'darkslategrey',
                attrs: { 'stroke-width': 1 },
            },
        ],
    },
    funnel: {
        tooltip: 'funnelTooltip',
        clip: true,
        axes: 'none',
        series: [
            filled('M 53 5 L 53 18.241 L 5 18.241 L 5 5 M 53 18.241', 0),
            filled('M 48.2 21.552 L 48.2 34.793 L 9.8 34.793 L 9.8 21.552 M 48.2 34.793', 0),
            filled('M 39.2 38.103 L 39.2 53 L 18.8 53 L 18.8 38.103 M 39.2 53', 0),
        ],
    },
    coneFunnel: {
        tooltip: 'coneFunnelTooltip',
        clip: true,
        axes: 'none',
        series: [
            filled('M 53 5 L 42.2 19.897 L 15.8 19.897 L 5 5 M 42.2 19.897', 0),
            filled('M 42.2 19.897 L 33.2 38.103 L 24.8 38.103 L 15.8 19.897 M 33.2 38.103', 0, 0.8),
            filled('M 33.2 38.103 L 33.2 53 L 24.8 53 L 24.8 38.103 M 33.2 53', 0, 0.6),
        ],
    },
    pyramid: {
        tooltip: 'pyramidTooltip',
        clip: true,
        axes: 'none',
        series: [
            filled('M 29 5 L 35.4 18.241 L 22.6 18.241 M 35.4 18.241', 0),
            filled('M 37 21.552 L 43.4 34.793 L 14.6 34.793 L 21 21.552 M 43.4 34.793', 1),
            filled('M 45 38.103 L 53 53 L 5 53 L 13 38.103 M 53 53', 2),
        ],
    },
};
