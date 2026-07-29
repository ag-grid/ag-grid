import type { ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('Columns Tool Panel — Enter in filter input toggles matching columns', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const columnDefs: ColDef[] = [
        { field: 'goldMedals', headerName: 'Gold Medals' },
        { field: 'silverMedals', headerName: 'Silver Medals' },
        { field: 'athlete', headerName: 'Athlete' },
        { field: 'country', headerName: 'Country' },
    ];

    const rowData = [Object.fromEntries(columnDefs.map((c) => [c.field!, `val_${c.field}`]))];

    async function createGrid(toolPanelParams?: Record<string, unknown>): Promise<GridApi> {
        return gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams,
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
    }

    function forceVirtualListRender(api: GridApi): void {
        const gridEl = getGridElement(api)! as HTMLElement;
        const viewport = gridEl.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        // jsdom has no layout engine so offsetHeight returns 0, which prevents the
        // virtual list from rendering items. Override it on the instance.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    function getFilterInput(api: GridApi): HTMLInputElement {
        const gridEl = getGridElement(api)! as HTMLElement;
        const input = gridEl.querySelector<HTMLInputElement>('.ag-column-select-header-filter-wrapper input');
        if (!input) {
            throw new Error('Columns tool panel filter input not found');
        }
        return input;
    }

    function setNativeInputValue(input: HTMLInputElement, value: string): void {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    test('pressing Enter toggles visibility of columns matching the filter text only', async () => {
        const api = await createGrid();
        forceVirtualListRender(api);

        // all columns start visible
        expect(api.getColumn('goldMedals')!.isVisible()).toBe(true);
        expect(api.getColumn('silverMedals')!.isVisible()).toBe(true);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect(api.getColumn('country')!.isVisible()).toBe(true);

        const input = getFilterInput(api);
        setNativeInputValue(input, 'medals');

        // Press Enter immediately, without waiting for the debounced filter to settle.
        // Enter must flush the pending filter and then toggle synchronously, so the
        // visibility change is observable with no await — this is what distinguishes the
        // event-driven flush from the previous deferred-timer implementation.
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        // Enter toggles the matching (visible) columns off — equivalent to clicking
        // "Select All" for the filtered set — and leaves non-matching columns alone.
        expect(api.getColumn('goldMedals')!.isVisible()).toBe(false);
        expect(api.getColumn('silverMedals')!.isVisible()).toBe(false);
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect(api.getColumn('country')!.isVisible()).toBe(true);
    });

    test('Enter does not toggle while an IME composition is active (Safari reports isComposing=false)', async () => {
        const api = await createGrid();
        forceVirtualListRender(api);

        const input = getFilterInput(api);
        setNativeInputValue(input, 'medals');

        // Safari fires the composition-confirming Enter keydown with isComposing already
        // false, before compositionend. Explicit composition tracking must still suppress
        // the toggle — asserting via isComposing=false here is what discriminates the
        // tracked-state guard from the isComposing-only guard.
        input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(api.getColumn('goldMedals')!.isVisible()).toBe(true);
        expect(api.getColumn('silverMedals')!.isVisible()).toBe(true);

        // Once composition ends, Enter confirms and toggles the matching set as usual.
        input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(api.getColumn('goldMedals')!.isVisible()).toBe(false);
        expect(api.getColumn('silverMedals')!.isVisible()).toBe(false);
    });

    test('Enter does not toggle when suppressColumnSelectAll hides the select-all capability', async () => {
        const api = await createGrid({ suppressColumnSelectAll: true });
        forceVirtualListRender(api);

        const input = getFilterInput(api);
        setNativeInputValue(input, 'medals');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        // Select-all is suppressed, so the Enter shortcut must not perform the bulk
        // toggle it would otherwise dispatch.
        expect(api.getColumn('goldMedals')!.isVisible()).toBe(true);
        expect(api.getColumn('silverMedals')!.isVisible()).toBe(true);
    });
});
