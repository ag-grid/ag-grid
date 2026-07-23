import { waitFor } from '@testing-library/dom';

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

    async function createGrid(): Promise<GridApi> {
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

    function displayedItemLabels(api: GridApi): string[] {
        const gridEl = getGridElement(api)! as HTMLElement;
        return Array.from(gridEl.querySelectorAll('.ag-column-select-virtual-list-item'), (item) =>
            (item.getAttribute('aria-label') ?? '').toLowerCase()
        );
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

        // The filter dispatch is debounced — wait until the list reflects the filter
        // before pressing Enter, otherwise the toggle would run against stale state.
        await waitFor(() => {
            const labels = displayedItemLabels(api);
            expect(labels.some((l) => l.includes('gold medals'))).toBe(true);
            expect(labels.some((l) => l.includes('silver medals'))).toBe(true);
            expect(labels.some((l) => l.includes('athlete'))).toBe(false);
            expect(labels.some((l) => l.includes('country'))).toBe(false);
        });

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        // Enter toggles the matching (visible) columns off — equivalent to clicking
        // "Select All" for the filtered set — and leaves non-matching columns alone.
        await waitFor(() => {
            expect(api.getColumn('goldMedals')!.isVisible()).toBe(false);
            expect(api.getColumn('silverMedals')!.isVisible()).toBe(false);
        });
        expect(api.getColumn('athlete')!.isVisible()).toBe(true);
        expect(api.getColumn('country')!.isVisible()).toBe(true);
    });
});
