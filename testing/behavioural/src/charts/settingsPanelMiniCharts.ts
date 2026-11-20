import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgChartTheme } from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType, GridApi, GridOptions, SeriesChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/** Fixtures and readers shared by the chart settings panel mini chart suites, split across files to run in parallel. */

export const COLUMN_DEFS: GridOptions['columnDefs'] = [
    { field: 'country', chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
];

export const ROW_DATA = [
    { country: 'Russia', gold: 3, silver: 1, bronze: 5 },
    { country: 'USA', gold: 4, silver: 2, bronze: 3 },
    { country: 'Norway', gold: 7, silver: 5, bronze: 1 },
];

export const PLOT_AREA = '5 5 48 48';

export interface SvgCase {
    type: ChartType;
    label: string;
    tooltip: string;
    paths: number;
    axes?: 'polar' | 'none';
    seriesOverAxes?: true;
    /** The clip rectangle's `viewBox`. */
    clip?: string;
}

export const SVG_CASES: SvgCase[] = [
    { type: 'groupedColumn', label: 'Grouped Column', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedColumn', label: 'Stacked Column', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedColumn', label: '100% Stacked Column', tooltip: '100% Stacked', paths: 9 },
    { type: 'groupedBar', label: 'Grouped Bar', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedBar', label: 'Stacked Bar', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedBar', label: '100% Stacked Bar', tooltip: '100% Stacked', paths: 9 },
    { type: 'line', label: 'Line', tooltip: 'Line', paths: 3, clip: PLOT_AREA },
    { type: 'stackedLine', label: 'Stacked Line', tooltip: 'Stacked', paths: 3, clip: PLOT_AREA },
    { type: 'normalizedLine', label: '100% Stacked Line', tooltip: '100% Stacked', paths: 3, clip: PLOT_AREA },
    { type: 'area', label: 'Area', tooltip: 'Area', paths: 3, clip: PLOT_AREA },
    { type: 'stackedArea', label: 'Stacked Area', tooltip: 'Stacked', paths: 3, clip: PLOT_AREA },
    { type: 'normalizedArea', label: '100% Stacked Area', tooltip: '100% Stacked', paths: 3, clip: PLOT_AREA },
    { type: 'histogram', label: 'Histogram', tooltip: 'Histogram', paths: 7 },
    { type: 'pie', label: 'Pie', tooltip: 'Pie', paths: 6, axes: 'none' },
    { type: 'donut', label: 'Donut', tooltip: 'Donut', paths: 6, axes: 'none' },
    { type: 'scatter', label: 'Scatter', tooltip: 'Scatter', paths: 8, clip: PLOT_AREA },
    { type: 'bubble', label: 'Bubble', tooltip: 'Bubble', paths: 5, clip: PLOT_AREA },
    { type: 'radarLine', label: 'Radar Line', tooltip: 'Radar Line', paths: 27, axes: 'polar' },
    { type: 'radarArea', label: 'Radar Area', tooltip: 'Radar Area', paths: 3, axes: 'polar' },
    {
        type: 'nightingale',
        label: 'Nightingale',
        tooltip: 'Nightingale',
        paths: 18,
        axes: 'polar',
        seriesOverAxes: true,
    },
    {
        type: 'radialColumn',
        label: 'Radial Column',
        tooltip: 'Radial Column',
        paths: 18,
        axes: 'polar',
        seriesOverAxes: true,
    },
    { type: 'radialBar', label: 'Radial Bar', tooltip: 'Radial Bar', paths: 9, axes: 'polar', seriesOverAxes: true },
    { type: 'rangeBar', label: 'Range Bar', tooltip: 'Range Bar', paths: 3 },
    { type: 'rangeArea', label: 'Range Area', tooltip: 'Range Area', paths: 3 },
    { type: 'sunburst', label: 'Sunburst', tooltip: 'Sunburst', paths: 9, axes: 'none' },
    { type: 'funnel', label: 'Funnel', tooltip: 'Funnel', paths: 3, axes: 'none', clip: PLOT_AREA },
    { type: 'coneFunnel', label: 'Cone Funnel', tooltip: 'Cone Funnel', paths: 3, axes: 'none', clip: PLOT_AREA },
    { type: 'pyramid', label: 'Pyramid', tooltip: 'Pyramid', paths: 3, axes: 'none', clip: PLOT_AREA },
    { type: 'columnLineCombo', label: 'Column & Line', tooltip: 'Column & Line', paths: 3, clip: PLOT_AREA },
    { type: 'areaColumnCombo', label: 'Area & Column', tooltip: 'Area & Column', paths: 3, clip: PLOT_AREA },
    { type: 'boxPlot', label: 'Box Plot', tooltip: 'Box Plot', paths: 3 },
    { type: 'treemap', label: 'Treemap', tooltip: 'Treemap', paths: 5, axes: 'none', clip: '5 5 53 53' },
    { type: 'heatmap', label: 'Heatmap', tooltip: 'Heatmap', paths: 9, axes: 'none' },
    { type: 'waterfall', label: 'Waterfall', tooltip: 'Waterfall', paths: 5 },
];

export const CUSTOM_COMBO_CASE: SvgCase = {
    type: 'customCombo',
    label: 'Custom Combination',
    tooltip: 'Custom Combination',
    paths: 4,
    clip: PLOT_AREA,
};

export const AXIS_SHAPES: Record<'cartesian' | 'polar' | 'none', string[]> = {
    cartesian: ['line', 'line'],
    polar: ['ring', 'ring', 'ring', 'ring'],
    none: [],
};

export const T1: AgChartTheme = {
    palette: { fills: ['#111111', '#222222', '#333333'], strokes: ['#444444', '#555555', '#666666'] },
};
export const T2: AgChartTheme = {
    palette: { fills: ['#aa0000', '#00aa00', '#0000aa'], strokes: ['#bb0000', '#00bb00', '#0000bb'] },
};

export const T3: AgChartTheme = {
    palette: { fills: ['#00aaaa', '#aa00aa', '#aaaa00'], strokes: ['#00bbbb', '#bb00bb', '#bbbb00'] },
};

export const SVG_SELECTOR = 'svg.ag-chart-mini-thumbnail-svg';

export const baseModules = [
    ClientSideRowModelModule,
    CellSelectionModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
];

/** Registers the suite hooks and returns its grids manager, reset after each test. */
export function setupMiniChartsSuite(): TestGridsManager {
    const gridsManager = new TestGridsManager({ modules: baseModules });
    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        gridsManager.reset();
    });
    return gridsManager;
}

