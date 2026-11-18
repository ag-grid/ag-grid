import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import {
    CUSTOM_COMBO_CASE,
    SVG_CASES,
    SVG_SELECTOR,
    T1,
    activeWrapper,
    baseModules,
    expectSvgShapes,
    openSettingsPanel,
    polarRings,
    seriesPaints,
    setupMiniChartsSuite,
    themedGridOptions,
    thumbnail,
} from './settingsPanelMiniCharts';

describe('chart settings panel mini chart thumbnails', () => {
    const gridsManager = setupMiniChartsSuite();

    describe('svg thumbnails', () => {
        // These only read the panel, so they share one: building a chart and its settings panel is the costly part.
        const panelManager = new TestGridsManager({ modules: baseModules });
        beforeAll(async () => {
            await openSettingsPanel(panelManager);
        });
        afterAll(() => panelManager.reset());

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
            const rings = polarRings(thumbnail('Radar Line').querySelector(SVG_SELECTOR)!);
            expect(rings.map((ring) => ring.getAttribute('stroke-opacity'))).toEqual(['0.5', '0.2', '0.2', '0.2']);
            expect(rings.map((ring) => ring.getAttribute('fill'))).toEqual(['none', 'none', 'none', 'none']);
        });

        test('only the series of clipped types are clipped', () => {
            for (const { label, paths, clip } of SVG_CASES) {
                const nested = thumbnail(label).querySelector(`${SVG_SELECTOR} svg`);
                if (!clip) {
                    expect(nested).toBeNull();
                    continue;
                }
                expect(nested!.getAttribute('overflow')).toBe('hidden');
                expect(nested!.getAttribute('viewBox')).toBe(clip);
                expect(nested!.querySelectorAll('path')).toHaveLength(paths);
            }
        });

        test('every thumbnail is an svg and none is a canvas', () => {
            const wrapper = activeWrapper();
            const thumbnails = wrapper.querySelectorAll('.ag-chart-mini-thumbnail');
            expect(thumbnails).toHaveLength(SVG_CASES.length);
            expect(wrapper.querySelectorAll(`.ag-chart-mini-thumbnail > ${SVG_SELECTOR}`)).toHaveLength(
                SVG_CASES.length
            );
            expect(wrapper.querySelector('canvas')).toBeNull();
        });

        test('each chart family is a group named by its heading, holding its thumbnails as a list of buttons', () => {
            const groups = Array.from(activeWrapper().querySelectorAll<HTMLElement>('.ag-charts-settings-group'));
            expect(groups.length).toBeGreaterThan(0);
            for (const group of groups) {
                expect(group.getAttribute('role')).toBe('group');
                expect(group.getAttribute('aria-label')).toBe(group.querySelector('.ag-group-title')!.textContent);

                const list = group.querySelector<HTMLElement>('.ag-group-container')!;
                expect(list.getAttribute('role')).toBe('list');
                expect(list.hasAttribute('aria-labelledby')).toBe(false);
                const listItems = Array.from(list.children);
                expect(listItems.length).toBeGreaterThan(0);
                for (const listItem of listItems) {
                    expect(listItem.getAttribute('role')).toBe('listitem');
                    expect(listItem.children).toHaveLength(1);
                    expect(listItem.firstElementChild!.classList.contains('ag-chart-mini-thumbnail')).toBe(true);
                    expect(listItem.firstElementChild!.getAttribute('role')).toBe('button');
                }
            }

            const columnGroup = thumbnail('Grouped Column').closest('[role="group"]')!;
            expect(columnGroup.getAttribute('aria-label')).toBe('Column');
            expect(
                Array.from(columnGroup.querySelectorAll('.ag-chart-mini-thumbnail')).map((el) =>
                    el.getAttribute('aria-label')
                )
            ).toEqual(['Grouped Column', 'Stacked Column', '100% Stacked Column']);
        });

        test('stock themes colour box plot, treemap, heatmap and waterfall with fixed theme colours', () => {
            expect(seriesPaints('boxPlot', 'fill-opacity')).toEqual(['0.3', '0.3', '0.3']);

            expect(seriesPaints('treemap', 'stroke')).toEqual(Array(5).fill('#ffffff'));

            expect(seriesPaints('heatmap', 'fill')).toEqual([
                'rgb(255, 160, 58)',
                'rgb(249, 169, 46)',
                'rgb(243, 178, 35)',
                'rgb(237, 186, 23)',
                'rgb(231, 195, 12)',
                'rgb(225, 204, 0)',
                'rgb(219, 213, 0)',
                'rgb(213, 222, 0)',
                'rgb(207, 230, 0)',
            ]);
            expect(seriesPaints('heatmap', 'stroke')).toEqual(Array(9).fill(null));

            const [up, down] = ['#5090dc', '#ffa03a'];
            expect(seriesPaints('waterfall', 'fill')).toEqual([up, up, down, up, down]);
        });
    });

    test('clicking a thumbnail moves ag-selected and aria-pressed', async () => {
        await openSettingsPanel(gridsManager);
        expect(thumbnail('Grouped Column').classList.contains('ag-selected')).toBe(true);
        expect(thumbnail('Grouped Column').getAttribute('aria-pressed')).toBe('true');
        expect(thumbnail('Stacked Column').classList.contains('ag-selected')).toBe(false);
        expect(thumbnail('Stacked Column').getAttribute('aria-pressed')).toBe('false');

        thumbnail('Stacked Column').click();

        await waitFor(() => {
            expect(thumbnail('Stacked Column').classList.contains('ag-selected')).toBe(true);
            expect(thumbnail('Stacked Column').getAttribute('aria-pressed')).toBe('true');
            expect(thumbnail('Grouped Column').classList.contains('ag-selected')).toBe(false);
            expect(thumbnail('Grouped Column').getAttribute('aria-pressed')).toBe('false');
        });
        expect(activeWrapper().querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
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
