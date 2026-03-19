import type { GridApi, GridOptions, ISetFilterParams, KeyCreatorParams, ValueFormatterParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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
        modules: [ClientSideRowModelModule, SetFilterModule],
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
        const setFilter = await getSetFilter(api);

        const keys = (await setFilter.handler.valueModel.allKeys) ?? [];
        expect([...keys].sort()).toEqual(['GB', 'JM', 'US', 'ZA']);
    });

    test('filtering with complex object values filters rows correctly', async () => {
        const api = await createGridWithComplexObjects();

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
    });

    test('filtering with multiple complex object keys', async () => {
        const api = await createGridWithComplexObjects();

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
    });

    test('getModelAsString returns formatted values for complex objects', async () => {
        const api = await createGridWithComplexObjects();
        const setFilter = await getSetFilter(api);

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US', 'GB'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const model = api.getFilterModel().country;
        const modelAsString = setFilter.getModelAsString(model);

        expect(modelAsString).toContain('United States');
        expect(modelAsString).toContain('Great Britain');
    });

    test('set filter list items display formatted values, not [object Object]', async () => {
        const api = await createGridWithComplexObjects();
        const setFilter = await getSetFilter(api);

        const allKeys = (await setFilter.handler.valueModel.allKeys) ?? [];
        for (const key of allKeys) {
            const value = setFilter.handler.valueModel.allValues.get(key);
            // The value stored should be the complex object, not a string
            expect(value).toBeDefined();
            expect(typeof value).toBe('object');
        }
    });

    test('mini filter searches against formatted values for complex objects', async () => {
        const api = await createGridWithComplexObjects();
        const setFilter = await getSetFilter(api);

        // Open the filter to initialise the mini filter
        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        setFilter.setMiniFilter('United');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['US']);
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

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);
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

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // Mini filter should search against the formatted country name
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        warnSpy.mockRestore();
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

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // Mini filter should search against the formatted country name
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        warnSpy.mockRestore();
    });

    test('clearing filter restores all rows', async () => {
        const api = await createGridWithComplexObjects();

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
    });

    test('getFilterModel returns keys, not objects', async () => {
        const api = await createGridWithComplexObjects();

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['US', 'ZA'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const model = api.getFilterModel();
        expect(model.country).toEqual({
            filterType: 'set',
            values: ['US', 'ZA'],
        });
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

        const setFilter = await getSetFilter(api);

        api.showColumnFilter('country');
        await asyncSetTimeout(0);

        // No valueParser on colDef, so inference proceeds — valueFormatter is applied
        setFilter.setMiniFilter('Jamaica');
        await asyncSetTimeout(0);

        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys();
        expect(displayedKeys).toEqual(['JM']);

        vi.restoreAllMocks();
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

        await asyncSetTimeout(0);

        // Warning #48: cellDataType 'object' inferred but no valueFormatter provided
        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is "object" (inferred) but no Value Formatter has been provided'),
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
    });
});
