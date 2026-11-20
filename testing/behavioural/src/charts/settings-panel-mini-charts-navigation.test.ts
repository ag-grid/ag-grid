import { waitFor } from '@testing-library/dom';
import { AgChartsCommunityModule } from 'ag-charts-community';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule, getGridElement } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import {
    SVG_CASES,
    SVG_SELECTOR,
    T1,
    T2,
    T3,
    activeWrapper,
    baseModules,
    expectSvgShapes,
    openSettingsPanel,
    seriesPaints,
    setupMiniChartsSuite,
    themedGridOptions,
    thumbnail,
} from './settingsPanelMiniCharts';

describe('chart settings panel palette navigation and chart modules', () => {
    const gridsManager = setupMiniChartsSuite();

    describe.each([
        { name: 'AgChartsCommunityModule', chartsModule: AgChartsCommunityModule },
        { name: 'AgChartsEnterpriseModule', chartsModule: AgChartsEnterpriseModule },
    ])('with $name', (row) => {
        const moduleGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(row.chartsModule)],
        });
        afterEach(() => moduleGridsManager.reset());

        test('every thumbnail is an svg coloured from the theme palette', async () => {
            await openSettingsPanel(moduleGridsManager, { gridOptions: themedGridOptions({ t1: T1 }) });

            const wrapper = activeWrapper();
            const thumbnails = Array.from(wrapper.querySelectorAll<HTMLElement>('.ag-chart-mini-thumbnail'));
            expect(thumbnails.length).toBeGreaterThan(0);
            thumbnails.forEach((el) => expect(el.querySelectorAll(`:scope > ${SVG_SELECTOR}`)).toHaveLength(1));
            expect(wrapper.querySelector('canvas')).toBeNull();
            expect(seriesPaints('groupedColumn', 'fill', wrapper)).toEqual(T1.palette!.fills);
        });

        test('a stock theme renders svg thumbnails', async () => {
            await openSettingsPanel(moduleGridsManager);

            expectSvgShapes(thumbnail('Grouped Column'), SVG_CASES[0]);
        });
    });

    describe('palette navigation accessibility', () => {
        const prevButton = () => document.querySelector<HTMLElement>('.ag-chart-settings-prev-button')!;
        const nextButton = () => document.querySelector<HTMLElement>('.ag-chart-settings-next-button')!;
        const cardSelector = () => document.querySelector<HTMLElement>('.ag-chart-settings-card-selector')!;
        const localeGridsManager = new TestGridsManager({ modules: [...baseModules, LocaleModule] });

        afterEach(() => localeGridsManager.reset());

        async function expectAnnouncement(api: GridApi, expected: string): Promise<void> {
            await waitFor(() => {
                const text = getGridElement(api)!.querySelector('.ag-aria-description-container')?.textContent;
                expect(text?.replace(/\u200B/g, '')).toBe(expected);
            });
        }

        test('arrow buttons are named and the current page is exposed as "Palette N of M"', async () => {
            await openSettingsPanel(gridsManager, { gridOptions: themedGridOptions({ t1: T1, t2: T2, t3: T3 }) });

            expect(prevButton().getAttribute('aria-label')).toBe('Previous palette');
            expect(nextButton().getAttribute('aria-label')).toBe('Next palette');
            for (const wrapper of document.querySelectorAll('.ag-chart-settings-prev, .ag-chart-settings-next')) {
                expect(wrapper.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
            }

            expect(cardSelector().getAttribute('role')).toBe('img');
            expect(cardSelector().getAttribute('aria-label')).toBe('Palette 1 of 3');
            const dots = document.querySelectorAll('.ag-chart-settings-card-item');
            expect(dots).toHaveLength(3);
            dots.forEach((dot) => expect(dot.getAttribute('aria-hidden')).toBe('true'));
        });

        test('palette changes update the page label and are announced, wrapping in both directions', async () => {
            const api = await openSettingsPanel(gridsManager, {
                gridOptions: themedGridOptions({ t1: T1, t2: T2, t3: T3 }),
            });

            prevButton().click();
            expect(cardSelector().getAttribute('aria-label')).toBe('Palette 3 of 3');
            await expectAnnouncement(api, 'Palette 3 of 3');

            // a second change is ignored until the 300ms slide animation ends
            await waitFor(() => expect(document.querySelector('.ag-animating')).toBeNull());
            nextButton().click();
            expect(cardSelector().getAttribute('aria-label')).toBe('Palette 1 of 3');
            await expectAnnouncement(api, 'Palette 1 of 3');
        });

        test('names and page label use localeText, with the page numbers substituted', async () => {
            await openSettingsPanel(localeGridsManager, {
                gridOptions: {
                    ...themedGridOptions({ t1: T1, t2: T2 }),
                    localeText: {
                        ariaChartPaletteNext: 'Weiter',
                        ariaChartPalettePage: 'Seite ${variable} von ${variable}',
                    },
                },
            });

            expect(nextButton().getAttribute('aria-label')).toBe('Weiter');
            expect(prevButton().getAttribute('aria-label')).toBe('Previous palette');
            expect(cardSelector().getAttribute('aria-label')).toBe('Seite 1 von 2');
        });

        test('button names describe their function under RTL, where only the icons swap', async () => {
            await openSettingsPanel(gridsManager, {
                gridOptions: { ...themedGridOptions({ t1: T1, t2: T2 }), enableRtl: true },
            });

            expect(prevButton().getAttribute('aria-label')).toBe('Previous palette');
            expect(nextButton().getAttribute('aria-label')).toBe('Next palette');
        });
    });
});
