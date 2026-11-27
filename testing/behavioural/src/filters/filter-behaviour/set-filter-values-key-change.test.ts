import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    ColDef,
    DoesFilterPassParams,
    GridApi,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberFilterModule,
    QuickFilterModule,
    TextFilterModule,
    ValueCacheModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    FormulaModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

describe('Set Filter — a column definition change that changes the keys (AG-18657)', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            SetFilterModule,
            ClientSideRowModelModule,
            GridStateModule,
            RowGroupingModule,
            CalculatedColumnsModule,
            FormulaModule,
            MultiFilterModule,
            NewFiltersToolPanelModule,
            NumberFilterModule,
            QuickFilterModule,
            TextFilterModule,
            ValueCacheModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    const CODES: Record<string, string> = { Ireland: 'IE', France: 'FR', Italy: 'IT', Spain: 'ES' };
    const COUNTRY_ROWS = [
        { athlete: 'Anna', country: 'Ireland' },
        { athlete: 'Ben', country: 'France' },
        { athlete: 'Carla', country: 'Italy' },
        { athlete: 'Dan', country: 'Spain' },
    ];
    const COLOUR_ROWS = [
        { item: 'Apple', colour: 'Red' },
        { item: 'Cherry', colour: 'red' },
        { item: 'Sky', colour: 'Blue' },
        { item: 'Sea', colour: 'blue' },
        { item: 'Leaf', colour: 'Green' },
    ];

    function displayed(api: GridApi, field: string): string[] {
        const result: string[] = [];
        api.forEachNodeAfterFilter((node) => result.push(node.data[field]));
        return result;
    }

    async function filterCountries(api: GridApi, values: string[] | null): Promise<void> {
        await api.setColumnFilterModel('country', values && { filterType: 'set', values });
        api.onFilterChanged();
        await asyncSetTimeout(0);
    }

    const countryByCode = {
        field: 'country',
        filter: 'agSetColumnFilter',
        keyCreator: (params: KeyCreatorParams) => CODES[params.value],
        filterParams: { valueFormatter: (params: ValueFormatterParams) => params.value } as ISetFilterParams,
    };

    test('TC1: a new key creator resets the filter instead of leaving no rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Dan']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryByCode]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
        await filterCountries(api, ['FR']);
        expect(displayed(api, 'athlete')).toEqual(['Ben']);
    });

    test('filterParams.keyCreator takes precedence, so a new column keyCreator under it keeps the filter and a new one of its own resets it', async () => {
        const byCode = (params: KeyCreatorParams) => CODES[params.value];
        const valueFormatter = (params: ValueFormatterParams) => params.value;
        const countryCol = (
            keyCreator: (params: KeyCreatorParams) => string,
            filterKeyCreator: (params: KeyCreatorParams) => string
        ) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            keyCreator,
            filterParams: { keyCreator: filterKeyCreator, valueFormatter } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol((params) => params.value.toUpperCase(), byCode)],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['FR', 'IE']);
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol((params) => params.value, byCode)]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['FR', 'IE'] });
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben']);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            countryCol(
                (params) => params.value,
                (params) => CODES[params.value]
            ),
        ]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
    });

    test('TC1: a filter open when the key creator changes shows the reset selection', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France']);
        const filter = await ColumnFilterHarness.open(api, 'country');

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryByCode]);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'reset selection', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Spain
            ☑ France
            ☑ Ireland
            ☑ Italy
            model: null
        `);
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['ES', 'FR', 'IE'] });
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Dan']);
    });

    test('TC1: a new filter value getter resets the filter instead of leaving no rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterValueGetter: ({ data }: { data: { country: string } }) => CODES[data.country],
            },
        ]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
        expect((await ColumnFilterHarness.open(api, 'country')).setFilterItemLabels()).toEqual([
            '(Select All)',
            'ES',
            'FR',
            'IE',
            'IT',
        ]);
    });

    test('TC1: a new key creator in the filter params reaches a filter with no model and no UI', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: COUNTRY_ROWS,
            enableFilterHandlers: true,
        });
        // builds the handler but no UI, so only the handler can re-read the values
        await filterCountries(api, ['France']);
        await filterCountries(api, null);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    keyCreator: (params: KeyCreatorParams) => CODES[params.value],
                    valueFormatter: (params: ValueFormatterParams) => params.value,
                } as ISetFilterParams,
            },
        ]);
        await asyncSetTimeout(0);

        const keys = (api.getColumnFilterHandler('country') as SetFilterHandler).getFilterKeys();
        expect([...keys].sort()).toEqual(['ES', 'FR', 'IE', 'IT']);
        await filterCountries(api, ['FR']);
        expect(displayed(api, 'athlete')).toEqual(['Ben']);
    });

    test('a new valueFormatter resets the filter of a column its data type keys by the formatted value', async () => {
        const dateCol = (format: (value: string) => string) => ({
            field: 'date',
            cellDataType: 'dateString',
            filter: 'agSetColumnFilter',
            valueFormatter: ({ value }: ValueFormatterParams) => (value ? format(value) : ''),
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [dateCol((value) => value.slice(0, 7))],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);

        api.setGridOption('columnDefs', [dateCol((value) => value.slice(0, 4))]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toBeNull();
        expect(displayed(api, 'date')).toEqual(['2024-01-05', '2024-02-05']);
    });

    test('a model applied before the rows arrive survives the data type installing its key creator', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'date', filter: 'agSetColumnFilter' }],
            rowData: [],
        });
        void api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        api.setGridOption('rowData', [{ date: new Date(2024, 0, 5) }, { date: new Date(2024, 1, 5) }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('date')!.getColDef().cellDataType).toBe('date');
        expect(api.getColumnFilterModel('date')).toEqual({ filterType: 'set', values: ['2024-01-05'] });
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('inferring the data type keeps the handler holding an initial filter', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'date', filter: 'agSetColumnFilter' }],
            rowData: [],
            enableFilterHandlers: true,
            initialState: { filter: { filterModel: { date: { filterType: 'set', values: ['2024-01-05'] } } } },
        });
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('date');

        api.setGridOption('rowData', [{ date: new Date(2024, 0, 5) }, { date: new Date(2024, 1, 5) }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('date')!.getColDef().cellDataType).toBe('date');
        expect(api.getColumnFilterHandler('date')).toBe(handler);
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("a new valueFormatter beside the column's own key creator reads the values no more than an unrelated update", async () => {
        const keyCreator = vi.fn((params: KeyCreatorParams) => CODES[params.value]);
        const valueFormatter = ({ value }: ValueFormatterParams) => `${value}`;
        const col = (formatter: (params: ValueFormatterParams) => string, headerName: string) => ({
            field: 'country',
            headerName,
            filter: 'agSetColumnFilter',
            keyCreator,
            valueFormatter: formatter,
            filterParams: { valueFormatter: (params: ValueFormatterParams) => params.value } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, col(valueFormatter, 'Country')],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['ES', 'FR', 'IE']);
        // a header rename measures the keying the grid does on any update
        keyCreator.mockClear();
        api.setGridOption('columnDefs', [{ field: 'athlete' }, col(valueFormatter, 'Nation')]);
        await asyncSetTimeout(0);
        const baseline = keyCreator.mock.calls.length;
        keyCreator.mockClear();

        api.setGridOption('columnDefs', [{ field: 'athlete' }, col(({ value }) => `${value}!`, 'Country')]);
        await asyncSetTimeout(0);

        expect(keyCreator).toHaveBeenCalledTimes(baseline);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['ES', 'FR', 'IE'] });
    });

    test('an update that keeps every key input does not read the rows', async () => {
        const filterValueGetter = vi.fn(({ data }: { data: { country: string } }) => data.country);
        const col = (headerName: string) => ({
            field: 'country',
            headerName,
            filter: 'agSetColumnFilter',
            floatingFilter: true,
            filterValueGetter,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [{ field: 'athlete' }, col('Country')],
            rowData: COUNTRY_ROWS,
        });
        // created here, so the reads counted below are the update's alone
        api.getColumnFilterHandler('country');
        filterValueGetter.mockClear();

        api.setGridOption('columnDefs', [{ field: 'athlete' }, col('Nation')]);
        await asyncSetTimeout(0);
        expect(filterValueGetter).not.toHaveBeenCalled();

        // with a model held the update filters the rows again, and reads no more than that pass does
        await filterCountries(api, ['France', 'Spain']);
        filterValueGetter.mockClear();
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const filterPass = filterValueGetter.mock.calls.length;
        filterValueGetter.mockClear();

        api.setGridOption('columnDefs', [{ field: 'athlete' }, col('Country')]);
        await asyncSetTimeout(0);
        expect(filterValueGetter.mock.calls.length).toBeLessThanOrEqual(filterPass);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['France', 'Spain'] });
    });

    test('turning a column from no data type to a date type resets the filter', async () => {
        const dateCol = (cellDataType: false | 'dateString') => ({
            field: 'date',
            cellDataType,
            filter: 'agSetColumnFilter',
            valueFormatter: ({ value }: ValueFormatterParams) => `${value}`.slice(0, 7),
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [dateCol(false)],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);

        api.setGridOption('columnDefs', [dateCol('dateString')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toBeNull();
        expect(displayed(api, 'date')).toEqual(['2024-01-05', '2024-02-05']);
    });

    test('the same key creator and filter value getter keep the filter, and new ones giving the same keys reset it', async () => {
        const keyCreator = (params: KeyCreatorParams) => params.value;
        const filterValueGetter = ({ data }: { data: { country: string } }) => data.country;
        const countryCol = (functions: Pick<ColDef, 'keyCreator' | 'filterValueGetter'>) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            ...functions,
            filterParams: { valueFormatter: (params: ValueFormatterParams) => params.value } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol({ keyCreator, filterValueGetter })],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol({ keyCreator, filterValueGetter })]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({
            filterType: 'set',
            values: ['France', 'Ireland', 'Spain'],
        });
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Dan']);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            countryCol({ keyCreator: (params) => params.value, filterValueGetter }),
        ]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            countryCol({ keyCreator, filterValueGetter: ({ data }) => data.country }),
        ]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
    });

    test('an edit followed at once by column definitions holding the same functions keeps the filter', async () => {
        const filterValueGetter = ({ data }: { data: { country: string } }) => data.country;
        const countryCol = () => ({ field: 'country', filter: 'agSetColumnFilter', filterValueGetter });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: COUNTRY_ROWS.map((row) => ({ ...row })),
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        // as a framework re-rendering from onCellValueChanged does, before the filter syncs the edit
        api.getRowNode('2')!.setDataValue('country', 'Portugal');
        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol()]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({
            filterType: 'set',
            values: ['France', 'Ireland', 'Spain'],
        });
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Dan']);
    });

    test('switching to a provided list with the same getter keeps the filter and lists the provided values', async () => {
        const filterValueGetter = ({ data }: { data: { v: string } }) => data.v;
        const vCol = (values?: string[]) => ({
            field: 'v',
            filter: 'agSetColumnFilter',
            filterValueGetter,
            filterParams: { values } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name' }, vCol()],
            rowData: [
                { name: 'a', v: 'A' },
                { name: 'b', v: 'B' },
                { name: 'c', v: 'C' },
            ],
        });
        await api.setColumnFilterModel('v', { filterType: 'set', values: ['A'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', [{ field: 'name' }, vCol(['A', 'B', 'C', 'D'])]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('v')).toEqual({ filterType: 'set', values: ['A'] });
        expect(displayed(api, 'name')).toEqual(['a']);
        expect(api.getColumnFilterHandler<SetFilterHandler>('v')!.getFilterKeys()).toEqual(['A', 'B', 'C', 'D']);
    });

    test('a new filter value getter giving the same keys resets the filter and lists its new values', async () => {
        const byCode = ({ value }: KeyCreatorParams) => value.code;
        const countryCol = (suffix: string) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            keyCreator: byCode,
            filterValueGetter: ({ data }: { data: { country: string } }) => ({
                code: CODES[data.country],
                name: `${data.country}${suffix}`,
            }),
            filterParams: { valueFormatter: ({ value }: ValueFormatterParams) => value.name } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol('')],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['ES', 'FR', 'IE']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol('!')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(
            api
                .getColumnFilterHandler<SetFilterHandler<{ name: string }>>('country')!
                .getFilterValues()
                .map((value) => value!.name)
        ).toEqual(['Ireland!', 'France!', 'Italy!', 'Spain!']);
        expect((await ColumnFilterHarness.open(api, 'country')).setFilterItemLabels()).toEqual([
            '(Select All)',
            'Spain!',
            'France!',
            'Ireland!',
            'Italy!',
        ]);
    });

    const PEOPLE_ROWS = [
        { winner: { name: 'bob' }, loser: { name: 'ann' } },
        { winner: { name: 'cat' }, loser: { name: 'dan' } },
    ];
    const byName = ({ value }: ValueFormatterParams) => value?.name;
    const byInitial = ({ value }: ValueFormatterParams) => value?.name[0];

    // The grid gives a selectable object column a getter formatting its values for the text filter it offers.
    const selectablePersonCol = (colDef: ColDef, filters: object[] = [{ filter: 'agSetColumnFilter' }]): ColDef => ({
        colId: 'person',
        cellDataType: 'object',
        filter: 'agSelectableColumnFilter',
        filterParams: { filters },
        ...colDef,
    });

    async function filterPeople(api: GridApi): Promise<void> {
        await api.setColumnFilterModel('person', { filterType: 'set', values: ['bob'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    }

    test("a selectable filter's set filter, named or as the default filter, keys an object column by its formatter, like the column's own", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [selectablePersonCol({ field: 'winner', valueFormatter: byName })],
            rowData: PEOPLE_ROWS,
        });
        expect(api.getColumnFilterHandler<SetFilterHandler>('person')!.getFilterKeys()).toEqual(['bob', 'cat']);
        await filterPeople(api);

        api.setGridOption('columnDefs', [
            selectablePersonCol({ field: 'winner', valueFormatter: byName }, [{ filter: true }]),
        ]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterHandler<SetFilterHandler>('person')!.getFilterKeys()).toEqual(['bob', 'cat']);
        await filterPeople(api);
    });

    test("a selectable filter's child takes `defaultFilterParams` under its own, its params an object or a function", async () => {
        const childParams = { values: ['zed', 'amy'] };
        const labels: Record<string, string[]> = {};
        for (const [form, filterParams] of Object.entries({ object: childParams, function: () => childParams })) {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers: true,
                columnDefs: [
                    {
                        colId: 'person',
                        field: 'winner.name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: {
                            defaultFilterParams: { values: ['default'], suppressSorting: true },
                            filters: [{ filter: 'agSetColumnFilter', filterParams }],
                        },
                    },
                ],
                rowData: PEOPLE_ROWS,
            });
            // the child's `values` win; `suppressSorting`, from the defaults alone, keeps the order supplied
            labels[form] = (await ColumnFilterHarness.open(api, 'person')).setFilterItemLabels();
            gridsManager.reset();
        }
        const expected = ['(Select All)', 'zed', 'amy'];
        expect(labels).toEqual({ object: expected, function: expected });
    });

    test("a selectable filter's Multi Filter children read its own value getter on an object column, its params an object or a function", async () => {
        const rows: string[][] = [];
        const multiParams = { filters: [{ filter: 'agTextColumnFilter' }] };
        for (const filterParams of [multiParams, () => multiParams]) {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers: true,
                columnDefs: [
                    selectablePersonCol({ field: 'winner', valueFormatter: byName }, [
                        {
                            filter: 'agMultiColumnFilter',
                            filterValueGetter: ({ data }: ValueGetterParams) => data.loser.name,
                            filterParams,
                        },
                    ]),
                ],
                rowData: PEOPLE_ROWS,
            });
            await api.setColumnFilterModel('person', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'equals', filter: 'ann' }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            const winners: string[] = [];
            api.forEachNodeAfterFilter((node) => winners.push(node.data.winner.name));
            rows.push(winners);
            gridsManager.reset();
        }

        expect(rows).toEqual([['bob'], ['bob']]);
    });

    test("a selectable filter's multi filter keys its set child by the column's formatter", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                selectablePersonCol({ field: 'winner', valueFormatter: byName }, [{ filter: 'agMultiColumnFilter' }]),
            ],
            rowData: PEOPLE_ROWS,
        });

        await api.setColumnFilterModel('person', {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['bob'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a selectable filter with an empty list of filters offers the default filters', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [selectablePersonCol({ field: 'winner', valueFormatter: byName }, [])],
            rowData: PEOPLE_ROWS,
        });
        api.setGridOption('columnDefs', [
            selectablePersonCol({ field: 'winner', valueFormatter: byName, headerName: 'Winner' }, []),
        ]);
        expect(await api.getColumnFilterInstance('person')).toBeTruthy();
        await filterPeople(api);
    });

    test("a selectable filter's multi filter hands the grid's text getter to a child using the default filter, a text filter, with and without filter handlers", async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        for (const enableFilterHandlers of [true, false]) {
            const api: GridApi = await gridsManager.createGridAndWait(`grid-${enableFilterHandlers}`, {
                enableFilterHandlers,
                columnDefs: [
                    selectablePersonCol({ field: 'winner', valueFormatter: byName }, [
                        { filter: 'agMultiColumnFilter', filterParams: { filters: [{ filter: true }] } },
                    ]),
                ],
                rowData: PEOPLE_ROWS,
            });

            await api.setColumnFilterModel('person', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    });

    test("a selectable filter's multi filter keeps its set child reading the multi filter's getter across updates", async () => {
        const byWinner = ({ data }: { data: { winner: { name: string } } }) => data.winner.name;
        const col = (headerName: string) =>
            // without a data type, only the filters' own inheritance hands the multi filter's getter down
            selectablePersonCol({ field: 'winner', headerName, cellDataType: false }, [
                { filter: 'agMultiColumnFilter', filterValueGetter: byWinner },
            ]);
        const model = { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['bob'] }] };
        // an initial model, so the column definition update is the child's first refresh
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [col('Person')],
            rowData: PEOPLE_ROWS,
            initialState: { filter: { filterModel: { person: model } } },
        });
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);

        api.setGridOption('columnDefs', [col('Person renamed')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('person')).toEqual(model);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("a selectable filter's multi filter chosen in the state hands its getter to a set child without filter handlers", async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        type Person = { data: (typeof PEOPLE_ROWS)[number] };
        const byWinner = ({ data }: Person) => data.winner.name;
        const byLoser = ({ data }: Person) => data.loser.name;
        // the multi filter is the second definition, so only the state's choice makes it active
        const col = (headerName: string, filterValueGetter = byWinner) =>
            selectablePersonCol({ field: 'winner', headerName, cellDataType: false }, [
                { filter: 'agTextColumnFilter' },
                {
                    filter: 'agMultiColumnFilter',
                    filterValueGetter,
                    filterParams: { filters: [{ filter: 'agSetColumnFilter' }] },
                },
            ]);
        const model = { filterType: 'multi', filterModels: [{ filterType: 'set', values: ['bob'] }] };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: false,
            columnDefs: [col('Person')],
            rowData: PEOPLE_ROWS,
            initialState: { filter: { selectableFilters: { person: 1 } } },
        });
        await api.setColumnFilterModel('person', model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);

        // a column definition refresh gives the child its params again
        api.setGridOption('columnDefs', [col('Person renamed')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('person')).toEqual(model);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);

        // the multi filter's new getter re-keys its set child, which then reads through it
        api.setGridOption('columnDefs', [col('Person renamed', byLoser)]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('person')).toBeNull();

        await api.setColumnFilterModel('person', {
            filterType: 'multi',
            filterModels: [{ filterType: 'set', values: ['ann'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("a selectable filter's multi filter hands its getter to a custom child filtering the initial state", async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                selectablePersonCol({ field: 'winner', cellDataType: false }, [
                    {
                        filter: 'agMultiColumnFilter',
                        filterValueGetter: ({ data }: { data: (typeof PEOPLE_ROWS)[number] }) => data.winner.name,
                        filterParams: {
                            filters: [
                                {
                                    filter: {
                                        component: 'agTextColumnFilter',
                                        doesFilterPass: ({ node, handlerParams }: DoesFilterPassParams) =>
                                            handlerParams.getValue(node) === 'bob',
                                    },
                                },
                            ],
                        },
                    },
                ]),
            ],
            rowData: PEOPLE_ROWS,
            initialState: {
                filter: {
                    filterModel: {
                        person: {
                            filterType: 'multi',
                            filterModels: [{ filterType: 'text', type: 'contains', filter: 'any' }],
                        },
                    },
                },
            },
        });
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("a new formatter it is keyed by, or a new field, resets a selectable filter's set filter", async () => {
        const col = (colDef: ColDef) => [selectablePersonCol(colDef)];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: col({ field: 'winner', valueFormatter: byName }),
            rowData: PEOPLE_ROWS,
        });
        await filterPeople(api);

        api.setGridOption('columnDefs', col({ field: 'winner', valueFormatter: byInitial }));
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('person')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(2);

        api.setGridOption('columnDefs', col({ field: 'winner', valueFormatter: byName }));
        await asyncSetTimeout(0);
        await filterPeople(api);
        api.setGridOption('columnDefs', col({ field: 'loser', valueFormatter: byName }));
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('person')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test("inferring an object type keeps a selectable filter's initial set filter", async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            enableFilterHandlers: true,
            columnDefs: [selectablePersonCol({ field: 'winner', valueFormatter: byName, cellDataType: true })],
            rowData: [],
            initialState: { filter: { filterModel: { person: { filterType: 'set', values: ['bob'] } } } },
        });
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('person');

        api.setGridOption('rowData', PEOPLE_ROWS);
        await asyncSetTimeout(0);

        expect(api.getColumn('person')!.getColDef().cellDataType).toBe('object');
        expect(api.getColumnFilterHandler('person')).toBe(handler);
        expect(api.getColumnFilterModel('person')).toEqual({ filterType: 'set', values: ['bob'] });
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("an object column's definition read back and sent without its data type still filters", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    colId: 'person',
                    field: 'winner',
                    cellDataType: 'object',
                    valueFormatter: byName,
                    filter: 'agTextColumnFilter',
                },
            ],
            rowData: PEOPLE_ROWS,
        });
        // the definition read back carries the filter value getter the grid gave the object column
        const [personCol] = api.getColumnDefs() as ColDef[];
        api.setGridOption('columnDefs', [{ ...personCol, cellDataType: false }]);
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('person', { filterType: 'text', type: 'contains', filter: 'bob' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("an object column's definition read back and given another data type filters its values, not their formatted text", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'score',
                    cellDataType: 'object',
                    valueFormatter: ({ value }: ValueFormatterParams) => `#${value}`,
                    filter: 'agTextColumnFilter',
                },
            ],
            rowData: [{ score: 5 }, { score: 20 }],
        });
        const [scoreCol] = api.getColumnDefs() as ColDef[];
        api.setGridOption('columnDefs', [{ ...scoreCol, cellDataType: 'number', filter: 'agNumberColumnFilter' }]);
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('score', { filterType: 'number', type: 'greaterThan', filter: 10 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.score).toBe(20);
        expect(api.getDisplayedRowCount()).toBe(1);

        api.setGridOption('columnDefs', [{ ...scoreCol, cellDataType: 'text', filter: 'agTextColumnFilter' }]);
        await asyncSetTimeout(0);
        await api.setColumnFilterModel('score', { filterType: 'text', type: 'contains', filter: '#' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowCount()).toBe(0);
    });

    test("an object column's definition read back and switched to a set filter, named or as the default filter, keys by its formatter", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    colId: 'person',
                    field: 'winner',
                    cellDataType: 'object',
                    valueFormatter: byName,
                    filter: 'agTextColumnFilter',
                },
            ],
            rowData: PEOPLE_ROWS,
        });
        // the definition read back carries the filter value getter the grid gave the text filter
        const [personCol] = api.getColumnDefs() as ColDef[];
        api.setGridOption('columnDefs', [{ ...personCol, filter: 'agSetColumnFilter' }]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterHandler<SetFilterHandler>('person')!.getFilterKeys()).toEqual(['bob', 'cat']);
        await filterPeople(api);

        api.setGridOption('columnDefs', [{ ...personCol, filter: true }]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterHandler<SetFilterHandler>('person')!.getFilterKeys()).toEqual(['bob', 'cat']);
        await filterPeople(api);
    });

    test("an object column's definition read back and switched to a multi filter keys its set child by its formatter", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    colId: 'person',
                    field: 'winner',
                    cellDataType: 'object',
                    valueFormatter: byName,
                    filter: 'agTextColumnFilter',
                },
            ],
            rowData: PEOPLE_ROWS,
        });
        const [personCol] = api.getColumnDefs() as ColDef[];
        api.setGridOption('columnDefs', [
            {
                ...personCol,
                filter: 'agMultiColumnFilter',
                filterParams: { filters: [{ filter: 'agSetColumnFilter' }] },
            },
        ]);
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('person', {
            filterType: 'multi',
            filterModels: [{ filterType: 'set', values: ['bob'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("an object column's multi filter with a child using the default filter, a text filter, filters by formatted text, as built and read back, with and without filter handlers", async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        const filterBob = async (api: GridApi) => {
            await api.setColumnFilterModel('person', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);
        };
        for (const enableFilterHandlers of [true, false]) {
            const api: GridApi = await gridsManager.createGridAndWait(`grid-${enableFilterHandlers}`, {
                enableFilterHandlers,
                columnDefs: [
                    {
                        colId: 'person',
                        field: 'winner',
                        cellDataType: 'object',
                        valueFormatter: byName,
                        filter: 'agMultiColumnFilter',
                        filterParams: { filters: [{ filter: true }] },
                    },
                ],
                rowData: PEOPLE_ROWS,
            });
            await filterBob(api);

            // the child read back carries the filter value getter the grid gave its text filter
            const [personCol] = api.getColumnDefs() as ColDef[];
            api.setFilterModel(null);
            api.setGridOption('columnDefs', [{ ...personCol, headerName: 'Winner' }]);
            await asyncSetTimeout(0);
            await filterBob(api);
        }
    });

    test("a selectable filter's chosen definition survives an update its column or definition is missing from", async () => {
        const col = selectablePersonCol({ field: 'winner', cellDataType: false }, [
            {
                filter: 'agTextColumnFilter',
                filterValueGetter: ({ data }: { data: (typeof PEOPLE_ROWS)[number] }) => data.winner.name,
            },
            {
                filter: 'agTextColumnFilter',
                filterValueGetter: ({ data }: { data: (typeof PEOPLE_ROWS)[number] }) => data.loser.name,
            },
        ]);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [col],
            rowData: PEOPLE_ROWS,
        });
        api.setState({ filter: { selectableFilters: { person: 1 } } });
        api.setGridOption('quickFilterText', 'ann');
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);

        api.setGridOption('columnDefs', [{ colId: 'other', field: 'winner', cellDataType: false }]);
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [col]);
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);

        // and an update its definition is missing from
        api.setGridOption('columnDefs', [{ ...col, filterParams: { filters: col.filterParams.filters.slice(0, 1) } }]);
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [col]);
        await asyncSetTimeout(0);

        expect(api.getState().filter?.selectableFilters).toEqual({ person: 1 });
        expect(api.getDisplayedRowAtIndex(0)!.data.winner.name).toBe('bob');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test("a new filter value getter on a selectable filter's set definition resets it, and the same one keeps it", async () => {
        const byWinner = ({ data }: { data: (typeof PEOPLE_ROWS)[number] }) => data.winner.name;
        const col = (filterValueGetter: typeof byWinner) =>
            selectablePersonCol({ field: 'winner', cellDataType: false }, [
                { filter: 'agSetColumnFilter', filterValueGetter },
            ]);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [col(byWinner)],
            rowData: PEOPLE_ROWS,
        });
        await filterPeople(api);

        api.setGridOption('columnDefs', [col(byWinner)]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('person')).toEqual({ filterType: 'set', values: ['bob'] });

        api.setGridOption('columnDefs', [col(({ data }) => data.winner.name)]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('person')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test("the quick filter reads a selectable filter's active definition, chosen or by default, as the column definitions now give it", async () => {
        type Getter = (params: { data: (typeof PEOPLE_ROWS)[number] }) => string;
        const byLoser: Getter = ({ data }) => data.loser.name;
        const byWinner: Getter = ({ data }) => data.winner.name;
        const col = (first: Getter, second: Getter) =>
            selectablePersonCol({ field: 'winner', cellDataType: false }, [
                { filter: 'agTextColumnFilter', filterValueGetter: first },
                { filter: 'agTextColumnFilter', filterValueGetter: second },
            ]);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            sideBar: 'filters-new',
            columnDefs: [col(byLoser, byWinner)],
            rowData: PEOPLE_ROWS,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'person' }] } },
                },
            },
        });
        api.setGridOption('quickFilterText', 'ann');
        await asyncSetTimeout(0);
        // by default the first definition, which reads the loser
        expect(api.getDisplayedRowCount()).toBe(1);

        api.setState({ filter: { selectableFilters: { person: 1 } } });
        api.setGridOption('columnDefs', [col(byLoser, byWinner)]);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(0);

        api.setGridOption('columnDefs', [col(byLoser, byLoser)]);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);

        // removing the filter from the tool panel goes back to the default definition
        api.setGridOption('columnDefs', [col(byLoser, byWinner)]);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(0);
        document.querySelector<HTMLElement>('.ag-filter-card-delete')!.click();
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a set filter whose new key creator throws while it is recreated can still be destroyed', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France']);

        const throwingKeys = {
            field: 'country',
            filter: 'agSetColumnFilter',
            keyCreator: (): string => {
                throw new Error('no key');
            },
            filterParams: { values: ['France'], valueFormatter: byName } as ISetFilterParams,
        };
        expect(() => api.setGridOption('columnDefs', [{ field: 'athlete' }, throwingKeys])).toThrow('no key');
        api.destroy();

        expect(api.isDestroyed()).toBe(true);
    });

    test('a new valueGetter beside an unchanged field resets the filter', async () => {
        const countryCol = (valueGetter: (params: { data: { country: string } }) => string) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            valueGetter,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol(({ data }) => data.country)],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(({ data }) => CODES[data.country])]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
    });

    test('a getter expression spelled like the field path resets the filter, as it reads a different value', async () => {
        const col = (extra?: ColDef): ColDef => ({
            colId: 'country',
            field: 'data.country',
            cellDataType: false,
            filter: 'agSetColumnFilter',
            ...extra,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [col()],
            // the field path reads `data.country`; an expression's `data` is the row itself
            rowData: [
                { data: { country: 'France' }, country: 'Ireland' },
                { data: { country: 'Spain' }, country: 'Italy' },
            ],
        });
        await filterCountries(api, ['France']);
        expect(api.getDisplayedRowCount()).toBe(1);

        api.setGridOption('columnDefs', [col({ filterValueGetter: 'data.country' })]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();

        api.setGridOption('columnDefs', [col()]);
        await asyncSetTimeout(0);
        await filterCountries(api, ['France']);
        api.setGridOption('columnDefs', [col({ valueGetter: 'data.country' })]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('an empty filter value getter, which the grid does not read, leaves the field as the source of the values', async () => {
        const col = (field: string, filterValueGetter?: string): ColDef => ({
            colId: 'country',
            field,
            filterValueGetter,
            filter: 'agSetColumnFilter',
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [col('home', '')],
            rowData: [
                { home: 'France', away: 'Ireland' },
                { home: 'Spain', away: 'Italy' },
            ],
        });
        await filterCountries(api, ['France']);

        api.setGridOption('columnDefs', [col('away', '')]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();

        await filterCountries(api, ['Ireland']);
        api.setGridOption('columnDefs', [col('away')]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Ireland'] });
    });

    test('a new calculated expression resets the filter, and an unchanged one or allowFormula keeps it', async () => {
        const col = (calculatedExpression: string, headerName: string, allowFormula = false) => ({
            colId: 'x',
            headerName,
            calculatedExpression,
            allowFormula,
            filter: 'agSetColumnFilter',
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            calculatedColumns: true,
            columnDefs: [{ field: 'a' }, col('[a]*2', 'X')],
            rowData: [{ a: 1 }, { a: 2 }, { a: 3 }],
        });
        await api.setColumnFilterModel('x', { filterType: 'set', values: ['2', '4'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'a')).toEqual([1, 2]);

        api.setGridOption('columnDefs', [{ field: 'a' }, col('[a]*2', 'Double')]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('x')).toEqual({ filterType: 'set', values: ['2', '4'] });

        // a calculated column's value is its expression's result, whatever allowFormula says
        api.setGridOption('columnDefs', [{ field: 'a' }, col('[a]*2', 'Double', true)]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('x')).toEqual({ filterType: 'set', values: ['2', '4'] });

        api.setGridOption('columnDefs', [{ field: 'a' }, col('[a]*3', 'Triple')]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('x')).toBeNull();
        expect(displayed(api, 'a')).toEqual([1, 2, 3]);
    });

    test('turning allowFormula off resets the filter, but not where a filterValueGetter supplies the values', async () => {
        const byName = ({ data }: { data: { name: string } }) => data.name;
        const cols = (allowFormula: boolean): ColDef[] => [
            { field: 'name' },
            { field: 'r', allowFormula, filter: 'agSetColumnFilter' },
            { colId: 'g', field: 'r', allowFormula, filterValueGetter: byName, filter: 'agSetColumnFilter' },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: cols(true),
            rowData: [
                { name: 'a', r: '=1+1' },
                { name: 'b', r: '=1+2' },
            ],
        });
        await api.setColumnFilterModel('r', { filterType: 'set', values: ['2'] });
        await api.setColumnFilterModel('g', { filterType: 'set', values: ['a'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('r')).toEqual({ filterType: 'set', values: ['2'] });

        api.setGridOption('columnDefs', cols(false));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('r')).toBeNull();
        expect(api.getColumnFilterModel('g')).toEqual({ filterType: 'set', values: ['a'] });
    });

    test('a getter reading a column redefined in the same update reads its new definition, in the filter and the value cache', async () => {
        const xCol = () => ({
            colId: 'x',
            filter: 'agSetColumnFilter',
            valueGetter: ({ getValue }: { getValue: (colKey: string) => string }) => getValue('w'),
        });
        const wCol = (field: 'a' | 'b') => ({
            colId: 'w',
            valueGetter: ({ data }: { data: { a: string; b: string } }) => data[field],
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            valueCache: true,
            columnDefs: [xCol(), wCol('a')],
            rowData: [
                { a: 'A', b: 'B' },
                { a: 'A2', b: 'B2' },
            ],
        });
        await api.setColumnFilterModel('x', { filterType: 'set', values: ['A'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);

        const keysOfX = () => api.getColumnFilterHandler<SetFilterHandler>('x')!.getFilterKeys();

        // with a model the filter is recreated, without one it re-reads in place
        api.setGridOption('columnDefs', [xCol(), wCol('b')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('x')).toBeNull();
        expect(api.getCellValue({ rowNode: api.getRowNode('0')!, colKey: 'w' })).toBe('B');
        expect(keysOfX()).toEqual(['B', 'B2']);

        api.setGridOption('columnDefs', [xCol(), wCol('a')]);
        await asyncSetTimeout(0);

        expect(keysOfX()).toEqual(['A', 'A2']);
        await api.setColumnFilterModel('x', { filterType: 'set', values: ['A'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('x')).toEqual({ filterType: 'set', values: ['A'] });
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a new treeListPathGetter, which the keys do not depend on, keeps the filter', async () => {
        const dateCol = (separator: string) => ({
            field: 'date',
            cellDataType: 'dateString',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
                treeListPathGetter: (value: string | null) => (value ? value.split(separator) : null),
            } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [dateCol('-')],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', [dateCol('/')]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toEqual({ filterType: 'set', values: ['2024-01-05'] });
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);
    });

    test('provided values are keyed like the rows once the data type is inferred', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: [new Date(2024, 0, 5), new Date(2024, 1, 5)] } as ISetFilterParams<
                        any,
                        Date
                    >,
                },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        // created before the rows, as a floating filter or an initial model would create it
        api.getColumnFilterHandler<SetFilterHandler>('date');

        api.setGridOption('rowData', [{ date: new Date(2024, 0, 5) }, { date: new Date(2024, 1, 5) }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('date')!.getColDef().cellDataType).toBe('date');
        const keys = api.getColumnFilterHandler<SetFilterHandler>('date')!.getFilterKeys();
        expect(keys).toEqual(['2024-01-05', '2024-02-05']);
        await api.setColumnFilterModel('date', { filterType: 'set', values: [keys[0]] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('inferring the data type keeps an initial filter over provided values', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['2024-01-05', '2024-02-05'] } as ISetFilterParams,
                },
            ],
            rowData: [],
            enableFilterHandlers: true,
            initialState: { filter: { filterModel: { date: { filterType: 'set', values: ['2024-01-05'] } } } },
        });
        await asyncSetTimeout(0);
        const handler = api.getColumnFilterHandler('date');

        api.setGridOption('rowData', [{ date: '2024-01-05' }, { date: '2024-02-05' }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('date')!.getColDef().cellDataType).toBe('dateString');
        expect(api.getColumnFilterHandler('date')).toBe(handler);
        expect(api.getColumnFilterModel('date')).toEqual({ filterType: 'set', values: ['2024-01-05'] });
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);
    });

    test('a data type given through the default column definition resets the filter its formatter keys', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            defaultColDef: { cellDataType: false },
            columnDefs: [
                {
                    field: 'date',
                    valueFormatter: ({ value }: ValueFormatterParams) => value.slice(0, 7),
                    filter: 'agSetColumnFilter',
                },
            ],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);

        api.setGridOption('defaultColDef', { cellDataType: 'dateString' });
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toBeNull();
        expect(displayed(api, 'date')).toEqual(['2024-01-05', '2024-02-05']);
        expect(api.getColumnFilterHandler<SetFilterHandler>('date')!.getFilterKeys()).toEqual(['2024-01', '2024-02']);
    });

    test("a new definition of a type the column's data type extends resets the filter and keys by its formatter", async () => {
        const myDate = { baseDataType: 'dateString' as const, extendsDataType: 'myBase' };
        const definitions = (valueFormatter: (params: ValueFormatterParams) => string) => ({
            myBase: { baseDataType: 'dateString' as const, extendsDataType: 'dateString' as const, valueFormatter },
            myDate,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            dataTypeDefinitions: definitions(({ value }) => value),
            columnDefs: [{ field: 'date', cellDataType: 'myDate', filter: 'agSetColumnFilter' }],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'date')).toEqual(['2024-01-05']);

        api.setGridOption(
            'dataTypeDefinitions',
            definitions(({ value }) => value.slice(0, 7))
        );
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toBeNull();
        expect(displayed(api, 'date')).toEqual(['2024-01-05', '2024-02-05']);
        expect(api.getColumnFilterHandler<SetFilterHandler>('date')!.getFilterKeys()).toEqual(['2024-01', '2024-02']);
    });

    test('replacing dataTypeDefinitions resets the filter of a column its data type formats, as the formatter is rebuilt', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', cellDataType: 'dateString', filter: 'agSetColumnFilter' }],
            rowData: [{ date: '2024-01-05' }, { date: '2024-02-05' }],
        });
        await api.setColumnFilterModel('date', { filterType: 'set', values: ['2024-01-05'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        api.setGridOption('dataTypeDefinitions', { myText: { baseDataType: 'text', extendsDataType: 'text' } });
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('date')).toBeNull();
        expect(displayed(api, 'date')).toEqual(['2024-01-05', '2024-02-05']);
    });

    test('new keys with a new values callback ask it for values once, with or without a model', async () => {
        let calls = 0;
        const colDefs = (caseSensitive: boolean): ColDef[] => [
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    caseSensitive,
                    values: (params: SetFilterValuesFuncParams) => {
                        calls++;
                        params.success(['France', 'Ireland']);
                    },
                } as ISetFilterParams,
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: colDefs(false),
            rowData: COUNTRY_ROWS,
        });
        // created with no model, as a floating filter would create it
        api.getColumnFilterHandler<SetFilterHandler>('country');
        await asyncSetTimeout(0);
        calls = 0;

        // without a model it takes the new keys in place, reading the values once; the callback runs a task
        // after the update, and a second load would run a task after it
        api.setGridOption('columnDefs', colDefs(true));
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(calls).toBe(1);

        await filterCountries(api, ['France']);
        calls = 0;

        // with a model the filter is recreated, and only the new one asks
        api.setGridOption('columnDefs', colDefs(false));
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(calls).toBe(1);
    });

    test('a new value getter keeps a filter over provided values, which are keyed from the list', async () => {
        const countryCol = (): ColDef => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            valueGetter: ({ data }) => data.country,
            filterParams: { values: ['France', 'Ireland', 'Italy', 'Spain'] } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol()]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['France'] });
        expect(displayed(api, 'athlete')).toEqual(['Ben']);
    });

    test('a new value getter and a new empty supplied list keep a filter over it, which lists no values', async () => {
        const countryCol = (): ColDef => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            valueGetter: ({ data }) => data.country,
            filterParams: { values: [], defaultToNothingSelected: true } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, []);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol()]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: [] });
        expect(api.getColumnFilterHandler<SetFilterHandler>('country')!.getFilterKeys()).toEqual([]);
        expect(displayed(api, 'athlete')).toEqual([]);
    });

    test('a new value getter and a new values callback keep a filter over the values it supplies, whatever its declared parameters', async () => {
        const supplied = ['France', 'Germany', 'Ireland', 'Italy', 'Spain'];
        const countryCol = (): ColDef => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            valueGetter: ({ data }) => data.country,
            // a rest parameter declares none, so the callback's length is 0
            filterParams: {
                values: (...args: [SetFilterValuesFuncParams]) => args[0].success(supplied),
            } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol()]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['France'] });
        expect(api.getColumnFilterHandler<SetFilterHandler>('country')!.getFilterKeys()).toEqual(supplied);
        expect(displayed(api, 'athlete')).toEqual(['Ben']);
    });

    test('an update that drops the provided values and changes the value getter resets the filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    valueGetter: ({ data }) => data.country,
                    filterParams: { values: ['France', 'Ireland', 'Italy', 'Spain'] } as ISetFilterParams,
                },
            ],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France']);

        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            { field: 'country', filter: 'agSetColumnFilter', valueGetter: ({ data }) => CODES[data.country] },
        ]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
    });

    test('an open tree list takes its new path getter when the keys change with it', async () => {
        const countryCol = (caseSensitive: boolean, treeListPathGetter: (value: string | null) => string[] | null) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: { caseSensitive, treeList: true, treeListPathGetter } as ISetFilterParams,
        });
        const byInitialThenName = (value: string | null) => (value ? [value[0], value] : null);
        const byName = (value: string | null) => (value ? [value] : null);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [countryCol(false, byInitialThenName)],
            rowData: COUNTRY_ROWS,
        });
        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'F', 'I', 'S']);

        api.setGridOption('columnDefs', [countryCol(true, byName)]);
        await asyncSetTimeout(0);

        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'France', 'Ireland', 'Italy', 'Spain']);
    });

    test('provided values keep the filter under the same key creator and reset under a new one', async () => {
        // primitive values with a key creator are only warned about, and still keyed by it
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [210] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const countryCol = (keyCreator: (params: KeyCreatorParams) => string) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            keyCreator,
            filterParams: {
                values: ['France', 'Ireland', 'Italy', 'Spain'],
                valueFormatter: (params: ValueFormatterParams) => params.value,
            } as ISetFilterParams,
        });
        const byName = (params: KeyCreatorParams) => params.value;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol(byName)],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(byName)]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({
            filterType: 'set',
            values: ['France', 'Ireland', 'Spain'],
        });

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol((params) => CODES[params.value])]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Carla', 'Dan']);
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #210');
    });

    test('turning treeList on for the group column, which keys rows by their group path, resets the filter', async () => {
        const keyCreator = ({ value }: KeyCreatorParams) => (Array.isArray(value) ? value.join('#') : value);
        const valueFormatter = ({ value }: ValueFormatterParams) => `${value}`;
        const groupCol = (treeList: boolean) => ({
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: { treeList, keyCreator, valueFormatter } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', hide: true },
            ],
            autoGroupColumnDef: groupCol(false),
            groupDefaultExpanded: -1,
            rowData: [
                { country: 'Ireland', athlete: 'Anna' },
                { country: 'France', athlete: 'Ben' },
            ],
        });
        const colId = api
            .getAllDisplayedColumns()
            .find((column) => column.getColDef().showRowGroup)!
            .getColId();
        const leafAthletes = () => {
            const athletes: string[] = [];
            api.forEachNodeAfterFilter((node) => {
                if (node.data) {
                    athletes.push(node.data.athlete);
                }
            });
            return athletes;
        };
        await api.setColumnFilterModel(colId, { filterType: 'set', values: ['Anna'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(leafAthletes()).toEqual(['Anna']);

        api.setGridOption('autoGroupColumnDef', groupCol(true));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel(colId)).toBeNull();
        expect(leafAthletes()).toEqual(['Anna', 'Ben']);
    });

    test('grouping removed through the API stays removed across a header rename, and keeps the tree list filter', async () => {
        // any refresh re-reads the grouping, so no stale state resets the filter on an unrelated update
        const keyCreator = ({ value }: KeyCreatorParams) => (Array.isArray(value) ? value.join('#') : value);
        const valueFormatter = ({ value }: ValueFormatterParams) => `${value}`;
        const cols = (headerName: string): ColDef[] => [
            { field: 'country', rowGroup: true, hide: true },
            {
                colId: 'group',
                headerName,
                showRowGroup: 'country',
                cellRenderer: 'agGroupCellRenderer',
                filter: 'agSetColumnFilter',
                filterParams: { treeList: true, keyCreator, valueFormatter } as ISetFilterParams,
            },
            { field: 'athlete' },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            groupDisplayType: 'custom',
            columnDefs: cols('Group'),
            rowData: COUNTRY_ROWS,
        });
        await api.setColumnFilterModel('group', { filterType: 'set', values: ['Ireland'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        api.setRowGroupColumns([]);
        await asyncSetTimeout(0);
        const model = api.getColumnFilterModel('group');

        api.setGridOption('columnDefs', cols('Group renamed'));
        await asyncSetTimeout(0);

        expect(model).not.toBeNull();
        expect(api.getColumnFilterModel('group')).toEqual(model);
    });

    test('TC2: changing caseSensitive resets the filter', async () => {
        const colourCol = (caseSensitive: boolean) => ({
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: { caseSensitive } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'item' }, colourCol(false)],
            rowData: COLOUR_ROWS,
        });
        await api.setColumnFilterModel('colour', { filterType: 'set', values: ['Blue', 'Red'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayed(api, 'item')).toEqual(['Apple', 'Cherry', 'Sky', 'Sea']);

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol(true)]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('colour')).toBeNull();
        expect(displayed(api, 'item')).toEqual(['Apple', 'Cherry', 'Sky', 'Sea', 'Leaf']);
        expect((await ColumnFilterHarness.open(api, 'colour')).setFilterItemLabels()).toEqual([
            '(Select All)',
            'Blue',
            'Green',
            'Red',
            'blue',
            'red',
        ]);
    });

    test('changing caseSensitive with no filter applied refolds the values', async () => {
        const colourCol = (caseSensitive: boolean) => ({
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: { caseSensitive } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'item' }, colourCol(false)],
            rowData: COLOUR_ROWS,
        });
        const handler = api.getColumnFilterHandler<SetFilterHandler>('colour')!;
        expect(handler.getFilterKeys()).toEqual(['Red', 'Blue', 'Green']);

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol(true)]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterHandler('colour')).toBe(handler);
        expect(handler.getFilterKeys()).toEqual(['Red', 'red', 'Blue', 'blue', 'Green']);
    });

    test('a new excelMode or comparator, which the keys do not depend on, keeps the filter and re-sorts its list', async () => {
        const descending = (a: string | null, b: string | null) => (b ?? '').localeCompare(a ?? '');
        const ascending = (a: string | null, b: string | null) => (a ?? '').localeCompare(b ?? '');
        const countryCol = (
            excelMode?: 'windows',
            comparator?: typeof descending,
            colDefComparator?: typeof descending
        ) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            comparator: colDefComparator,
            filterParams: { comparator, excelMode } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: [...COUNTRY_ROWS, { athlete: 'Eve', country: null }],
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);
        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            'France',
            'Ireland',
            'Italy',
            'Spain',
        ]);
        const update = async (...args: Parameters<typeof countryCol>) => {
            api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(...args)]);
            await asyncSetTimeout(0);
        };

        // the blanks go last in Excel mode
        await update('windows');
        expect(filter.setFilterItemLabels()).toEqual([
            '(Select All)',
            'France',
            'Ireland',
            'Italy',
            'Spain',
            '(Blanks)',
        ]);
        await update('windows', undefined, descending);
        expect(filter.setFilterItemLabels()).toEqual([
            '(Select All)',
            'Spain',
            'Italy',
            'Ireland',
            'France',
            '(Blanks)',
        ]);
        // the filter's own comparator comes before the column's
        await update('windows', ascending, descending);
        expect(filter.setFilterItemLabels()).toEqual([
            '(Select All)',
            'France',
            'Ireland',
            'Italy',
            'Spain',
            '(Blanks)',
        ]);

        expect(api.getColumnFilterModel('country')).toEqual({
            filterType: 'set',
            values: ['France', 'Ireland', 'Spain'],
        });
        expect(displayed(api, 'athlete')).toEqual(['Anna', 'Ben', 'Dan']);
    });

    test('TC3: a model naming one value in two spellings, or twice, keeps the other values filtered out', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'item' }, { field: 'colour', filter: 'agSetColumnFilter' }],
            rowData: COLOUR_ROWS,
        });
        // three entries against three values, so counting the spellings would read as all selected
        await api.setColumnFilterModel('colour', { filterType: 'set', values: ['Red', 'red', 'Blue'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('colour')).toEqual({ filterType: 'set', values: ['Red', 'Blue'] });
        expect(displayed(api, 'item')).toEqual(['Apple', 'Cherry', 'Sky', 'Sea']);

        await api.setColumnFilterModel('colour', { filterType: 'set', values: ['Red', 'Red', 'Blue'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('colour')).toEqual({ filterType: 'set', values: ['Red', 'Blue'] });
        expect(displayed(api, 'item')).toEqual(['Apple', 'Cherry', 'Sky', 'Sea']);
    });

    test('a values callback whose filter is destroyed before it runs is never called', async () => {
        let calls = 0;
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: () => calls++ },
                },
            ],
            rowData: COLOUR_ROWS,
        });
        expect(api.getColumnFilterHandler('colour')).toBeDefined();
        api.destroyFilter('colour');
        await asyncSetTimeout(0);
        expect(calls).toBe(0);

        // control: the same callback runs once its filter outlives the deferral
        api.getColumnFilterHandler('colour');
        await asyncSetTimeout(0);
        expect(calls).toBe(1);
    });

    test('a values callback answering again is not read, so a selection still to be applied is kept', async () => {
        let answer: ((values: string[]) => void) | undefined;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        buttons: ['apply'],
                        values: ({ success }: SetFilterValuesFuncParams) => {
                            answer = success;
                        },
                    },
                },
            ],
            rowData: COLOUR_ROWS,
        });
        // opened while the values load, so the list waits on the answer
        const filter = await ColumnFilterHarness.open(api, 'colour');
        await asyncSetTimeout(0);
        answer!(['Red', 'Blue']);
        await asyncSetTimeout(0);
        await filter.toggleSetItem('Red');

        answer!(['Red', 'Blue']);
        await asyncSetTimeout(0);
        await filter.apply();
        answer!(['Green']);
        await asyncSetTimeout(0);

        expect({
            model: api.getColumnFilterModel('colour'),
            keys: (api.getColumnFilterHandler('colour') as SetFilterHandler).getFilterKeys(),
        }).toEqual({ model: { filterType: 'set', values: ['Blue'] }, keys: ['Red', 'Blue'] });
    });

    test('values reloaded before the rows arrive read the rows once, when they arrive', async () => {
        const reads: number[] = [];
        for (const refreshes of [0, 5]) {
            let read = 0;
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'colour',
                        filter: 'agSetColumnFilter',
                        filterValueGetter: ({ data }) => {
                            ++read;
                            return data.colour;
                        },
                    },
                ],
            });
            const handler = api.getColumnFilterHandler('colour') as SetFilterHandler;
            for (let i = 0; i < refreshes; ++i) {
                handler.refreshFilterValues();
            }
            api.setGridOption('rowData', COLOUR_ROWS);
            await asyncSetTimeout(0);
            reads.push(read);
            gridsManager.reset();
        }
        expect(reads[0]).toBeGreaterThan(0);
        expect(reads[1]).toBe(reads[0]);
    });

    test('a model set while a values callback is pending is not replaced by one set before it', async () => {
        const respond: (() => void)[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'item' },
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => {
                            respond.push(() => params.success(['Red', 'Blue', 'Green']));
                        },
                    },
                },
            ],
            rowData: COLOUR_ROWS,
        });
        await asyncSetTimeout(0);
        // Folded to 'Red' once the values arrive, which must not replace the model set after it.
        for (const values of [['red'], ['Blue']]) {
            void api.setColumnFilterModel('colour', { filterType: 'set', values });
            api.onFilterChanged();
            await asyncSetTimeout(0);
        }

        // The callback must have run, or the model below would hold without it.
        expect(respond).toHaveLength(1);
        respond[0]();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('colour')).toEqual({ filterType: 'set', values: ['Blue'] });
        await new GridRows(api, 'the model set last filters the rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 item:"Sky" colour:"Blue"
            └── LEAF id:3 item:"Sea" colour:"blue"
        `);
    });

    test('a values callback answering after a newer one does not replace its values, nor is its answer read', async () => {
        const pending: ((values: { colour: string }[]) => void)[] = [];
        const keyed: string[] = [];
        const keyCreator = ({ value }: KeyCreatorParams) => {
            keyed.push(value.colour);
            return value.colour;
        };
        const valueFormatter = ({ value }: ValueFormatterParams) => value?.colour;
        const colourCol = (): ColDef => ({
            field: 'colour',
            keyCreator,
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter,
                values: (params: SetFilterValuesFuncParams<any, { colour: string }>) => pending.push(params.success),
            },
        });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'item' }, colourCol()],
            rowData: COLOUR_ROWS,
        });
        const handler = api.getColumnFilterHandler<SetFilterHandler>('colour')!;
        await asyncSetTimeout(0);
        pending[0]([{ colour: 'Red' }]);

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        expect(pending.length).toBe(3);
        pending[2]([{ colour: 'Blue' }]);
        pending[1]([{ colour: 'Green' }]);
        await asyncSetTimeout(0);

        expect(handler.getFilterKeys()).toEqual(['Blue']);
        expect(keyed).not.toContain('Green');
    });

    test('a values callback overtaken by another is not called if it has not been, and an open filter waits on the newest alone', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const colourCol = (): ColDef => ({
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: { values: (params: SetFilterValuesFuncParams) => pending.push(params.success) },
        });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'item' }, colourCol()],
            rowData: COLOUR_ROWS,
        });
        await asyncSetTimeout(0);
        const filter = await ColumnFilterHarness.open(api, 'colour');
        const loading = () => !document.querySelector('.ag-filter-loading')!.classList.contains('ag-hidden');

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        expect(pending.length).toBe(2);
        pending[0](['Red']);
        await asyncSetTimeout(0);
        expect(loading()).toBe(true);

        pending[1](['Blue']);
        await asyncSetTimeout(0);
        expect(loading()).toBe(false);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Blue']);
    });

    test('a filter opened while a later values callback is pending shows its loading', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const colourCol = (): ColDef => ({
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: { values: (params: SetFilterValuesFuncParams) => pending.push(params.success) },
        });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'item' }, colourCol()],
            rowData: COLOUR_ROWS,
        });
        api.getColumnFilterHandler('colour');
        await asyncSetTimeout(0);
        pending[0](['Red']);
        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        expect(pending.length).toBe(2);

        await ColumnFilterHarness.open(api, 'colour');
        expect(document.querySelector('.ag-filter-loading')!.classList.contains('ag-hidden')).toBe(false);
    });

    // The mini filter sits under the loading message, so focusing it would announce a field nobody can see.
    test('a filter opened while its values load focuses the loading message, then the mini filter once they land', async () => {
        const pending: ((values: string[]) => void)[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'item' },
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: (params: SetFilterValuesFuncParams) => pending.push(params.success) },
                },
            ],
            rowData: COLOUR_ROWS,
        });
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'colour');
        const loading = document.querySelector<HTMLElement>('.ag-filter-loading')!;
        expect(document.activeElement).toBe(loading);
        expect(loading.getAttribute('role')).toBe('status');

        pending[0](['Red']);
        await asyncSetTimeout(0);
        expect(document.activeElement).toBe(document.querySelector('.ag-mini-filter input'));
    });

    test("a values callback overtaken by a values list or the grid's own values ends its loading, whether or not it ever answers", async () => {
        const pending: ((values: string[]) => void)[] = [];
        const colourCol = (values: ISetFilterParams['values']): ColDef => ({
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: { values },
        });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'item' },
                colourCol((params: SetFilterValuesFuncParams) => pending.push(params.success)),
            ],
            rowData: COLOUR_ROWS,
        });
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'colour');
        const loading = () => !document.querySelector('.ag-filter-loading')!.classList.contains('ag-hidden');
        expect(loading()).toBe(true);

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol(['Red', 'Blue'])]);
        await asyncSetTimeout(0);
        expect(loading()).toBe(false);
        pending[0](['Green']);
        await asyncSetTimeout(0);

        expect(loading()).toBe(false);
        expect(api.getColumnFilterHandler<SetFilterHandler>('colour')!.getFilterKeys()).toEqual(['Red', 'Blue']);

        api.setGridOption('columnDefs', [
            { field: 'item' },
            colourCol((params: SetFilterValuesFuncParams) => pending.push(params.success)),
        ]);
        await asyncSetTimeout(0);
        expect(loading()).toBe(true);
        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol(undefined)]);
        await asyncSetTimeout(0);
        expect(loading()).toBe(false);
        pending[1](['Green']);
        await asyncSetTimeout(0);

        expect(loading()).toBe(false);
        expect(api.getColumnFilterHandler<SetFilterHandler>('colour')!.getFilterKeys()).toEqual([
            'Red',
            'Blue',
            'Green',
        ]);
    });
});
