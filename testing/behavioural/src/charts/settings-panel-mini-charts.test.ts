import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgChartTheme } from 'ag-charts-types';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType, GridApi, GridOptions } from 'ag-grid-community';
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
}

const SVG_CASES: SvgCase[] = [
    { type: 'groupedColumn', label: 'Grouped Column', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedColumn', label: 'Stacked Column', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedColumn', label: '100% Stacked Column', tooltip: '100% Stacked', paths: 9 },
    { type: 'groupedBar', label: 'Grouped Bar', tooltip: 'Grouped', paths: 3 },
    { type: 'stackedBar', label: 'Stacked Bar', tooltip: 'Stacked', paths: 9 },
    { type: 'normalizedBar', label: '100% Stacked Bar', tooltip: '100% Stacked', paths: 9 },
    { type: 'line', label: 'Line', tooltip: 'Line', paths: 3 },
    { type: 'stackedLine', label: 'Stacked Line', tooltip: 'Stacked', paths: 3 },
    { type: 'normalizedLine', label: '100% Stacked Line', tooltip: '100% Stacked', paths: 3 },
    { type: 'area', label: 'Area', tooltip: 'Area', paths: 3 },
    { type: 'stackedArea', label: 'Stacked Area', tooltip: 'Stacked', paths: 3 },
    { type: 'normalizedArea', label: '100% Stacked Area', tooltip: '100% Stacked', paths: 3 },
    { type: 'histogram', label: 'Histogram', tooltip: 'Histogram', paths: 7 },
];

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
        { chartType = 'groupedColumn', gridOptions = {} }: { chartType?: ChartType; gridOptions?: GridOptions } = {}
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
        })!;
        await chartRef.chart.waitForUpdate();
        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'settings' });
        await waitFor(() => expect(document.querySelector('.ag-chart-settings-mini-wrapper')).not.toBeNull());
        return api;
    }

    function themedGridOptions(themes: Record<string, AgChartTheme>): GridOptions {
        return { customChartThemes: themes, chartThemes: Object.keys(themes) };
    }

    function seriesPaints(type: ChartType, attr: 'fill' | 'stroke', wrapper?: HTMLElement): (string | null)[] {
        const label = SVG_CASES.find((c) => c.type === type)!.label;
        const svg = thumbnail(label, wrapper).querySelector(SVG_SELECTOR)!;
        return Array.from(svg.querySelectorAll('path')).map((path) => path.getAttribute(attr));
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
            '$type renders $paths series paths, then 2 axis lines, under the $tooltip title in one svg',
            ({ label, tooltip, paths }) => {
                const el = thumbnail(label);
                expect(el.querySelector('canvas')).toBeNull();

                const svgs = el.querySelectorAll(SVG_SELECTOR);
                expect(svgs).toHaveLength(1);
                const svg = svgs[0];
                expect(svg.firstElementChild?.localName).toBe('title');
                expect(svg.firstElementChild?.textContent).toBe(tooltip);

                // the axes are drawn over the series
                const shapes = Array.from(svg.querySelectorAll('path, line'));
                expect(shapes.map((shape) => shape.localName)).toEqual([...Array(paths).fill('path'), 'line', 'line']);
                shapes.slice(-2).forEach((line) => expect(line.getAttribute('stroke')).toBe('gray'));

                expect(svg.querySelector('defs, clipPath, linearGradient, radialGradient, pattern')).toBeNull();
            }
        );

        test('only the line and area series are clipped, to the plot area', () => {
            for (const { type, label } of SVG_CASES) {
                const nested = thumbnail(label).querySelector(`${SVG_SELECTOR} svg`);
                if (!/line|area/i.test(type)) {
                    expect(nested).toBeNull();
                    continue;
                }
                expect(nested!.getAttribute('overflow')).toBe('hidden');
                expect(nested!.getAttribute('viewBox')).toBe('5 5 48 48');
                expect(nested!.querySelectorAll('path')).toHaveLength(3);
            }
        });

        test('pie thumbnail keeps its canvas and has no svg', () => {
            const el = thumbnail('Pie');
            expect(el.querySelector('canvas.ag-chart-mini-thumbnail-canvas')).not.toBeNull();
            expect(el.querySelector('svg')).toBeNull();
        });

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
                        statisticalGroup: ['histogram'],
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
});
