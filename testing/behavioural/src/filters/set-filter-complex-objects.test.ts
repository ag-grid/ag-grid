import type { GridApi, GridOptions, ISetFilterParams, KeyCreatorParams, ValueFormatterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Country {
    name: string;
    code: string;
}

interface RowData {
    athlete: string;
    country: Country;
}

const countryKeyCreator = (params: KeyCreatorParams): string => {
    return params.value.code;
};

const countryValueFormatter = (params: ValueFormatterParams): string => {
    return params.value.name;
};

const ROW_DATA: RowData[] = [
    { athlete: 'Michael Phelps', country: { name: 'United States', code: 'US' } },
    { athlete: 'Usain Bolt', country: { name: 'Jamaica', code: 'JM' } },
    { athlete: 'Mo Farah', country: { name: 'Great Britain', code: 'GB' } },
    { athlete: 'Allyson Felix', country: { name: 'United States', code: 'US' } },
    { athlete: 'Shelly-Ann Fraser-Pryce', country: { name: 'Jamaica', code: 'JM' } },
    { athlete: 'Greg Rutherford', country: { name: 'Great Britain', code: 'GB' } },
    { athlete: 'Wayde van Niekerk', country: { name: 'South Africa', code: 'ZA' } },
];

describe('Set Filter Complex Objects', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule, TextEditorModule],
    });

    afterEach(() => gridsManager.reset());

    async function createGridWithComplexObjects(overrides?: Partial<GridOptions<RowData>>): Promise<GridApi<RowData>> {
        return gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    keyCreator: countryKeyCreator,
                    valueFormatter: countryValueFormatter,
                    filterParams: {
                        valueFormatter: countryValueFormatter,
                        keyCreator: countryKeyCreator,
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
            ...overrides,
        });
    }

    async function getSetFilter(api: GridApi): Promise<SetFilter<any>> {
        const filter = (await api.getColumnFilterInstance('country')) as SetFilter<any> | null | undefined;
        if (!filter) {
            throw new Error('Expected SetFilter instance for country column');
        }
        return filter;
    }

    test('filter keys are created from keyCreator', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `filter keys are created from keyCreator setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, `filter keys are created from keyCreator setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
        const setFilter = await getSetFilter(api);

        const keys = (await setFilter.handler.valueModel.allKeys) ?? [];
        expect([...keys].sort()).toEqual(['GB', 'JM', 'US', 'ZA']);
        await new GridRows(api, `filter keys are created from keyCreator final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
    });

    test('filtering with complex object values filters rows correctly', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `filtering with complex object values filters rows correctly setup`).checkColumns(
            `
                CENTER
                ├── athlete "Athlete" width:200
                └── country "Country" width:200
            `
        );
        await new GridRows(api, `filtering with complex object values filters rows correctly setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const displayedRows: string[] = [];
        api.forEachNodeAfterFilter((node) => {
            if (node.data) {
                displayedRows.push(node.data.athlete);
            }
        });

        expect(displayedRows.sort()).toEqual(['Allyson Felix', 'Michael Phelps']);
        await new GridRows(api, `filtering with complex object values filters rows correctly final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            └── LEAF id:3 athlete:"Allyson Felix" country:"United States"
        `);
    });

    test('filtering with multiple complex object keys', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `filtering with multiple complex object keys setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, `filtering with multiple complex object keys setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US', 'JM'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const displayedRows: string[] = [];
        api.forEachNodeAfterFilter((node) => {
            if (node.data) {
                displayedRows.push(node.data.athlete);
            }
        });

        expect(displayedRows.sort()).toEqual([
            'Allyson Felix',
            'Michael Phelps',
            'Shelly-Ann Fraser-Pryce',
            'Usain Bolt',
        ]);
        await new GridRows(api, `filtering with multiple complex object keys final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            └── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
        `);
    });

    test('getModelAsString returns formatted values for complex objects', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `getModelAsString returns formatted values for complex objects setup`).checkColumns(
            `
                CENTER
                ├── athlete "Athlete" width:200
                └── country "Country" width:200
            `
        );
        await new GridRows(api, `getModelAsString returns formatted values for complex objects setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
        const setFilter = await getSetFilter(api);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US', 'GB'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const model = api.getFilterModel().country;
        const modelAsString = setFilter.getModelAsString(model);

        expect(modelAsString).toContain('United States');
        expect(modelAsString).toContain('Great Britain');
        await new GridRows(api, `getModelAsString returns formatted values for complex objects final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            └── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
        `);
    });

    test('set filter list items display formatted values, not [object Object]', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `set filter list items display formatted values, not [object Object] setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                └── country "Country" width:200
            `);
        await new GridRows(api, `set filter list items display formatted values, not [object Object] setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
        const setFilter = await getSetFilter(api);

        const allKeys = (await setFilter.handler.valueModel.allKeys) ?? [];
        for (const key of allKeys) {
            const value = setFilter.handler.valueModel.allValues.get(key);
            // The value stored should be the complex object, not a string
            expect(value).toBeDefined();
            expect(typeof value).toBe('object');
        }
        await new GridRows(api, `set filter list items display formatted values, not [object Object] final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
                ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
                ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
                ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
                ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
                ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
                └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
            `);
    });

    test('mini filter searches against formatted values for complex objects', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `mini filter searches against formatted values for complex objects setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                └── country "Country" width:200
            `);
        await new GridRows(api, `mini filter searches against formatted values for complex objects setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
        const setFilter = await getSetFilter(api);

        // Open the filter to initialise the mini filter
        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        setFilter.setMiniFilter('United');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['US']);
        await new GridRows(api, `mini filter searches against formatted values for complex objects final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
                ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
                ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
                ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
                ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
                ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
                └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
            `
        );
    });

    test('mini filter with no valueFormatter on filterParams falls back to column valueFormatter', async () => {
        const api = await gridsManager.createGridAndWait('grid2', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    keyCreator: countryKeyCreator,
                    valueFormatter: countryValueFormatter,
                    filterParams: {
                        keyCreator: countryKeyCreator,
                        // No valueFormatter on filterParams — should use column's valueFormatter
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `mini filter with no valueFormatter on filterParams falls back to column valueFor setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(
            api,
            `mini filter with no valueFormatter on filterParams falls back to column valueFor setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);
        await new GridRows(
            api,
            `mini filter with no valueFormatter on filterParams falls back to column valueFor final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('mini filter with cellDataType false does not pass colDef valueFormatter to filter', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid4', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    valueFormatter: countryValueFormatter,
                    cellDataType: false,
                    filterParams: {
                        keyCreator: countryKeyCreator,
                        // No valueFormatter on filterParams, and cellDataType: false prevents auto-propagation
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `mini filter with cellDataType false does not pass colDef valueFormatter to filte setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(
            api,
            `mini filter with cellDataType false does not pass colDef valueFormatter to filte setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // With cellDataType: false, the colDef valueFormatter is not passed to the filter,
        // so mini filter cannot match against formatted names
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual([]);

        vi.restoreAllMocks();
        await new GridRows(
            api,
            `mini filter with cellDataType false does not pass colDef valueFormatter to filte final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('mini filter with explicit cellDataType object uses colDef valueFormatter in filter', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid5', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    cellDataType: 'object',
                    filterParams: {
                        keyCreator: countryKeyCreator,
                        // No valueFormatter on filterParams — should use the one from dataTypeService
                    } as ISetFilterParams,
                },
            ],
            dataTypeDefinitions: {
                object: {
                    baseDataType: 'object',
                    extendsDataType: 'object',
                    valueFormatter: countryValueFormatter,
                },
            },
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `mini filter with explicit cellDataType object uses colDef valueFormatter in filt setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(
            api,
            `mini filter with explicit cellDataType object uses colDef valueFormatter in filt setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // Mini filter should search against the formatted country name
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        warnSpy.mockRestore();
        await new GridRows(
            api,
            `mini filter with explicit cellDataType object uses colDef valueFormatter in filt final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('mini filter with inferred cellDataType object uses colDef valueFormatter in filter', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid6', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // cellDataType will be inferred as 'object' from the complex rowData
                    filterParams: {
                        keyCreator: countryKeyCreator,
                        // No valueFormatter on filterParams — should use the one inferred via dataTypeService
                    } as ISetFilterParams,
                },
            ],
            dataTypeDefinitions: {
                object: {
                    baseDataType: 'object',
                    extendsDataType: 'object',
                    valueFormatter: countryValueFormatter,
                },
            },
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `mini filter with inferred cellDataType object uses colDef valueFormatter in filt setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(
            api,
            `mini filter with inferred cellDataType object uses colDef valueFormatter in filt setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // Mini filter should search against the formatted country name
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        warnSpy.mockRestore();
        await new GridRows(
            api,
            `mini filter with inferred cellDataType object uses colDef valueFormatter in filt final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('clearing filter restores all rows', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `clearing filter restores all rows setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, `clearing filter restores all rows setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('country', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        let rowCount = 0;
        api.forEachNodeAfterFilter((node) => {
            if (node.data) {
                rowCount++;
            }
        });
        expect(rowCount).toBe(ROW_DATA.length);
        await new GridRows(api, `clearing filter restores all rows final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
    });

    test('getFilterModel returns keys, not objects', async () => {
        const api = await createGridWithComplexObjects();
        await new GridColumns(api, `getFilterModel returns keys, not objects setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, `getFilterModel returns keys, not objects setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:1 athlete:"Usain Bolt" country:"Jamaica"
            ├── LEAF id:2 athlete:"Mo Farah" country:"Great Britain"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            ├── LEAF id:4 athlete:"Shelly-Ann Fraser-Pryce" country:"Jamaica"
            ├── LEAF id:5 athlete:"Greg Rutherford" country:"Great Britain"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US', 'ZA'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const model = api.getFilterModel();
        expect(model.country).toEqual({
            filterType: 'set',
            values: ['US', 'ZA'],
        });
        await new GridRows(api, `getFilterModel returns keys, not objects final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            ├── LEAF id:3 athlete:"Allyson Felix" country:"United States"
            └── LEAF id:6 athlete:"Wayde van Niekerk" country:"South Africa"
        `);
    });

    test('editable column with valueParser prevents cellDataType object inference so valueFormatter is not applied', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid7', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    // valueParser on colDef prevents cellDataType inference — 'object' won't be inferred,
                    // so the dataTypeDefinitions.object.valueFormatter won't be applied to this column
                    valueParser: (params) => ({ name: params.newValue, code: params.newValue?.substring(0, 2) }),
                    filterParams: {
                        keyCreator: countryKeyCreator,
                    } as ISetFilterParams,
                },
            ],
            dataTypeDefinitions: {
                object: {
                    baseDataType: 'object',
                    extendsDataType: 'object',
                    valueFormatter: countryValueFormatter,
                    valueParser: (params) => ({ name: params.newValue, code: params.newValue?.substring(0, 2) }),
                },
            },
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `editable column with valueParser prevents cellDataType object inference so value setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200 editable
        `);
        await new GridRows(
            api,
            `editable column with valueParser prevents cellDataType object inference so value setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:{"name":"United States","code":"US"}
            ├── LEAF id:1 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:2 country:{"name":"Great Britain","code":"GB"}
            ├── LEAF id:3 country:{"name":"United States","code":"US"}
            ├── LEAF id:4 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:5 country:{"name":"Great Britain","code":"GB"}
            └── LEAF id:6 country:{"name":"South Africa","code":"ZA"}
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // valueParser on colDef prevented cellDataType:'object' inference, so the object
        // dataTypeDefinition's valueFormatter was never applied to this column.
        // The mini filter cannot match against formatted country names.
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual([]);

        vi.restoreAllMocks();
        await new GridRows(
            api,
            `editable column with valueParser prevents cellDataType object inference so value final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:{"name":"United States","code":"US"}
            ├── LEAF id:1 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:2 country:{"name":"Great Britain","code":"GB"}
            ├── LEAF id:3 country:{"name":"United States","code":"US"}
            ├── LEAF id:4 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:5 country:{"name":"Great Britain","code":"GB"}
            └── LEAF id:6 country:{"name":"South Africa","code":"ZA"}
        `);
    });

    test('editable column with explicit cellDataType object and valueParser still applies valueFormatter', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid8', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    // Explicit cellDataType bypasses inference, so valueParser doesn't prevent it
                    cellDataType: 'object',
                    filterParams: {
                        keyCreator: countryKeyCreator,
                    } as ISetFilterParams,
                },
            ],
            dataTypeDefinitions: {
                object: {
                    baseDataType: 'object',
                    extendsDataType: 'object',
                    valueFormatter: countryValueFormatter,
                    valueParser: (params) => ({ name: params.newValue, code: params.newValue?.substring(0, 2) }),
                },
            },
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `editable column with explicit cellDataType object and valueParser still applies  setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200 editable
        `);
        await new GridRows(
            api,
            `editable column with explicit cellDataType object and valueParser still applies  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // Explicit cellDataType:'object' means the dataTypeDefinition's valueFormatter is applied
        // regardless of whether a valueParser is on the colDef
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        vi.restoreAllMocks();
        await new GridRows(
            api,
            `editable column with explicit cellDataType object and valueParser still applies  final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('editable column without valueParser on colDef infers cellDataType object and applies valueFormatter', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid9', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    // No valueParser on colDef — cellDataType:'object' will be inferred from complex rowData,
                    // and the dataTypeDefinition's valueFormatter + valueParser will both be applied
                    filterParams: {
                        keyCreator: countryKeyCreator,
                    } as ISetFilterParams,
                },
            ],
            dataTypeDefinitions: {
                object: {
                    baseDataType: 'object',
                    extendsDataType: 'object',
                    valueFormatter: countryValueFormatter,
                    valueParser: (params) => ({ name: params.newValue, code: params.newValue?.substring(0, 2) }),
                },
            },
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `editable column without valueParser on colDef infers cellDataType object and app setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200 editable
        `);
        await new GridRows(
            api,
            `editable column without valueParser on colDef infers cellDataType object and app setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // No valueParser on colDef, so inference proceeds — valueFormatter is applied
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        vi.restoreAllMocks();
        await new GridRows(
            api,
            `editable column without valueParser on colDef infers cellDataType object and app final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States"
            ├── LEAF id:1 country:"Jamaica"
            ├── LEAF id:2 country:"Great Britain"
            ├── LEAF id:3 country:"United States"
            ├── LEAF id:4 country:"Jamaica"
            ├── LEAF id:5 country:"Great Britain"
            └── LEAF id:6 country:"South Africa"
        `);
    });

    test('complex objects with no keyCreator or valueFormatter warns and does not show [object Object] in filter list', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid3', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // No keyCreator, no valueFormatter — complex objects will serialise to [object Object]
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `complex objects with no keyCreator or valueFormatter warns and does not show [ob setup`
        ).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(
            api,
            `complex objects with no keyCreator or valueFormatter warns and does not show [ob setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:{"name":"United States","code":"US"}
            ├── LEAF id:1 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:2 country:{"name":"Great Britain","code":"GB"}
            ├── LEAF id:3 country:{"name":"United States","code":"US"}
            ├── LEAF id:4 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:5 country:{"name":"Great Britain","code":"GB"}
            └── LEAF id:6 country:{"name":"South Africa","code":"ZA"}
        `);

        await asyncSetTimeout(0);

        // Warning #48: cellDataType 'object' inferred but no valueFormatter provided
        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object` (inferred) but no Value `Formatter` has been provided'),
            expect.any(String)
        );

        const setFilter = (await api.getColumnFilterInstance('country')) as SetFilter<any>;
        const allKeys = (await setFilter!.handler.valueModel.allKeys) ?? [];

        // Without keyCreator, all complex objects collapse to a single '[object Object]' key
        const keys = [...allKeys];
        for (const key of keys) {
            expect(key).toBe('[object Object]');
        }

        warnSpy.mockRestore();
        await new GridRows(
            api,
            `complex objects with no keyCreator or valueFormatter warns and does not show [ob final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:{"name":"United States","code":"US"}
            ├── LEAF id:1 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:2 country:{"name":"Great Britain","code":"GB"}
            ├── LEAF id:3 country:{"name":"United States","code":"US"}
            ├── LEAF id:4 country:{"name":"Jamaica","code":"JM"}
            ├── LEAF id:5 country:{"name":"Great Britain","code":"GB"}
            └── LEAF id:6 country:{"name":"South Africa","code":"ZA"}
        `);
    });
});
