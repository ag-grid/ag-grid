import { waitFor } from '@testing-library/dom';
import type { AgChartTheme } from 'ag-charts-types';

import {
    SVG_CASES,
    SVG_SELECTOR,
    T1,
    T2,
    activeWrapper,
    openSettingsPanel,
    seriesPaints,
    seriesPaths,
    setupMiniChartsSuite,
    themedGridOptions,
    thumbnail,
} from './settingsPanelMiniCharts';

describe('chart settings panel mini chart palettes', () => {
    const gridsManager = setupMiniChartsSuite();

    describe('palette colours', () => {
        /** Every series in every svg thumbnail is painted, and only with colours from the given palette. */
        function expectPaletteColours({ fills, strokes }: { fills: string[]; strokes: string[] }): void {
            // Heatmap cells blend the palette's first two fills, so they are asserted separately.
            for (const svgCase of SVG_CASES.filter((c) => c.type !== 'heatmap')) {
                const paths = seriesPaths(thumbnail(svgCase.label).querySelector(SVG_SELECTOR)!);
                expect(paths.length).toBeGreaterThan(0);
                paths.forEach((path) => {
                    expect(['none', ...fills]).toContain(path.getAttribute('fill'));
                    expect([null, 'none', ...fills, ...strokes]).toContain(path.getAttribute('stroke'));
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

        test('a short palette repeats its colours, except for area outlines', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: themedGridOptions({
                    short: { palette: { fills: ['#123456', '#234567'], strokes: ['#654321', '#765432'] } },
                }),
            });

            expect(seriesPaints('groupedColumn', 'fill')).toEqual(['#123456', '#234567', '#123456']);
            expect(seriesPaints('area', 'stroke')).toEqual(['#654321', '#765432', 'none']);
            expect(seriesPaints('radarArea', 'stroke')).toEqual(['#654321', '#765432', 'none']);
            expect(seriesPaints('line', 'stroke')).toEqual(['#123456', '#234567', '#123456']);
        });

        test('a single-colour palette renders every svg thumbnail', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: themedGridOptions({ single: { palette: { fills: ['#123456'], strokes: ['#654321'] } } }),
            });

            expectPaletteColours({ fills: ['#123456'], strokes: ['#654321'] });
            expect(seriesPaints('heatmap', 'fill')).toEqual(Array(9).fill('rgb(18, 52, 86)'));
        });
    });

    describe('theme-coloured thumbnails', () => {
        test('custom themes colour box plot, treemap, heatmap and waterfall from the palette', async () => {
            await openSettingsPanel(gridsManager, { gridOptions: themedGridOptions({ t1: T1 }) });
            const [f0, f1, f2] = T1.palette!.fills as string[];
            const [s0, s1, s2] = T1.palette!.strokes as string[];

            expect(seriesPaints('boxPlot', 'fill')).toEqual([f0, f1, f2]);
            expect(seriesPaints('boxPlot', 'stroke')).toEqual([s0, s1, s2]);
            expect(seriesPaints('boxPlot', 'fill-opacity')).toEqual([null, null, null]);

            expect(seriesPaints('treemap', 'fill')).toEqual([f0, f1, f2, f0, f1]);
            expect(seriesPaints('treemap', 'stroke')).toEqual([s0, s1, s2, s0, s1]);

            // #111111 towards #222222 in steps of 0.2, continuing past #222222.
            expect(seriesPaints('heatmap', 'fill')).toEqual(
                [17, 20, 24, 27, 31, 34, 37, 41, 44].map((c) => `rgb(${c}, ${c}, ${c})`)
            );

            expect(seriesPaints('waterfall', 'fill')).toEqual([f0, f0, f1, f0, f1]);
        });

        test('custom heatmap cells that continue past fill 1 are clamped', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: themedGridOptions({
                    custom: { palette: { fills: ['#000000', '#ffffff'], strokes: ['#000000'] } },
                }),
            });

            expect(seriesPaints('heatmap', 'fill')).toEqual(
                [0, 51, 102, 153, 204, 255, 255, 255, 255].map((c) => `rgb(${c}, ${c}, ${c})`)
            );
        });
    });
});
