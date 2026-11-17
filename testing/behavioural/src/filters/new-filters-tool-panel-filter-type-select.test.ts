import { getByRole, waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel filter type select', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    function createGrid(gridOptions: GridOptions = {}): GridApi {
        return gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'athlete' }],
            defaultColDef: { filter: 'agSelectableColumnFilter' },
            rowData: [{ athlete: 'Michael Phelps' }],
            sideBar: 'filters-new',
            enableFilterHandlers: true,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'athlete', expanded: true }] } },
                },
            },
            ...gridOptions,
        });
    }

    async function getFilterCardBody(api: GridApi): Promise<HTMLElement> {
        return waitFor(() => {
            const body = getGridElement(api)!.querySelector<HTMLElement>('.ag-filter-card-body');
            expect(body).not.toBeNull();
            return body!;
        });
    }

    afterEach(() => {
        gridsManager.reset();
    });

    test.each<{ name: string; gridOptions: GridOptions; expectedName: string }>([
        { name: 'default', gridOptions: {}, expectedName: 'Filter Type' },
        {
            name: 'localised',
            gridOptions: { localeText: { ariaLabelFilterCardType: 'Type de filtre' } },
            expectedName: 'Type de filtre',
        },
    ])('filter type combobox has the $name accessible name', async ({ gridOptions, expectedName }) => {
        const api = createGrid(gridOptions);
        const body = await getFilterCardBody(api);

        const filterTypeSelect = await waitFor(() => getByRole(body, 'combobox', { name: expectedName }));
        expect(filterTypeSelect.closest('.ag-filter-type-select')).not.toBeNull();
    });
});
