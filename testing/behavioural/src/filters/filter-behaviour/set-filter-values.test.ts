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
    FilterInputCallbackParams,
    GridApi,
    GridOptions,
    ISetFilterCellRendererParams,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
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

/**
 * Black-box coverage for the agSetColumnFilter value model + UI, targeting gaps left by
 * set-filter-reuse / set-filter-complex-objects: async value callbacks, mini-filter case-sensitivity,
 * (Select All) tri-state, (Blanks), keyCreator label-vs-key, apply-button, model round-trip, suppressMiniFilter.
 */
describe('Set Filter — value model & UI (coverage)', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
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

    test('async values callback populates the list and round-trips through the model', async () => {
        const options: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        // Async source: values come from the callback, not the grid data.
                        values: (params: SetFilterValuesFuncParams) => {
                            params.success(['France', 'Germany', 'Italy']);
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Spain' }, { country: 'France' }],
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', options);

        const filter = await ColumnFilterHarness.open(api, 'country');
        // 'Spain' exists in the data but is not in the async list; 'Germany' is in the list but not the data.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'France', 'Germany', 'Italy']);

        await filter.toggleSetItem('France');
        await filter.toggleSetItem('Germany');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new FilterDom(api, 'async values', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ France
            ☐ Germany
            ☑ Italy
            model:
              values:
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'async values rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('mini-filter is case-insensitive by default', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('aus');
        await asyncSetTimeout(0);

        // Lowercase query still matches the capitalised items.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);
        await new FilterDom(api, 'case-insensitive mini-filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "aus"
            ☑ (Select All)
            ☑ Australia
            ☑ Austria
            model: null
        `);
        // Mini-filter search narrows the list only; displayed rows are unaffected (model null).
        await new GridRows(api, 'case-insensitive mini-filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"Austria"
            └── LEAF id:2 country:"Italy"
        `);
    });

    // One `textFormatter` on `defaultColDef.filterParams` reaches Text and Set columns alike, so calling it
    // with no params here would hand a shared function `undefined` on exactly the Set ones.
    test('the mini-filter `textFormatter` is given the column params, not called bare', async () => {
        const sources: (string | undefined)[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        textFormatter: (from: string, params: FilterInputCallbackParams) => {
                            sources.push(params?.source);
                            return from;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('aus');
        await asyncSetTimeout(0);

        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);
        expect(sources.length).toBeGreaterThan(0);
        expect([...new Set(sources)]).toEqual(['columnFilter']);
    });

    test('caseSensitive mini-filter only matches the exact case', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { caseSensitive: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('aus');
        await asyncSetTimeout(0);
        // Lowercase 'aus' matches nothing when case-sensitive.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)']);

        await filter.miniFilterSearch('Aus');
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);
        await new FilterDom(api, 'case-sensitive mini-filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Aus"
            ☑ (Select All)
            ☑ Australia
            ☑ Austria
            model: null
        `);
        // Case-sensitive search still leaves displayed rows untouched (model null).
        await new GridRows(api, 'case-sensitive mini-filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"Austria"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('(Select All) is indeterminate for a partial subset and clears the model when re-selected', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Partial: deselect one → (Select All) goes indeterminate, model carries the remaining keys.
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia', 'Italy'] });
        await new FilterDom(api, 'select-all partial', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "Australia"
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'select-all partial rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            └── LEAF id:2 country:"Italy"
        `);

        // Re-select the last unchecked item → everything selected ⇒ filter inactive (model null).
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'select-all all', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
        await new GridRows(api, 'select-all all rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('undefined values render as (Blanks) and filter to the blank rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: undefined }, { country: 'Australia' }, {}],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Australia', 'Italy']);

        // Keep only the blanks.
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: [null] });
        await new FilterDom(api, 'undefined blanks', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Australia
            ☐ Italy
            model:
              values:
                - null
              filterType: "set"
        `);
        await new GridRows(api, 'undefined blanks rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1
            └── LEAF id:3
        `);
    });

    // `zz` is the discriminator: it is present and equally unnameable, and must NOT read as blank.
    test('a blank the grid formatted itself reads (Blanks), a present unmappable key does not', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'refData', filter: 'agSetColumnFilter', refData: { it: 'Italy' } }],
            rowData: [{ refData: 'it' }, { refData: null }, { refData: '' }, { refData: 'zz' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'refData');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Italy', '']);

        // null and '' share one key, so the label cannot affect what is filtered.
        await filter.toggleSetItem('Italy');
        await filter.toggleSetItem('');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: [null] });
        await new FilterDom(api, 'refData blanks', { colId: 'refData' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Italy
            ☐
            model:
              values:
                - null
              filterType: "set"
        `);
        await new GridRows(api, 'blank rows only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 refData:null
            └── LEAF id:2 refData:""
        `);
    });

    // The blank key keeps the first value it sees, so whitespace arriving first must still read (Blanks).
    test('a whitespace value reached before an empty one still reads (Blanks)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: '   ' }, { country: '' }, { country: null }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Italy']);
    });

    // A supplied formatter owns how its own blanks read, so an empty answer from one is not overridden.
    test('a valueFormatter answering empty for a blank keeps that empty label', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'formatted',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        valueFormatter: ({ value }: ValueFormatterParams) => (value === 'it' ? 'Italy' : ''),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ formatted: 'it' }, { formatted: null }, { formatted: '' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'formatted');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '', 'Italy']);
    });

    // Supplied values ARE the list, so a blank appears only if one was supplied.
    test('a supplied values list without a blank shows no blank entry, however the data reads', async () => {
        const options = (values: (string | null)[]): GridOptions => ({
            columnDefs: [
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    refData: { cb: 'Cadet Blue', bw: 'Burlywood' },
                    filterParams: { values } as ISetFilterParams,
                },
            ],
            rowData: [{ colour: '' }, { colour: 'cb' }, { colour: 'bw' }],
        });

        const withoutBlank: GridApi = await gridsManager.createGridAndWait('grid1', options(['cb', 'bw']));
        const noBlankFilter = await ColumnFilterHarness.open(withoutBlank, 'colour');
        expect(noBlankFilter.setFilterItemLabels()).toEqual(['(Select All)', 'Burlywood', 'Cadet Blue']);
        gridsManager.reset();

        const withBlank: GridApi = await gridsManager.createGridAndWait('grid1', options(['cb', 'bw', null]));
        const blankFilter = await ColumnFilterHarness.open(withBlank, 'colour');
        expect(blankFilter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Burlywood', 'Cadet Blue']);
    });

    // Per data type: a missing value reads (Blanks), a present unreadable one is named, never conflated.
    test('cellDataType date names an unreadable value rather than calling it blank', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', cellDataType: 'date', filter: 'agSetColumnFilter' }],
            rowData: [{ when: new Date(2024, 0, 10) }, { when: new Date('nonsense') }, { when: null }, { when: '' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'when');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', '2024', 'Invalid Date']);
    });

    // Unlike `date`, a dateString's key is its formatted value, which is '' when the parser rejects it.
    test('cellDataType dateString folds an unreadable value onto the blank key', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', cellDataType: 'dateString', filter: 'agSetColumnFilter' }],
            rowData: [{ when: '2024-01-10' }, { when: 'not a date' }, { when: null }, { when: '' }],
        });

        const handler = api.getColumnFilterHandler<SetFilterHandler>('when')!;
        expect(handler.getFilterKeys()).toEqual(['2024-01-10', null]);
        const filter = await ColumnFilterHarness.open(api, 'when');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', '2024']);
    });

    test('cellDataType date lists a value that is not a Date instead of throwing', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'when', cellDataType: 'date', filter: 'agSetColumnFilter' },
                { field: 'stamp', cellDataType: 'dateTime', filter: 'agSetColumnFilter' },
            ],
            rowData: [
                { when: new Date(2024, 0, 10), stamp: new Date(2024, 0, 10) },
                { when: 'not a date', stamp: 42 },
                { when: { nope: true }, stamp: [1, 2] },
            ],
        });

        // A non-Date has a real key whose tree *path* is empty, so its blank row sorts after the dates,
        // unlike a `null` key, which sorts first.
        const whenFilter = await ColumnFilterHarness.open(api, 'when');
        expect(whenFilter.setFilterItemLabels()).toEqual(['(Select All)', '2024', '(Blanks)']);

        const stampFilter = await ColumnFilterHarness.open(api, 'stamp');
        expect(stampFilter.setFilterItemLabels()).toEqual(['(Select All)', '2024', '(Blanks)']);
    });

    test('a data type key creator does not report supplied primitive values as complex objects', async () => {
        // The suite throws on any severity, so #210 firing would abort the grid; the spy makes that legible
        // to a reader, and keeps the test honest if the id is ever suppressed here.
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'when',
                    cellDataType: 'dateString',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['2024-01-10', '2024-06-01'] } as ISetFilterParams,
                },
            ],
            rowData: [{ when: '2024-01-10' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'when');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '2024']);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    test("replacing dataTypeDefinitions keeps a data type key creator recognised as the grid's", async () => {
        // The check is an identity comparison against the data type's own formatter, and `updateDataTypes`
        // rebuilds those, so the user-keyCreator column is the control that proves #210 still fires at all.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [210] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'when',
                    cellDataType: 'date',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['2024'] } as ISetFilterParams,
                },
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    keyCreator: ({ value }) => String(value),
                    filterParams: {
                        values: ['red'],
                        valueFormatter: ({ value }: ValueFormatterParams) => String(value),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ when: new Date(2024, 0, 1), colour: 'red' }],
        });

        api.setGridOption('dataTypeDefinitions', { myText: { baseDataType: 'text', extendsDataType: 'text' } });
        api.setGridOption('rowData', [{ when: new Date(2024, 0, 2), colour: 'red' }]);
        await asyncSetTimeout(0);

        await ColumnFilterHarness.open(api, 'when');
        expect(warnSpy).not.toHaveBeenCalled();

        await ColumnFilterHarness.open(api, 'colour');
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #210');
        warnSpy.mockRestore();
    });

    test("a user's key creator still reports supplied primitive values as complex objects", async () => {
        // Deliberate: a user key creator with primitive values is what warning #210 exists to report.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [210] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    keyCreator: ({ value }) => String(value),
                    filterParams: {
                        values: ['red', 'green'],
                        valueFormatter: ({ value }) => String(value),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ colour: 'red' }],
        });
        await ColumnFilterHarness.open(api, 'colour');

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #210');
    });

    // number and bigint do not use their formatter as the keyCreator, so the two states are already distinct.
    test('cellDataType number and bigint separate a missing value from an unreadable one', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'num', cellDataType: 'number', filter: 'agSetColumnFilter' },
                { field: 'big', cellDataType: 'bigint', filter: 'agSetColumnFilter' },
            ],
            rowData: [
                { num: 42, big: 10n },
                { num: 'abc', big: 'xyz' },
                { num: null, big: null },
                { num: '', big: '' },
            ],
        });

        const numHandler = api.getColumnFilterHandler<SetFilterHandler>('num')!;
        expect(numHandler.getFilterKeys()).toEqual(['42', 'abc', null]);
        const numFilter = await ColumnFilterHarness.open(api, 'num');
        // The unreadable value keeps its own entry, echoed rather than named, and only the missing one is blank.
        expect(numFilter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', '42', 'abc']);

        const bigFilter = await ColumnFilterHarness.open(api, 'big');
        expect(bigFilter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', '10', 'xyz']);
    });

    test('cellDataType boolean reads a missing or whitespace value as blank', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'flag', cellDataType: 'boolean', filter: 'agSetColumnFilter' }],
            rowData: [{ flag: true }, { flag: false }, { flag: null }, { flag: '' }, { flag: '   ' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'flag');
        // One blank entry: `null`, '' and whitespace all fold onto the same key.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'False', 'True']);
    });

    test('cellDataType object reads a missing value as blank and keeps a present one formatted', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'who',
                    cellDataType: 'object',
                    filter: 'agSetColumnFilter',
                    valueFormatter: ({ value }: ValueFormatterParams) => value?.name ?? '',
                    keyCreator: ({ value }: KeyCreatorParams) => value?.name ?? '',
                },
            ],
            // `{}` formats to nothing, so it shares the blank key rather than listing separately.
            rowData: [{ who: { name: 'Ada' } }, { who: {} }, { who: null }, { who: '' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'who');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Ada']);
    });

    // The blanks label is a formatted value, so it reaches a custom cellRenderer like any other label.
    test('a custom filterParams.cellRenderer is given the blanks label on every untyped column', async () => {
        const seen: unknown[] = [];
        class LabelRenderer {
            private eGui!: HTMLElement;
            public init(params: ISetFilterCellRendererParams): void {
                seen.push(params.value);
                this.eGui = document.createElement('span');
                this.eGui.textContent = params.valueFormatted || '<empty>';
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const cellRenderer = { cellRenderer: LabelRenderer } as ISetFilterParams;

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', filter: 'agSetColumnFilter', refData: { it: 'Italy' }, filterParams: cellRenderer },
                { field: 'name', filter: 'agSetColumnFilter', filterParams: cellRenderer },
                { field: 'age', cellDataType: 'number', filter: 'agSetColumnFilter', filterParams: cellRenderer },
            ],
            rowData: [
                { country: 'it', name: 'Ada', age: 42 },
                { country: null, name: null, age: null },
            ],
        });

        expect((await ColumnFilterHarness.open(api, 'country')).setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            'Italy',
        ]);
        expect((await ColumnFilterHarness.open(api, 'name')).setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            'Ada',
        ]);
        expect((await ColumnFilterHarness.open(api, 'age')).setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            '42',
        ]);
        // The key stays null, so a renderer that wants to treat a blank differently still can.
        expect(seen).toContain(null);
    });

    // Returning nothing declines to name the blank, so the grid names it for the renderer as it does for the label.
    test('a filterParams.valueFormatter answering nothing leaves the blank named for a cellRenderer too', async () => {
        class LabelRenderer {
            private eGui!: HTMLElement;
            public init(params: ISetFilterCellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = params.valueFormatted || '<empty>';
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        // The reference-data value-handler docs example: a lookup that misses answers `undefined`.
        const valueFormatter = ({ value }: ValueFormatterParams) => ({ cb: 'Cadet Blue' })[value as string];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: { valueFormatter, cellRenderer: LabelRenderer } as ISetFilterParams,
                },
                { field: 'other', filter: 'agSetColumnFilter', filterParams: { valueFormatter } as ISetFilterParams },
            ],
            rowData: [
                { colour: 'cb', other: 'cb' },
                { colour: null, other: null },
            ],
        });

        expect((await ColumnFilterHarness.open(api, 'colour')).setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            'Cadet Blue',
        ]);
        // The built-in label has always named it; the cellRenderer now agrees.
        expect((await ColumnFilterHarness.open(api, 'other')).setFilterItemLabels()).toEqual([
            '(Select All)',
            '(Blanks)',
            'Cadet Blue',
        ]);
    });

    test('a supplied filterParams.valueFormatter still owns the blank label, cellRenderer or not', async () => {
        class LabelRenderer {
            private eGui!: HTMLElement;
            public init(params: ISetFilterCellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = params.valueFormatted || '<empty>';
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const valueFormatter = ({ value }: ValueFormatterParams) => (value == null ? 'nothing here' : String(value));

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agSetColumnFilter', filterParams: { valueFormatter } as ISetFilterParams },
                {
                    field: 'other',
                    filter: 'agSetColumnFilter',
                    filterParams: { valueFormatter, cellRenderer: LabelRenderer } as ISetFilterParams,
                },
            ],
            rowData: [
                { name: 'Ada', other: 'Ada' },
                { name: null, other: null },
            ],
        });

        expect((await ColumnFilterHarness.open(api, 'name')).setFilterItemLabels()).toEqual([
            '(Select All)',
            'nothing here',
            'Ada',
        ]);
        expect((await ColumnFilterHarness.open(api, 'other')).setFilterItemLabels()).toEqual([
            '(Select All)',
            'nothing here',
            'Ada',
        ]);
    });

    // The filter summary resolves the label independently of the Filter List.
    test('the floating filter summary names a blank (Blanks) when refData cannot map it', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', filter: 'agSetColumnFilter', floatingFilter: true, refData: { it: 'Italy' } },
            ],
            rowData: [{ country: 'it' }, { country: null }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: [null] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new FilterDom(api, 'refData blank summary', {
            colId: 'country',
            mode: 'floating-filter',
        }).checkFilterDom(`
            FLOATING FILTER country
            input: "(1) (Blanks)" ⊘
            active: true
            model:
              filterType: "set"
              values:
                - null
        `);
    });

    test('keyCreator: list shows the formatted label while the model keeps the underlying key', async () => {
        const keyCreator = (params: KeyCreatorParams): string => params.value.code;
        const valueFormatter = (params: ValueFormatterParams): string => params.value?.name ?? '';
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    keyCreator,
                    valueFormatter,
                    filterParams: { keyCreator, valueFormatter } as ISetFilterParams,
                },
            ],
            rowData: [
                { country: { code: 'IT', name: 'Italy' } },
                { country: { code: 'AU', name: 'Australia' } },
                { country: { code: 'FR', name: 'France' } },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);

        // Toggle by displayed label 'Italy' → model must carry the underlying key 'IT'.
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['IT'] });
        await new FilterDom(api, 'keyCreator label vs key', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "IT"
              filterType: "set"
        `);
        // Filter on key 'IT' keeps only the row whose keyCreator produced that key.
        await new GridRows(api, 'keyCreator label vs key rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('apply button defers the applied model until Apply is clicked', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { buttons: ['apply', 'clear'] } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.toggleSetItem('France');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);

        // UI shows the pending selection, but the applied model is still null (nothing applied yet).
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'apply-button pending', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☐ Italy
            buttons: Apply | Clear
            model: null
        `);
        await new GridRows(api, 'apply-button pending rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);

        await filter.apply();
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia'] });
        await new GridRows(api, 'apply-button applied rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Australia"
        `);
    });

    test('setColumnFilterModel round-trips including a null (Blanks) value', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: 'Australia' }, { country: 'France' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: [null, 'Italy'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Round-trip: the model read back matches what was set (order preserved).
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: [null, 'Italy'] });
        await new GridRows(api, 'model round-trip rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            └── LEAF id:1 country:null
        `);

        // The open panel reflects the programmatic model: only (Blanks) + Italy checked.
        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'model round-trip panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              filterType: "set"
              values:
                - null
                - "Italy"
        `);
    });

    test('a saved model naming a blank by whitespace selects the (Blanks) entry', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: '' }, { country: '   ' }],
        });

        // A model written before whitespace folded onto the blank key still has to select it.
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['   '] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'whitespace model selects blanks').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:null
            ├── LEAF id:2 country:""
            └── LEAF id:3 country:"   "
        `);
        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'whitespace model panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Italy
            model:
              filterType: "set"
              values:
                - null
        `);
    });

    test('numeric values are sorted lexically by their string keys (no comparator supplied)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agSetColumnFilter' }],
            rowData: [{ age: 10 }, { age: 2 }, { age: 1 }, { age: 21 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        // Default comparator compares the underlying numeric keys with </> ⇒ numeric ordering.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '1', '2', '10', '21']);

        await filter.toggleSetItem('10');
        await filter.toggleSetItem('21');
        await asyncSetTimeout(0);
        // Keys are stored as strings (so the model carries strings) even though the list sorts numerically.
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['1', '2'] });
        await new FilterDom(api, 'numeric sort', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ 1
            ☑ 2
            ☐ 10
            ☐ 21
            model:
              values:
                - "1"
                - "2"
              filterType: "set"
        `);
        await new GridRows(api, 'numeric lexical sort rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:2
            └── LEAF id:2 age:1
        `);
    });

    test('(Select All) while a mini-filter is active toggles only the visible items, preserving hidden selections', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Belgium' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('Au');
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);

        // Deselect (Select All) with the search active ⇒ only the visible Au* items are cleared;
        // Belgium and Italy (hidden) stay selected, so they carry into the applied model.
        await filter.toggleSetItem('(Select All)');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Belgium', 'Italy'] });
        await new FilterDom(api, 'select-all with active search', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Au"
            ☐ (Select All)
            ☐ Australia
            ☐ Austria
            model:
              values:
                - "Belgium"
                - "Italy"
              filterType: "set"
        `);

        // Clearing the search reveals the retained hidden selections; (Select All) is now partial.
        await filter.miniFilterSearch('');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'select-all search cleared', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ Austria
            ☑ Belgium
            ☑ Italy
            model:
              values:
                - "Belgium"
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'select-all with active search rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 country:"Belgium"
            └── LEAF id:3 country:"Italy"
        `);
    });

    test('setColumnFilterModel with empty values excludes every row; null restores all', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: [] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: [] });
        expect(api.getDisplayedRowCount()).toBe(0);
        await new GridRows(api, 'empty values rows').check('empty');

        await api.setColumnFilterModel('country', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'null restores rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('provided values array: selecting a value absent from the data yields no rows and round-trips', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['Australia', 'France', 'Germany', 'Italy'] } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }],
        });

        // 'Germany' is a provided value with no matching row.
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Germany'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Germany'] });
        expect(api.getDisplayedRowCount()).toBe(0);
        await new GridRows(api, 'provided value absent rows').check('empty');

        const filter = await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'provided value absent panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Germany
            ☐ Italy
            model:
              filterType: "set"
              values:
                - "Germany"
        `);
        // Switch to a value that does exist in the data.
        await filter.toggleSetItem('Germany');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new GridRows(api, 'provided value present rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('suppressMiniFilter hides the mini-filter search box', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { suppressMiniFilter: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        // suppressMiniFilter hides the box via `ag-hidden` rather than removing it from the DOM.
        const miniFilter = document.querySelector('.ag-mini-filter');
        expect(miniFilter).not.toBeNull();
        expect(miniFilter!.classList.contains('ag-hidden')).toBe(true);
        await new FilterDom(api, 'suppressMiniFilter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
    });

    test('(Select All) stays indeterminate when every mounted row of a virtualised list is checked', async () => {
        // 30 values: the list mounts only what fits its viewport, so the rendered rows can all be checked
        // while the selection as a whole is partial and (Select All) is correctly indeterminate.
        const countries = Array.from({ length: 30 }, (_, i) => `C${String(i).padStart(2, '0')}`);
        const api: GridApi = await gridsManager.createGridAndWait('grid-virtualised-set', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: countries.map((country) => ({ country })),
        });

        await ColumnFilterHarness.open(api, 'country');
        // Deselect one value far below the fold, leaving every mounted row checked.
        await api.setColumnFilterModel('country', { filterType: 'set', values: countries.slice(0, -1) });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        const list = document.querySelector('.ag-set-filter-list')!;
        const items = list.querySelectorAll('.ag-set-filter-item');
        expect(Number(list.querySelector('[aria-setsize]')!.getAttribute('aria-setsize'))).toBeGreaterThan(
            items.length
        );

        const selectAll = items[0];
        expect(selectAll.textContent).toContain('(Select All)');
        expect(selectAll.querySelector<HTMLInputElement>('input[type="checkbox"]')!.indeterminate).toBe(true);
        // The item's aria state sits on the virtual-list row wrapping it, not on the item itself.
        expect(selectAll.closest('[role="option"]')!.getAttribute('aria-checked')).toBe('mixed');
        // ▪ is (Select All) indeterminate while every mounted value below it is checked.
        await new FilterDom(api, 'virtualised set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ C00
            ☑ C01
            ☑ C02
            ☑ C03
            ☑ C04
            ☑ C05
            ☑ C06
            ☑ C07
            ☑ C08
            ☑ C09
            ☑ C10
            ☑ C11
            ☑ C12
            ☑ C13
            ☑ C14
            ☑ C15
            model:
              filterType: "set"
              values:
                - "C00"
                - "C01"
                - "C02"
                - "C03"
                - "C04"
                - "C05"
                - "C06"
                - "C07"
                - "C08"
                - "C09"
                - "C10"
                - "C11"
                - "C12"
                - "C13"
                - "C14"
                - "C15"
                - "C16"
                - "C17"
                - "C18"
                - "C19"
                - "C20"
                - "C21"
                - "C22"
                - "C23"
                - "C24"
                - "C25"
                - "C26"
                - "C27"
                - "C28"
        `);
    });
});

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
        await ColumnFilterHarness.open(api, 'country');

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryByCode]);
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'country');
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

    test('a new comparator and excelMode, which the keys do not depend on, keep the filter', async () => {
        const countryCol = (comparator?: (a: string, b: string) => number) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: { comparator, excelMode: comparator ? 'windows' : undefined } as ISetFilterParams,
        });
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, countryCol()],
            rowData: COUNTRY_ROWS,
        });
        await filterCountries(api, ['France', 'Ireland', 'Spain']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol((a, b) => b.localeCompare(a))]);
        await asyncSetTimeout(0);

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

    test('a model set while a values callback is pending is not replaced by one set before it', async () => {
        let respond = () => {};
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'item' },
                {
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => {
                            respond = () => params.success(['Red', 'Blue', 'Green']);
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

        respond();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('colour')).toEqual({ filterType: 'set', values: ['Blue'] });
        expect(displayed(api, 'item')).toEqual(['Sky', 'Sea']);
    });

    test('a values callback answering after a newer one does not replace its values', async () => {
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
        const handler = api.getColumnFilterHandler<SetFilterHandler>('colour')!;
        await asyncSetTimeout(0);
        pending[0](['Red']);

        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [{ field: 'item' }, colourCol()]);
        await asyncSetTimeout(0);
        expect(pending.length).toBe(3);
        pending[2](['Blue']);
        pending[1](['Green']);
        await asyncSetTimeout(0);

        expect(handler.getFilterKeys()).toEqual(['Blue']);
    });

    test('a values callback overtaken by a values list ends its loading, whether or not it ever answers', async () => {
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
    });
});

describe('Set Filter — filterParams given as a function on a column with a cell data type', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule, MultiFilterModule, NumberFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [{ value: 10 }, { value: 9 }];

    test("its params apply over the data type's own, whose comparator still sorts the list, on a Set Filter or a Multi Filter's child", async () => {
        const setParams = () => ({ values: [10, 9, 100] });
        const colDefs: ColDef[] = [
            { field: 'value', filter: 'agSetColumnFilter', filterParams: setParams },
            {
                field: 'value',
                filter: 'agMultiColumnFilter',
                filterParams: () => ({ filters: [{ filter: 'agSetColumnFilter', filterParams: setParams }] }),
            },
        ];
        const lists: string[][] = [];
        for (const colDef of colDefs) {
            const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: [colDef], rowData });
            await asyncSetTimeout(0);
            const filter = await ColumnFilterHarness.open(api, 'value');
            lists.push(filter.setFilterItemLabels());
            gridsManager.reset();
        }

        expect(lists).toEqual([
            ['(Select All)', '9', '10', '100'],
            ['(Select All)', '9', '10', '100'],
        ]);
    });
});
