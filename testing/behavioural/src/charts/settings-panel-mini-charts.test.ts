import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgChartTheme } from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType, GridApi, GridOptions, SeriesChartType } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

const COLUMN_DEFS: GridOptions['columnDefs'] = [
    { field: 'country', chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
];

const ROW_DATA = [
    { country: 'Russia', gold: 3, silver: 1, bronze: 5 },
    { country: 'USA', gold: 4, silver: 2, bronze: 3 },
    { country: 'Norway', gold: 7, silver: 5, bronze: 1 },
];

interface SvgCase {
    type: ChartType;
    label: string;
    tooltip: string;
    paths: number;
    axes?: 'polar' | 'none';
    seriesOverAxes?: true;
    clip?: true;
}

const SVG_CASES: SvgCase[] = [
    { type: 'groupedColumn', label: 'Grouped Column', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedColumn', label: 'Stacked Column', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedColumn', label: '100% Stacked Column', tooltip: '100% Stacked', paths: 9 },
    { type: 'groupedBar', label: 'Grouped Bar', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedBar', label: 'Stacked Bar', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedBar', label: '100% Stacked Bar', tooltip: '100% Stacked', paths: 9 },
    { type: 'line', label: 'Line', tooltip: 'Line', paths: 3, clip: true },
    { type: 'stackedLine', label: 'Stacked Line', tooltip: 'Stacked', paths: 3, clip: true },
    { type: 'normalizedLine', label: '100% Stacked Line', tooltip: '100% Stacked', paths: 3, clip: true },
    { type: 'area', label: 'Area', tooltip: 'Area', paths: 3, clip: true },
    { type: 'stackedArea', label: 'Stacked Area', tooltip: 'Stacked', paths: 3, clip: true },
    { type: 'normalizedArea', label: '100% Stacked Area', tooltip: '100% Stacked', paths: 3, clip: true },
    { type: 'histogram', label: 'Histogram', tooltip: 'Histogram', paths: 7 },
    { type: 'pie', label: 'Pie', tooltip: 'Pie', paths: 6, axes: 'none' },
    { type: 'donut', label: 'Donut', tooltip: 'Donut', paths: 6, axes: 'none' },
    { type: 'scatter', label: 'Scatter', tooltip: 'Scatter', paths: 8, clip: true },
    { type: 'bubble', label: 'Bubble', tooltip: 'Bubble', paths: 5, clip: true },
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
    { type: 'funnel', label: 'Funnel', tooltip: 'Funnel', paths: 3, axes: 'none', clip: true },
    { type: 'coneFunnel', label: 'Cone Funnel', tooltip: 'Cone Funnel', paths: 3, axes: 'none', clip: true },
    { type: 'pyramid', label: 'Pyramid', tooltip: 'Pyramid', paths: 3, axes: 'none', clip: true },
    { type: 'columnLineCombo', label: 'Column & Line', tooltip: 'Column & Line', paths: 3, clip: true },
    { type: 'areaColumnCombo', label: 'Area & Column', tooltip: 'Area & Column', paths: 3, clip: true },
];

const CUSTOM_COMBO_CASE: SvgCase = {
    type: 'customCombo',
    label: 'Custom Combination',
    tooltip: 'Custom Combination',
    paths: 4,
    clip: true,
};

const AXIS_SHAPES: Record<'cartesian' | 'polar' | 'none', string[]> = {
    cartesian: ['line', 'line'],
    polar: ['circle', 'circle', 'circle', 'circle'],
    none: [],
};

const T1: AgChartTheme = {
    palette: { fills: ['#111111', '#222222', '#333333'], strokes: ['#444444', '#555555', '#666666'] },
};
const T2: AgChartTheme = {
    palette: { fills: ['#aa0000', '#00aa00', '#0000aa'], strokes: ['#bb0000', '#00bb00', '#0000bb'] },
};

const SVG_SELECTOR = 'svg.ag-chart-mini-thumbnail-svg';

const baseModules = [
    ClientSideRowModelModule,
    CellSelectionModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
];

describe('chart settings panel mini chart thumbnails', () => {
    const gridsManager = new TestGridsManager({ modules: baseModules });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        gridsManager.reset();
    });

    function activeWrapper(): HTMLElement {
        const visible = Array.from(document.querySelectorAll<HTMLElement>('.ag-chart-settings-mini-wrapper')).filter(
            (wrapper) => !wrapper.classList.contains('ag-hidden')
        );
        expect(visible).toHaveLength(1);
        return visible[0];
    }

    function thumbnail(label: string, wrapper: HTMLElement = activeWrapper()): HTMLElement {
        const match = Array.from(wrapper.querySelectorAll<HTMLElement>('.ag-chart-mini-thumbnail')).find(
            (el) => el.getAttribute('aria-label')?.split('. ')[0] === label
        );
        expect(match).toBeDefined();
        return match!;
    }

    async function openSettingsPanel(
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

    function themedGridOptions(themes: Record<string, AgChartTheme>): GridOptions {
        return { customChartThemes: themes, chartThemes: Object.keys(themes) };
    }

    function seriesPaints(
        type: ChartType,
        attr: 'fill' | 'stroke' | 'fill-opacity',
        wrapper?: HTMLElement
    ): (string | null)[] {
        const label = SVG_CASES.find((c) => c.type === type)!.label;
        const svg = thumbnail(label, wrapper).querySelector(SVG_SELECTOR)!;
        return Array.from(svg.querySelectorAll('path')).map((path) => path.getAttribute(attr));
    }

    /** The svg's shapes in paint order, as `path`, `line` (cartesian axes) or `circle` (polar rings). */
    function expectSvgShapes(el: HTMLElement, { tooltip, paths, axes, seriesOverAxes }: SvgCase): void {
        expect(el.querySelector('canvas')).toBeNull();

        const svgs = el.querySelectorAll(SVG_SELECTOR);
        expect(svgs).toHaveLength(1);
        const svg = svgs[0];
        expect(svg.firstElementChild?.localName).toBe('title');
        expect(svg.firstElementChild?.textContent).toBe(tooltip);

        const axisNames = AXIS_SHAPES[axes ?? 'cartesian'];
        const series: string[] = Array(paths).fill('path');
        const shapes = Array.from(svg.querySelectorAll('path, line, circle'));
        expect(shapes.map((shape) => shape.localName)).toEqual(
            seriesOverAxes ? [...axisNames, ...series] : [...series, ...axisNames]
        );
        shapes
            .filter((shape) => shape.localName !== 'path')
            .forEach((axis) => expect(axis.getAttribute('stroke')).toBe('gray'));

        expect(svg.querySelector('defs, clipPath, linearGradient, radialGradient, pattern')).toBeNull();
    }

    describe('svg thumbnails', () => {
        beforeEach(async () => {
            await openSettingsPanel(gridsManager);
        });

        test('the svg is a 58x58, hidden-from-assistive-tech image', () => {
            const svg = thumbnail('Grouped Column').querySelector(SVG_SELECTOR)!;
            expect(svg.getAttribute('aria-hidden')).toBe('true');
            expect(svg.getAttribute('focusable')).toBe('false');
            expect(svg.getAttribute('width')).toBe('58');
            expect(svg.getAttribute('height')).toBe('58');
            expect(svg.getAttribute('viewBox')).toBe('0 0 58 58');
        });

        test.each(SVG_CASES)(
            '$type renders $paths series paths and its axes under the $tooltip title in one svg',
            (svgCase) => {
                expectSvgShapes(thumbnail(svgCase.label), svgCase);
            }
        );

        test('the polar rings fade inwards from the outer ring', () => {
            const rings = Array.from(thumbnail('Radar Line').querySelectorAll(`${SVG_SELECTOR} circle`));
            expect(rings.map((ring) => ring.getAttribute('stroke-opacity'))).toEqual(['0.5', '0.2', '0.2', '0.2']);
            expect(rings.map((ring) => ring.getAttribute('fill'))).toEqual(['none', 'none', 'none', 'none']);
        });

        test('only the series of clipped types are clipped, to the plot area', () => {
            for (const { label, paths, clip } of SVG_CASES) {
                const nested = thumbnail(label).querySelector(`${SVG_SELECTOR} svg`);
                if (!clip) {
                    expect(nested).toBeNull();
                    continue;
                }
                expect(nested!.getAttribute('overflow')).toBe('hidden');
                expect(nested!.getAttribute('viewBox')).toBe('5 5 48 48');
                expect(nested!.querySelectorAll('path')).toHaveLength(paths);
            }
        });

        test.each(['Box Plot', 'Treemap', 'Heatmap', 'Waterfall'])(
            '%s thumbnail keeps its canvas and has no svg',
            (label) => {
                const el = thumbnail(label);
                expect(el.querySelector('canvas.ag-chart-mini-thumbnail-canvas')).not.toBeNull();
                expect(el.querySelector('svg')).toBeNull();
            }
        );

        test('clicking a thumbnail moves ag-selected and the selected aria-label suffix', async () => {
            expect(thumbnail('Grouped Column').classList.contains('ag-selected')).toBe(true);
            expect(thumbnail('Grouped Column').getAttribute('aria-label')).toBe('Grouped Column. Selected');
            expect(thumbnail('Stacked Column').classList.contains('ag-selected')).toBe(false);
            expect(thumbnail('Stacked Column').getAttribute('aria-label')).toBe('Stacked Column');

            thumbnail('Stacked Column').click();

            await waitFor(() => {
                expect(thumbnail('Stacked Column').classList.contains('ag-selected')).toBe(true);
                expect(thumbnail('Stacked Column').getAttribute('aria-label')).toBe('Stacked Column. Selected');
                expect(thumbnail('Grouped Column').classList.contains('ag-selected')).toBe(false);
                expect(thumbnail('Grouped Column').getAttribute('aria-label')).toBe('Grouped Column');
            });
        });
    });

    describe('palette colours', () => {
        /** Every series in every svg thumbnail is painted, and only with colours from the given palette. */
        function expectPaletteColours({ fills, strokes }: { fills: string[]; strokes: string[] }): void {
            for (const { label } of SVG_CASES) {
                const paths = Array.from(thumbnail(label).querySelectorAll(`${SVG_SELECTOR} path`));
                expect(paths.length).toBeGreaterThan(0);
                paths.forEach((path) => {
                    expect(['none', ...fills]).toContain(path.getAttribute('fill'));
                    expect([null, ...fills, ...strokes]).toContain(path.getAttribute('stroke'));
                    expect([path.getAttribute('fill'), path.getAttribute('stroke')]).not.toEqual(['none', null]);
                });
            }
        }

        function themePalette(theme: AgChartTheme): { fills: string[]; strokes: string[] } {
            return theme.palette as { fills: string[]; strokes: string[] };
        }

        test('series fills and strokes come from the active palette and follow palette navigation', async () => {
            await openSettingsPanel(gridsManager, { gridOptions: themedGridOptions({ t1: T1, t2: T2 }) });
            const [first] = document.querySelectorAll<HTMLElement>('.ag-chart-settings-mini-wrapper');

            expect(activeWrapper()).toBe(first);
            expect(seriesPaints('groupedColumn', 'fill')).toEqual(T1.palette!.fills);
            expect(seriesPaints('groupedColumn', 'stroke')).toEqual([null, null, null]);
            expect(seriesPaints('area', 'stroke')).toEqual(T1.palette!.strokes);
            expect(seriesPaints('line', 'stroke')).toEqual(T1.palette!.fills);
            expectPaletteColours(themePalette(T1));

            const [f0, f1, f2] = T1.palette!.fills as string[];
            expect(seriesPaints('scatter', 'fill')).toEqual([f0, f1, f2, f0, f1, f2, f0, f1]);
            expect(seriesPaints('rangeArea', 'fill')).toEqual([f0, f2, f1]);
            expect(seriesPaints('coneFunnel', 'fill-opacity')).toEqual([null, '0.8', '0.6']);
            expect(seriesPaints('bubble', 'fill-opacity')).toEqual(Array(5).fill('0.7'));

            document.querySelector<HTMLElement>('.ag-chart-settings-next')!.click();

            await waitFor(
                () => {
                    expect(activeWrapper()).not.toBe(first);
                    expect(seriesPaints('groupedColumn', 'fill')).toEqual(T2.palette!.fills);
                },
                { timeout: 3000 }
            );
            expect(seriesPaints('area', 'stroke')).toEqual(T2.palette!.strokes);
            expect(seriesPaints('line', 'stroke')).toEqual(T2.palette!.fills);
            expectPaletteColours(themePalette(T2));
        });

        test('gradient and pattern palette entries render as solid colours', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: themedGridOptions({
                    custom: {
                        palette: {
                            fills: [
                                { type: 'gradient', colorStops: [{ color: 'red' }, { color: 'blue' }] },
                                { type: 'pattern', fill: 'green', pattern: 'vertical-lines' },
                                '#abcdef',
                            ],
                            strokes: ['#111111', '#222222', '#333333'],
                        },
                    },
                }),
            });

            expect(seriesPaints('groupedColumn', 'fill')).toEqual(['red', 'green', '#abcdef']);
            expect(seriesPaints('line', 'stroke')).toEqual(['red', 'green', '#abcdef']);
            expect(document.querySelector(`${SVG_SELECTOR} defs, ${SVG_SELECTOR} linearGradient`)).toBeNull();
        });

        // The remaining canvas thumbnails do not all support short palettes, so only the svg groups are shown.
        const svgChartGroupsDef: GridOptions = {
            chartToolPanelsDef: {
                settingsPanel: {
                    chartGroupsDef: {
                        columnGroup: ['column', 'stackedColumn', 'normalizedColumn'],
                        barGroup: ['bar', 'stackedBar', 'normalizedBar'],
                        lineGroup: ['line', 'stackedLine', 'normalizedLine'],
                        areaGroup: ['area', 'stackedArea', 'normalizedArea'],
                        pieGroup: ['pie', 'donut'],
                        scatterGroup: ['scatter', 'bubble'],
                        polarGroup: ['radarLine', 'radarArea', 'nightingale', 'radialColumn', 'radialBar'],
                        statisticalGroup: ['histogram', 'rangeBar', 'rangeArea'],
                        hierarchicalGroup: ['sunburst'],
                        funnelGroup: ['funnel', 'coneFunnel', 'pyramid'],
                        combinationGroup: ['columnLineCombo', 'areaColumnCombo'],
                    },
                },
            },
        };

        test('a short palette repeats its colours', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: {
                    ...svgChartGroupsDef,
                    ...themedGridOptions({
                        short: { palette: { fills: ['#123456', '#234567'], strokes: ['#654321', '#765432'] } },
                    }),
                },
            });

            expect(seriesPaints('groupedColumn', 'fill')).toEqual(['#123456', '#234567', '#123456']);
            expect(seriesPaints('area', 'stroke')).toEqual(['#654321', '#765432', '#654321']);
            expect(seriesPaints('line', 'stroke')).toEqual(['#123456', '#234567', '#123456']);
        });

        test('a single-colour palette renders every svg thumbnail', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: {
                    ...svgChartGroupsDef,
                    ...themedGridOptions({ single: { palette: { fills: ['#123456'], strokes: ['#654321'] } } }),
                },
            });

            expectPaletteColours({ fills: ['#123456'], strokes: ['#654321'] });
        });
    });

    test('customCombo renders palette-coloured series, its axes and a literal-coloured pen icon', async () => {
        await openSettingsPanel(gridsManager, {
            chartType: 'customCombo',
            seriesChartTypes: [
                { colId: 'gold', chartType: 'groupedColumn', secondaryAxis: false },
                { colId: 'silver', chartType: 'line', secondaryAxis: false },
                { colId: 'bronze', chartType: 'area', secondaryAxis: false },
            ],
            gridOptions: themedGridOptions({ t1: T1 }),
        });

        const el = thumbnail(CUSTOM_COMBO_CASE.label);
        expectSvgShapes(el, CUSTOM_COMBO_CASE);

        const [f0, f1, f2] = T1.palette!.fills as string[];
        const paths = Array.from(el.querySelectorAll(`${SVG_SELECTOR} path`));
        expect(paths.map((path) => [path.getAttribute('fill'), path.getAttribute('stroke')])).toEqual([
            [f0, null],
            [f1, null],
            ['none', f2],
            ['whitesmoke', 'darkslategrey'],
        ]);
    });
});
