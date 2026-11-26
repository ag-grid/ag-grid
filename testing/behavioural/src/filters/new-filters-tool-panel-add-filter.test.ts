import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
    FloatingFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    selectRichSelectRow,
    setNativeInputValue,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel add filter picker', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a search matching no columns shows and announces "No matches"', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { filter: true },
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
            enableFilterHandlers: true,
        });
        const gridElement = getGridElement(api)!;
        const addButton = await waitFor(() => {
            const button = gridElement.querySelector<HTMLElement>('.ag-filter-add-button');
            expect(button).not.toBeNull();
            return button!;
        });

        await userEvent.click(addButton);
        const input = await waitFor(() => {
            const el = gridElement.querySelector<HTMLInputElement>('.ag-filter-add-select input');
            expect(el).not.toBeNull();
            return el!;
        });
        await userEvent.type(input, 'zzz');

        await waitFor(() =>
            expect(gridElement.querySelector('.ag-rich-select-loading .ag-loading-text')?.textContent).toBe(
                'No matches'
            )
        );
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).toBe('No matches')
        );
    });

    test('a search corrected before "No matches" is announced does not announce it', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { filter: true },
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
            enableFilterHandlers: true,
        });
        const gridElement = getGridElement(api)!;
        const addButton = await waitFor(() => {
            const button = gridElement.querySelector<HTMLElement>('.ag-filter-add-button');
            expect(button).not.toBeNull();
            return button!;
        });

        await userEvent.click(addButton);
        const input = await waitFor(() => {
            const el = gridElement.querySelector<HTMLInputElement>('.ag-filter-add-select input');
            expect(el).not.toBeNull();
            return el!;
        });
        setNativeInputValue(input, 'zzz');
        setNativeInputValue(input, 'cou');

        await waitFor(() =>
            expect(gridElement.querySelector('.ag-rich-select-list')?.textContent).toContain('Country')
        );
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).not.toContain('No matches');
    });

    test('a search that finds no matches again after results return announces "No matches" again', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { filter: true },
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
            enableFilterHandlers: true,
        });
        const gridElement = getGridElement(api)!;
        const addButton = await waitFor(() => {
            const button = gridElement.querySelector<HTMLElement>('.ag-filter-add-button');
            expect(button).not.toBeNull();
            return button!;
        });

        await userEvent.click(addButton);
        const input = await waitFor(() => {
            const el = gridElement.querySelector<HTMLInputElement>('.ag-filter-add-select input');
            expect(el).not.toBeNull();
            return el!;
        });
        const announcement = () => gridElement.querySelector('.ag-aria-description-container')?.textContent;

        setNativeInputValue(input, 'zzz');
        await waitFor(() => expect(announcement()).toBe('No matches'));
        setNativeInputValue(input, 'cou');
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-rich-select-list')?.textContent).toContain('Country')
        );
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        setNativeInputValue(input, 'zzz');
        // A repeat of the same text only reaches screen readers with the service's zero-width-space suffix.
        await waitFor(() => expect(announcement()).toBe('No matches\u200B'));
    });

    test('a search closed with Escape before "No matches" is announced does not announce it', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { filter: true },
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
            enableFilterHandlers: true,
        });
        const gridElement = getGridElement(api)!;
        const addButton = await waitFor(() => {
            const button = gridElement.querySelector<HTMLElement>('.ag-filter-add-button');
            expect(button).not.toBeNull();
            return button!;
        });

        await userEvent.click(addButton);
        const input = await waitFor(() => {
            const el = gridElement.querySelector<HTMLInputElement>('.ag-filter-add-select input');
            expect(el).not.toBeNull();
            return el!;
        });
        setNativeInputValue(input, 'zzz');
        expect(gridElement.querySelector('.ag-rich-select-list')?.textContent).toContain('No matches');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        await waitFor(() => expect(gridElement.querySelector('.ag-filter-add-button')).not.toBeNull());
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).not.toContain('No matches');
    });

    test('removing a card added in the panel clears its floating filter, filter model and row filtering', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { filter: 'agTextColumnFilter', floatingFilter: true },
            rowData: [
                { athlete: 'Michael Phelps', country: 'United States' },
                { athlete: 'Natalie Coughlin', country: 'United States' },
                { athlete: 'Aleksey Nemov', country: 'Russia' },
            ],
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
            enableFilterHandlers: true,
        });
        const gridElement = getGridElement(api)!;
        const card = () => gridElement.querySelector<HTMLElement>('.ag-filter-card:not(.ag-filter-card-add)');
        const countryFloatingFilter = FloatingFilterHarness.get(api, 'country');
        const observe = () => ({
            floatingFilter: countryFloatingFilter.input().value,
            model: api.getColumnFilterModel('country'),
            rows: api.getDisplayedRowCount(),
        });

        await userEvent.click(gridElement.querySelector<HTMLElement>('.ag-filter-add-button')!);
        const searchInput = await waitFor(() => {
            const el = gridElement.querySelector<HTMLInputElement>('.ag-filter-add-select input');
            expect(el).not.toBeNull();
            return el!;
        });
        setNativeInputValue(searchInput, 'cou');
        await selectRichSelectRow('Country', gridElement);
        await waitFor(() => expect(card()).not.toBeNull());
        await api.setColumnFilterModel('country', { filterType: 'text', type: 'contains', filter: 'Russia' });
        api.onFilterChanged();

        await waitFor(() =>
            expect(observe()).toEqual({
                floatingFilter: 'Russia',
                model: { filterType: 'text', type: 'contains', filter: 'Russia' },
                rows: 1,
            })
        );

        await userEvent.click(card()!.querySelector<HTMLElement>('.ag-filter-card-delete')!);

        await waitFor(() => expect(observe()).toEqual({ floatingFilter: '', model: null, rows: 3 }));
        expect(card()).toBeNull();
    });
});
