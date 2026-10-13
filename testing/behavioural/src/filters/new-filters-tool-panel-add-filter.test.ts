import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

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
});
