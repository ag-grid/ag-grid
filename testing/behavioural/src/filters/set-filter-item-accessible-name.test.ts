import '@testing-library/jest-dom/vitest';
import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, ISetFilterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    value: string | null;
}

describe('Set Filter item accessible name', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, SetFilterModule] });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    let nextId = 0;
    const rows = (...values: (string | null)[]): Row[] => values.map((value) => ({ id: String(nextId++), value }));

    function createGrid(rowData: Row[], filterParams: ISetFilterParams = {}): GridApi<Row> {
        return gridsManager.createGrid<Row>('grid', {
            columnDefs: [{ field: 'value', filter: 'agSetColumnFilter', filterParams }],
            getRowId: ({ data }) => data.id,
            rowData,
        });
    }

    const options = () =>
        Array.from(document.querySelectorAll<HTMLElement>('.ag-filter-menu .ag-filter-virtual-list-item'));

    /** Each option is named once: by its own aria-label, with the visible label hidden from its name. */
    function expectNamedOnce(names: (string | null)[], checkboxNames: string[] = names as string[]) {
        const items = options();
        expect(items.map((el) => el.getAttribute('aria-label'))).toEqual(names);
        items.forEach((el, i) => {
            expect(el.querySelector('.ag-checkbox-label')!.getAttribute('aria-hidden')).toBe('true');
            expect(el.querySelector('input')).toHaveAccessibleName(checkboxNames[i]);
        });
    }

    test('(Select All), values and blanks are each named by their text', async () => {
        const api = createGrid(rows('A', 'B', null));
        await ColumnFilterHarness.open(api, 'value');

        expectNamedOnce(['(Select All)', '(Blanks)', 'A', 'B']);
    });

    test('in Excel mode the names follow a mini filter search', async () => {
        const api = createGrid(rows('A', 'B'), { excelMode: 'windows' });
        const filter = await ColumnFilterHarness.open(api, 'value');

        await filter.miniFilterSearch('A');

        expectNamedOnce(['(Select All Search Results)', 'Add current selection to filter', 'A']);
    });

    test('a retained value takes its retained name and returns to its text', async () => {
        const api = createGrid(rows('A', 'B'), { preservePreviousValues: true });
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'value');

        api.setGridOption('rowData', rows('A'));
        await asyncSetTimeout(0);
        expectNamedOnce(['(Select All)', 'A', 'B, not in current data'], ['(Select All)', 'A', 'B']);

        api.setGridOption('rowData', rows('A', 'B'));
        await asyncSetTimeout(0);
        expectNamedOnce(['(Select All)', 'A', 'B']);
    });

    test('an item drawn by a cell renderer is named once by its checkbox', async () => {
        const api = createGrid(rows('A'), {
            cellRenderer: (params: { value: unknown }) => `<b>${params.value}</b>`,
        });
        await ColumnFilterHarness.open(api, 'value');

        expectNamedOnce([null, null], ['(Select All)', 'A']);
    });

    test('tree list items keep their own labelling', async () => {
        const api = createGrid(rows('A'), {
            treeList: true,
            treeListPathGetter: (value: string | null) => [value ?? ''],
        });
        await ColumnFilterHarness.open(api, 'value');

        const items = options();
        expect(items.map((el) => el.getAttribute('aria-label'))).toEqual([
            '(Select All) Filter Value',
            'A Filter Value',
        ]);
        expect(items.map((el) => el.querySelector('.ag-checkbox-label')!.getAttribute('aria-hidden'))).toEqual([
            'false',
            'false',
        ]);
    });
});
