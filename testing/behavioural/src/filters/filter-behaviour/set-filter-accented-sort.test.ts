import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

describe('Set Filter list order follows accentedSort', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const names = ['Zoe', 'Åsa', 'Anna', 'Örjan', 'Ola'];
    const unicodeOrder = ['(Select All)', 'Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan'];
    const swedishOrder = ['(Select All)', 'Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan'];
    const germanOrder = ['(Select All)', 'Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe'];

    async function createGrid(options: Partial<GridOptions> & { column?: ColDef }): Promise<GridApi> {
        const { column, ...gridOptions } = options;
        return gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agSetColumnFilter', ...column }],
            rowData: names.map((name) => ({ name })),
            ...gridOptions,
        });
    }

    async function listOrder(api: GridApi): Promise<string[]> {
        const filter = await ColumnFilterHarness.open(api, 'name');
        await asyncSetTimeout(0);
        return filter.setFilterItemLabels();
    }

    test('without accentedSort the list is in Unicode order', async () => {
        const api = await createGrid({});
        expect(await listOrder(api)).toEqual(unicodeOrder);
    });

    test('`accentedSort: true` sorts the list with localeCompare', async () => {
        const values = ['b', 'à', 'a', 'z'];
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agSetColumnFilter' }],
            rowData: values.map((name) => ({ name })),
            accentedSort: true,
        });
        expect(await listOrder(api)).toEqual(['(Select All)', ...[...values].sort((a, b) => a.localeCompare(b))]);
    });

    test('the object form sorts the list with that locale', async () => {
        const api = await createGrid({ accentedSort: { locales: 'de' } });
        expect(await listOrder(api)).toEqual(germanOrder);
    });

    test('colDef.accentedSort overrides the grid option', async () => {
        const api = await createGrid({ accentedSort: { locales: 'sv' }, column: { accentedSort: { locales: 'de' } } });
        expect(await listOrder(api)).toEqual(germanOrder);
    });

    test('defaultColDef.accentedSort applies to the list', async () => {
        const api = await createGrid({ defaultColDef: { accentedSort: { locales: 'de' } } });
        expect(await listOrder(api)).toEqual(germanOrder);
    });

    test('changing the grid option at runtime sorts the list again', async () => {
        const api = await createGrid({ accentedSort: { locales: 'sv' } });
        const filter = await ColumnFilterHarness.open(api, 'name');
        expect(filter.setFilterItemLabels()).toEqual(swedishOrder);

        api.setGridOption('accentedSort', { locales: 'de' });
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(germanOrder);

        api.setGridOption('accentedSort', false);
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(unicodeOrder);
    });

    test('changing the grid option at runtime keeps the filter model', async () => {
        const api = await createGrid({ accentedSort: { locales: 'sv' } });
        await api.setColumnFilterModel('name', { filterType: 'set', values: ['Åsa', 'Zoe'] });
        api.onFilterChanged();

        api.setGridOption('accentedSort', { locales: 'de' });
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('name')).toEqual({ filterType: 'set', values: ['Åsa', 'Zoe'] });
        expect(await listOrder(api)).toEqual(germanOrder);
    });

    test('changing the grid option does not reorder a column with its own accentedSort', async () => {
        const api = await createGrid({ accentedSort: { locales: 'sv' }, column: { accentedSort: { locales: 'de' } } });
        const filter = await ColumnFilterHarness.open(api, 'name');
        expect(filter.setFilterItemLabels()).toEqual(germanOrder);

        api.setGridOption('accentedSort', false);
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(germanOrder);
    });

    test('changing colDef.accentedSort at runtime sorts the list again', async () => {
        const api = await createGrid({});
        const filter = await ColumnFilterHarness.open(api, 'name');
        expect(filter.setFilterItemLabels()).toEqual(unicodeOrder);

        api.setGridOption('columnDefs', [
            { field: 'name', filter: 'agSetColumnFilter', accentedSort: { locales: 'de' } },
        ]);
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(germanOrder);
    });

    test('a comparator in the filter params takes precedence over accentedSort', async () => {
        const descending = (a: string | null, b: string | null) =>
            (b ?? '') < (a ?? '') ? -1 : (b ?? '') > (a ?? '') ? 1 : 0;
        const api = await createGrid({
            accentedSort: { locales: 'de' },
            column: { filterParams: { comparator: descending } },
        });
        expect(await listOrder(api)).toEqual(['(Select All)', 'Örjan', 'Åsa', 'Zoe', 'Ola', 'Anna']);
    });
});
