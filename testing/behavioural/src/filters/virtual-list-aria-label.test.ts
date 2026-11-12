import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import { ClientSideRowModelModule, LocaleModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

describe('Virtual list accessible name (AG-19324)', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            LocaleModule,
            TextFilterModule,
            SetFilterModule,
            AdvancedFilterModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    test('the set filter list name takes precedence over ariaDefaultListName', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Canada' }, { country: 'Brazil' }],
            localeText: {
                ariaFilterList: 'Country filter options',
                ariaDefaultListName: 'Generic list',
            },
        });

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        const setFilter = (await api.getColumnFilterInstance('country')) as SetFilter<any>;
        const listbox = setFilter.getGui().querySelector('[role="listbox"]');

        expect(listbox?.getAttribute('aria-label')).toBe('Country filter options');
    });

    test('the advanced filter builder list name takes precedence over ariaDefaultListName', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', filter: 'agTextColumnFilter' }],
            rowData: [{ country: 'Canada' }],
            enableAdvancedFilter: true,
            localeText: {
                ariaAdvancedFilterBuilderList: 'Builder conditions',
                ariaDefaultListName: 'Generic list',
            },
        });

        api.showAdvancedFilterBuilder();
        await asyncSetTimeout(0);

        const tree = document.querySelector('.ag-advanced-filter-builder-virtual-list-container');

        expect(tree?.getAttribute('aria-label')).toBe('Builder conditions');
    });

    test('ariaDefaultListName still names a list that supplies no name of its own', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', filter: 'agTextColumnFilter' }],
            rowData: [{ country: 'Canada' }],
            enableAdvancedFilter: true,
            localeText: {
                ariaDefaultListName: 'Generic list',
            },
        });
        await asyncSetTimeout(0);

        const input = document.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]')!;
        input.focus();
        input.value = 'C';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(0);

        const list = document.querySelector('.ag-autocomplete-list-popup .ag-virtual-list-container');

        expect(list?.getAttribute('aria-label')).toBe('Generic list');
    });
});
