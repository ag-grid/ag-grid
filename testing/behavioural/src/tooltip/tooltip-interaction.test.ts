import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

// Kept in its own file: the interactive tooltip lock (`isLocked`) is module-global shared state,
// so a run that leaves it stuck would poison sibling tests. Per-file isolation contains that.
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
                { field: 'age', tooltipValueGetter: () => 'Age tooltip' },
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
        await asyncSetTimeout(260);
        await waitFor(() => expect(visibleTooltip()?.textContent).toContain('Age tooltip'));

        // leave AGE: after the 100ms interactive lock, the tooltip starts fading out (1s fade window)
        await userEvent.unhover(ageCell);
        await waitFor(() => expect(getTooltips().some((t) => t.classList.contains('ag-tooltip-hiding'))).toBe(true));
        expect(visibleTooltip()).toBeUndefined();

        // quick detour onto the empty ATHLETE cell, dwelling just under the 100ms interactive lock window
        await userEvent.hover(athleteCell);
        await asyncSetTimeout(99);
        await userEvent.unhover(athleteCell);

        // move straight back to AGE while its tooltip is still fading — the tooltip must re-open
        await userEvent.hover(ageCell);
        await waitFor(() => expect(visibleTooltip()?.textContent).toContain('Age tooltip'), { timeout: 2000 });
    });

    test('AG-17885 moving cursor cell -> tooltip -> cell keeps the interactive tooltip open', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'age', tooltipValueGetter: () => 'Age tooltip' }],
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
        await asyncSetTimeout(260);
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

        await asyncSetTimeout(150);
        expect(visibleTooltip()?.textContent).toContain('Age tooltip');
    });
});
