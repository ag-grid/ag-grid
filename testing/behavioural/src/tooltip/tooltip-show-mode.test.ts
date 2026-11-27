import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager, getVisibleTooltips } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { TooltipModule, getGridElement } from 'ag-grid-community';

import { allowLegacyTooltipProperties, resetLegacyTooltipProperties } from './legacyTooltipTestUtils';

describe('Tooltip show modes', () => {
    const grids = new TestGridsManager({ modules: [TooltipModule] });

    afterEach(() => {
        grids.reset();
        resetLegacyTooltipProperties();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const setTruncated = (element: HTMLElement, truncated: boolean) => {
        vi.spyOn(element, 'clientWidth', 'get').mockReturnValue(100);
        vi.spyOn(element, 'scrollWidth', 'get').mockReturnValue(truncated ? 200 : 80);
        vi.spyOn(element, 'clientHeight', 'get').mockReturnValue(20);
        vi.spyOn(element, 'scrollHeight', 'get').mockReturnValue(20);
    };

    const checkTooltip = async (source: HTMLElement, native: boolean, expected?: string) => {
        fireEvent.mouseEnter(source);
        await vi.advanceTimersByTimeAsync(1);
        if (native) {
            expect(source.getAttribute('title') || undefined).toBe(expected);
        } else {
            expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(expected ? [expected] : []);
        }
        fireEvent.mouseLeave(source);
        await vi.advanceTimersByTimeAsync(1000);
    };

    const cases: { mode: GridOptions['tooltipShowMode']; truncated: boolean; visible: string[] }[] = [
        { mode: 'auto', truncated: false, visible: ['different'] },
        { mode: 'auto', truncated: true, visible: ['automatic', 'same', 'different', 'legacy'] },
        { mode: 'standard', truncated: false, visible: ['same', 'different', 'legacy'] },
        { mode: 'standard', truncated: true, visible: ['same', 'different', 'legacy'] },
        { mode: 'whenTruncated', truncated: false, visible: [] },
        { mode: 'whenTruncated', truncated: true, visible: ['same', 'different', 'legacy'] },
        { mode: 'whenDifferent', truncated: false, visible: ['different'] },
        { mode: 'whenDifferent', truncated: true, visible: ['different'] },
    ];

    test.each(cases.flatMap((scenario) => [false, true].map((native) => ({ ...scenario, native }))))(
        '$mode checks configured cell and header content (truncated=$truncated, native=$native)',
        async ({ mode, truncated, visible, native }) => {
            allowLegacyTooltipProperties();
            const api = await grids.createGridAndWait('show-modes', {
                defaultColDef: { field: 'value', headerName: 'Displayed value' },
                columnDefs: [
                    { colId: 'automatic' },
                    { colId: 'same', tooltip: true, headerTooltip: true },
                    { colId: 'different', tooltip: 'Additional information', headerTooltip: 'Additional information' },
                    { colId: 'disabled', tooltip: false, headerTooltip: false },
                    { colId: 'empty', tooltip: () => null, headerTooltip: () => null },
                    { colId: 'legacy', tooltipField: 'value', headerTooltipValueGetter: ({ value }) => value },
                ],
                rowData: [{ value: 'Displayed value' }],
                tooltipShowMode: mode,
                enableBrowserTooltips: native,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            });
            const grid = getGridElement(api)! as HTMLElement;
            vi.useFakeTimers();
            for (const id of ['automatic', 'same', 'different', 'disabled', 'empty', 'legacy']) {
                const cell = grid.querySelector<HTMLElement>(`.ag-cell[col-id="${id}"]`)!;
                const header = grid.querySelector<HTMLElement>(`.ag-header-cell[col-id="${id}"]`)!;
                setTruncated(cell, truncated);
                setTruncated(header.querySelector<HTMLElement>('.ag-header-cell-text')!, truncated);
                const text = id === 'different' ? 'Additional information' : 'Displayed value';
                const expected = visible.includes(id) ? text : undefined;
                await checkTooltip(cell, native, expected);
                await checkTooltip(header, native, expected);
            }
        }
    );

    test.each(['auto', 'whenDifferent'] as const)(
        '%s compares against the default formatted tooltip value',
        async (mode) => {
            const api = await grids.createGridAndWait('formatted-show-mode', {
                defaultColDef: { field: 'price', valueFormatter: ({ value }) => `£${value.toFixed(2)}` },
                columnDefs: [
                    { colId: 'raw', tooltip: ({ value }) => String(value) },
                    { colId: 'formatted', tooltip: true },
                    { colId: 'automatic' },
                ],
                rowData: [{ price: 10 }],
                tooltipShowMode: mode,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            });
            const grid = getGridElement(api)! as HTMLElement;
            vi.useFakeTimers();
            for (const id of ['raw', 'formatted', 'automatic']) {
                const cell = grid.querySelector<HTMLElement>(`.ag-cell[col-id="${id}"]`)!;
                expect(cell).toHaveTextContent('£10.00');
                setTruncated(cell, false);
                await checkTooltip(cell, false, id === 'raw' ? '10' : undefined);
            }
        }
    );
});
