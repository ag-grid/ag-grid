import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, ITooltipComp, ITooltipParams, Module } from 'ag-grid-community';

// Kept in its own file because the interactive tooltip lock and timing transitions are shared by
// tooltip instances within a grid.
describe('Tooltip interaction', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const visibleTooltip = () => getTooltips().find((t) => !t.classList.contains('ag-tooltip-hiding'));

    test('AG-17885 re-hovering a cell whose tooltip is fading re-opens it with tooltipInteraction', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' }, // empty cell, so leaving it has no tooltip to interact with
                { field: 'age', tooltip: () => 'Age tooltip' },
            ],
            rowData: [{ athlete: '', age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: 200,
            tooltipHideDelay: 2000,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-fade', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const athleteCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete')));
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        // show the AGE tooltip
        await userEvent.hover(ageCell);
        await waitFor(() => expect(visibleTooltip()?.textContent).toContain('Age tooltip'));

        // leave AGE: after the 100ms interactive lock, the tooltip starts fading out (1s fade window)
        await userEvent.unhover(ageCell);
        await waitFor(() => expect(getTooltips().some((t) => t.classList.contains('ag-tooltip-hiding'))).toBe(true));
        expect(visibleTooltip()).toBeUndefined();

        // quick detour onto the empty ATHLETE cell, dwelling just under the 100ms interactive lock window
        await userEvent.hover(athleteCell);
        // eslint-disable-next-line no-restricted-syntax -- deliberate dwell just under the 100ms INTERACTIVE_HIDE_DELAY lock window
        await asyncSetTimeout(99);
        await userEvent.unhover(athleteCell);

        // move straight back to AGE while its tooltip is still fading — the tooltip must re-open
        await userEvent.hover(ageCell);
        await waitFor(() => expect(visibleTooltip()?.textContent).toContain('Age tooltip'), { timeout: 2000 });
    });

    test('AG-17885 moving cursor cell -> tooltip -> cell keeps the interactive tooltip open', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'age', tooltip: () => 'Age tooltip' }],
            rowData: [{ age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: 200,
            tooltipHideDelay: 5000,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-keep-open', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        // show the AGE tooltip
        await userEvent.hover(ageCell);
        const tooltip = await waitFor(() => {
            const t = visibleTooltip();
            expect(t?.textContent).toContain('Age tooltip');
            return t!;
        });

        // travel cell -> tooltip -> cell within the interactive lock window; the tooltip must stay open
        await userEvent.unhover(ageCell);
        await userEvent.hover(tooltip);
        await userEvent.unhover(tooltip);
        await userEvent.hover(ageCell);

        // eslint-disable-next-line no-restricted-syntax -- negative assertion: samples past the 100ms INTERACTIVE_HIDE_DELAY so a spurious hide would already have landed
        await asyncSetTimeout(150);
        expect(visibleTooltip()?.textContent).toContain('Age tooltip');
    });

    test('AG-17885 leaving a cell with no tooltip showing does not lock the next tooltip', async () => {
        // The interactive lock (100ms INTERACTIVE_HIDE_DELAY) exists so the cursor can travel from a
        // cell onto its own tooltip. Leaving a cell that has nothing showing must NOT take that lock —
        // otherwise the next cell's tooltip is needlessly delayed by 100ms while it waits it out.
        const SHOW_DELAY = 200;
        const INTERACTIVE_HIDE_DELAY = 100;

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' }, // empty cell, so leaving it has no tooltip to interact with
                { field: 'age', tooltip: () => 'Age tooltip' },
            ],
            rowData: [{ athlete: '', age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: SHOW_DELAY,
            tooltipHideDelay: 2000,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-no-lock', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const athleteCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete')));
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        // hover then leave the empty ATHLETE cell — nothing was showing, so no lock should be taken
        await userEvent.hover(athleteCell);
        await userEvent.unhover(athleteCell);

        // move straight to AGE and time how long its tooltip takes to appear
        const start = performance.now();
        await userEvent.hover(ageCell);
        await waitFor(() => expect(visibleTooltip()?.textContent).toContain('Age tooltip'), { interval: 10 });
        const elapsed = performance.now() - start;

        // without the spurious lock the tooltip shows after ~SHOW_DELAY; a lock would add
        // INTERACTIVE_HIDE_DELAY on top. Assert we land below the midpoint of those two timings.
        expect(elapsed).toBeLessThan(SHOW_DELAY + INTERACTIVE_HIDE_DELAY / 2);
    });

    test('connects an interactive tooltip to its source and supports keyboard entry and dismissal', async () => {
        class InteractiveTooltip implements ITooltipComp {
            private readonly eGui = document.createElement('div');

            public init(params: ITooltipParams): void {
                const input = document.createElement('input');
                const button = document.createElement('button');
                button.textContent = String(params.value);
                this.eGui.append(input, button);
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('tooltip-interaction-keyboard', {
            columnDefs: [{ field: 'age', tooltip: true, tooltipComponent: InteractiveTooltip }],
            rowData: [{ age: 19 }],
            tooltipInteraction: true,
            tooltipTrigger: 'focus',
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        ageCell.focus();
        const tooltip = await waitFor(() => {
            const current = visibleTooltip();
            expect(current).toBeDefined();
            return current!;
        });
        const input = tooltip.querySelector('input')!;
        const button = tooltip.querySelector('button')!;
        const tooltipId = tooltip.id;

        expect(tooltip).toHaveAttribute('role', 'dialog');
        expect(tooltipId).not.toBe('');
        expect(ageCell.getAttribute('aria-describedby')?.split(/\s+/)).toContain(tooltipId);

        await userEvent.keyboard('{Tab}');
        expect(input).toHaveFocus();

        await userEvent.keyboard('{Tab}');
        expect(button).toHaveFocus();
        expect(visibleTooltip()).toBe(tooltip);

        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(visibleTooltip()).toBeUndefined());
        expect(ageCell.getAttribute('aria-describedby') ?? '').not.toContain(tooltipId);
        expect(ageCell).toHaveFocus();
    });
});
