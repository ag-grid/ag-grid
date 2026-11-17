import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    getAttachedTooltips,
    getVisibleTooltips as getTooltips,
} from 'ag-test-utils';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';

/** The grid's fade-out window between hiding a hovered tooltip and destroying it. */
const FADE_OUT_MS = 1000;

// The tooltip's real delays are this file's subject: each test drives them on a fake clock once the grid is up,
// so "not shown (or hidden) yet" is sampled at an exact time rather than by sleeping through it.
describe('Tooltips - the show, hide and switch delays', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        vi.useRealTimers();
        gridMgr.reset();
    });

    const hasTooltipText = (text: string) => getTooltips().some((tooltip) => tooltip.textContent?.includes(text));

    /** Switches to the fake clock, with a user whose actions wait on no timer. */
    const useFakeClock = () => {
        vi.useFakeTimers();
        return userEvent.setup({ delay: null });
    };

    // The rest of the suite asserts on *visible* tooltips, so nothing else waits out the grid's fade-out
    // window. This is the one test that does, so the teardown behind that window is still covered.
    test('destroys the tooltip element once the fade-out window has passed', async () => {
        const api = await gridMgr.createGridAndWait('myGrid-tooltip-destroy', {
            columnDefs: [{ field: 'A', tooltip: () => 'Base tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        const user = useFakeClock();
        await user.hover(cell);
        await vi.advanceTimersByTimeAsync(0);
        expect(getTooltips()).toHaveLength(1);

        await user.unhover(cell);
        await vi.advanceTimersByTimeAsync(100);
        // After the crossing grace period, the hidden tooltip stays attached until its fade ends.
        expect(getTooltips()).toHaveLength(0);
        expect(getAttachedTooltips()).toHaveLength(1);
        expect(getAttachedTooltips()[0]).toHaveClass('ag-tooltip-hiding');

        await vi.advanceTimersByTimeAsync(FADE_OUT_MS - 1);
        expect(getAttachedTooltips()).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(getAttachedTooltips()).toEqual([]);
    });

    test('respects tooltipShowDelay and tooltipHideDelay', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltip: () => 'Delay tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
            tooltipHideDelay: 300,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-delay', gridOptions);
        await new GridColumns(api, `respects tooltipShowDelay and tooltipHideDelay setup`).checkColumns(`
            CENTER
            └── A width:200
        `);
        await new GridRows(api, `respects tooltipShowDelay and tooltipHideDelay setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        const user = useFakeClock();
        await user.hover(cell);
        await vi.advanceTimersByTimeAsync(150);
        expect(getTooltips()).toHaveLength(0);

        await vi.advanceTimersByTimeAsync(100);
        expect(getTooltips()).toHaveLength(1);
        const tooltip = getTooltips()[0];
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await vi.advanceTimersByTimeAsync(150);
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await vi.advanceTimersByTimeAsync(200);
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(true);

        vi.useRealTimers();
        await new GridRows(api, `respects tooltipShowDelay and tooltipHideDelay final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
    });

    test('respects tooltipSwitchShowDelay when moving between cells', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltip: (params) => `Row ${params.node?.id}` }],
            rowData: [{ A: 'one' }, { A: 'two' }],
            tooltipShowDelay: 500,
            tooltipHideDelay: 200,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-switch', gridOptions);
        await new GridColumns(api, `respects tooltipSwitchShowDelay when moving between cells setup`).checkColumns(`
            CENTER
            └── A width:200
        `);
        await new GridRows(api, `respects tooltipSwitchShowDelay when moving between cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 A:"one"
            └── LEAF id:1 A:"two"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const firstCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));
        const secondCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('1', 'A')));

        const user = useFakeClock();
        await user.hover(firstCell);
        await vi.advanceTimersByTimeAsync(500);
        expect(getTooltips()).toHaveLength(1);

        await user.unhover(firstCell);
        await vi.advanceTimersByTimeAsync(50);

        await user.hover(secondCell);
        await vi.advanceTimersByTimeAsync(150);
        expect(hasTooltipText('Row 1')).toBe(false);

        // Sampled below the 500ms `tooltipShowDelay`, so a switch delay ignored in favour of the ordinary show
        // delay fails here, which is the whole subject.
        await vi.advanceTimersByTimeAsync(200);
        expect(hasTooltipText('Row 1')).toBe(true);

        vi.useRealTimers();
        await new GridRows(api, `respects tooltipSwitchShowDelay when moving between cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 A:"one"
            └── LEAF id:1 A:"two"
        `);
    });
});
