import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout, setNativeInputValue } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel add filter picker', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a search matching no columns shows and announces "No matches to show"', async () => {
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
            expect(gridElement.querySelector('.ag-rich-select-list')?.textContent).toContain('No matches to show')
        );
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).toBe('No matches to show')
        );
    });

    test('a search corrected before "No matches to show" is announced does not announce it', async () => {
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
        expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).not.toContain(
            'No matches to show'
        );
    });

    test('a search that finds no matches again after results return announces "No matches to show" again', async () => {
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
        await waitFor(() => expect(announcement()).toBe('No matches to show'));
        setNativeInputValue(input, 'cou');
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-rich-select-list')?.textContent).toContain('Country')
        );
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        setNativeInputValue(input, 'zzz');
        // A repeat of the same text only reaches screen readers with the service's zero-width-space suffix.
        await waitFor(() => expect(announcement()).toBe('No matches to show\u200B'));
    });
});