export function activeWrapper(): HTMLElement {
    const visible = Array.from(document.querySelectorAll<HTMLElement>('.ag-chart-settings-mini-wrapper')).filter(
        (wrapper) => !wrapper.classList.contains('ag-hidden')
    );
    expect(visible).toHaveLength(1);
    return visible[0];
}

export function thumbnail(label: string, wrapper: HTMLElement = activeWrapper()): HTMLElement {
    const match = Array.from(wrapper.querySelectorAll<HTMLElement>('.ag-chart-mini-thumbnail')).find(
        (el) => el.getAttribute('aria-label') === label
    );
    expect(match?.getAttribute('aria-label')).toBe(label);
    return match!;
}

export async function openSettingsPanel(
    manager: TestGridsManager,
    {
        chartType = 'groupedColumn',
        seriesChartTypes,
        gridOptions = {},
    }: { chartType?: ChartType; seriesChartTypes?: SeriesChartType[]; gridOptions?: GridOptions } = {}
): Promise<GridApi> {
    const api = await manager.createGridAndWait('grid1', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        cellSelection: true,
        popupParent: document.body,
        ...gridOptions,
    });
    const chartRef = api.createRangeChart({
        cellRange: { columns: ['country', 'gold', 'silver', 'bronze'] },
        chartType,
        seriesChartTypes,
    })!;
    await chartRef.chart.waitForUpdate();
    api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'settings' });
    await waitFor(() => expect(document.querySelector('.ag-chart-settings-mini-wrapper')).not.toBeNull());
    return api;
}

export function themedGridOptions(themes: Record<string, AgChartTheme>): GridOptions {
    return { customChartThemes: themes, chartThemes: Object.keys(themes) };
}

export function seriesPaints(
    type: ChartType,
    attr: 'fill' | 'stroke' | 'fill-opacity',
    wrapper?: HTMLElement
): (string | null)[] {
    const label = SVG_CASES.find((c) => c.type === type)!.label;
    const svg = thumbnail(label, wrapper).querySelector(SVG_SELECTOR)!;
    return seriesPaths(svg).map((path) => path.getAttribute(attr));
}

/** The gray polar rings, drawn as paths. */
export function polarRings(svg: Element): Element[] {
    return Array.from(svg.querySelectorAll('path')).filter((path) => path.getAttribute('stroke') === 'gray');
}

export function seriesPaths(svg: Element): Element[] {
    const rings = polarRings(svg);
    return Array.from(svg.querySelectorAll('path')).filter((path) => !rings.includes(path));
}

/** The svg's shapes in paint order, as `path`, `line` (cartesian axes) or `ring` (polar rings). */
export function expectSvgShapes(el: HTMLElement, { tooltip, paths, axes, seriesOverAxes }: SvgCase): void {
    expect(el.querySelector('canvas')).toBeNull();

    const svgs = el.querySelectorAll(SVG_SELECTOR);
    expect(svgs).toHaveLength(1);
    const svg = svgs[0];
    expect(svg.firstElementChild?.localName).toBe('title');
    expect(svg.firstElementChild?.textContent).toBe(tooltip);

    const axisNames = AXIS_SHAPES[axes ?? 'cartesian'];
    const series: string[] = Array(paths).fill('path');
    const rings = polarRings(svg);
    const shapes = Array.from(svg.querySelectorAll('path, line'));
    expect(shapes.map((shape) => (rings.includes(shape) ? 'ring' : shape.localName))).toEqual(
        seriesOverAxes ? [...axisNames, ...series] : [...series, ...axisNames]
    );
    shapes
        .filter((shape) => shape.localName === 'line')
        .forEach((axis) => expect(axis.getAttribute('stroke')).toBe('gray'));

    expect(svg.querySelector('defs, clipPath, linearGradient, radialGradient, pattern')).toBeNull();
}
