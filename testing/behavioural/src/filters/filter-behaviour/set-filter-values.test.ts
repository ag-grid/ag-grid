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
    GridApi,
    GridOptions,
    ISetFilterCellRendererParams,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

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

    test('replacing dataTypeDefinitions keeps a data type key creator recognised as the grid’s', async () => {
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
