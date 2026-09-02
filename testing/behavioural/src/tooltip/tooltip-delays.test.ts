/* eslint-disable no-restricted-syntax -- the tooltip's own timers are this file's subject, so each sleep
   is the observation window for "not shown (or hidden) yet", which polling cannot express. Kept apart from
   `tooltip.test.ts` because these are the only tooltip tests that must spend real time. */
import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    getAttachedTooltips,
    getVisibleTooltips as getTooltips,
    waitForTooltips,
    waitForTooltipsDestroyed,
} from 'ag-test-utils';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';

describe('Tooltips - the show, hide and switch delays', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const hasTooltipText = (text: string) => getTooltips().some((tooltip) => tooltip.textContent?.includes(text));

    // The rest of the suite asserts on *visible* tooltips, so nothing else waits out the grid's
    // second-long fade-out window. This is the one test that does, so the teardown behind that window -
    // the popup actually being destroyed, not just marked hidden - is still covered, once, for 1s.
    test('destroys the tooltip element once the fade-out window has passed', async () => {
        const api = await gridMgr.createGridAndWait('myGrid-tooltip-destroy', {
            columnDefs: [{ field: 'A', tooltip: () => 'Base tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        await userEvent.hover(cell);
        await waitForTooltips(1);

        await userEvent.unhover(cell);
        // Hidden immediately, but still attached and fading - which is exactly why the other tests must
        // not poll for removal.
        await waitForTooltips(0);
        expect(getAttachedTooltips()).toHaveLength(1);
        expect(getAttachedTooltips()[0]).toHaveClass('ag-tooltip-hiding');

        await waitForTooltipsDestroyed();
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

        await userEvent.hover(cell);
        await asyncSetTimeout(150);
        expect(getTooltips()).toHaveLength(0);

        // Bounded well under `waitForTooltips`' own 2s cap, which would let any delay up to 2s pass as 200ms.
        // Only ~50ms of the timer is left to run at this point, so the budget is slack, not a race.
        await waitFor(() => expect(getTooltips()).toHaveLength(1), { timeout: 250 });
        const tooltip = getTooltips()[0];
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await asyncSetTimeout(150);
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await asyncSetTimeout(200);
        await waitFor(() => expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(true));
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

        await userEvent.hover(firstCell);
        await waitForTooltips(1);

        await userEvent.unhover(firstCell);
        await asyncSetTimeout(50);

        await userEvent.hover(secondCell);
        await asyncSetTimeout(150);
        expect(hasTooltipText('Row 1')).toBe(false);

        // Bounded below the 500ms `tooltipShowDelay`: unbounded, this passes even when the switch delay is
        // ignored and the tooltip appears on the ordinary show delay instead, which is the whole subject here.
        await waitFor(() => expect(hasTooltipText('Row 1')).toBe(true), { timeout: 250 });
        await new GridRows(api, `respects tooltipSwitchShowDelay when moving between cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 A:"one"
            └── LEAF id:1 A:"two"
        `);
    });
});
