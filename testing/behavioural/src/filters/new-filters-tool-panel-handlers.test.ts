import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    GridRows,
    TestGridsManager,
    getSelectOptionLabels,
    installFilterLayoutMock,
    openPicker,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { IFilterComp, IFilterParams } from 'ag-grid-community';
import { enableDevValidations, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel requires enableFilterHandlers', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { id: '1', name: 'Alice', age: 30 },
        { id: '2', name: 'Bob', age: 25 },
    ];
    const columnDefs = [{ field: 'id' }, { field: 'name' }, { field: 'age' }];

    afterEach(() => {
        gridsManager.reset();
        vi.resetAllMocks();
    });

    test('warns #282 and renders an empty panel when enableFilterHandlers is not set', async () => {
        // This test deliberately omits enableFilterHandlers for the new filters tool panel, which warns #282.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [282] });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar: 'filters-new',
        });
        // The warning is emitted while the tool panel is created, so poll for it directly.
        await waitFor(() => {
            expect(consoleWarnSpy.mock.calls.some((call) => String(call[0]).includes('warning #282'))).toBe(true);
            // createGrid is not awaited, so also gate on the rows having been processed.
            expect(api.getDisplayedRowCount()).toBe(2);
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        // grid rendered despite the missing flag
        const gridElement = getGridElement(api);
        expect(gridElement).toBeTruthy();
        expect(api.getToolPanelInstance('filters-new')).toBeTruthy();
        // the tool panel wrapper is rendered in the DOM rather than crashing
        expect(gridElement!.querySelector('.ag-tool-panel-wrapper')).toBeTruthy();

        // No filter applied: both data rows still render despite the missing-flag warning.
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'empty panel: all rows still rendered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30
            └── LEAF id:1 id:"2" name:"Bob" age:25
        `);
    });

    test('does not warn #282 when enableFilterHandlers is set', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar: 'filters-new',
            enableFilterHandlers: true,
        });
        // The absence of the warning cannot be polled for, so gate on the tool panel having been
        // created and rendered — the point at which #282 would have been emitted.
        await waitFor(() => {
            expect(api.getToolPanelInstance('filters-new')).toBeTruthy();
            expect(getGridElement(api)!.querySelector('.ag-tool-panel-wrapper')).toBeTruthy();
            // createGrid is not awaited, so also gate on the rows having been processed.
            expect(api.getDisplayedRowCount()).toBe(2);
        });

        expect(consoleWarnSpy.mock.calls.some((call) => String(call[0]).includes('warning #282'))).toBe(false);

        // No filter applied: both data rows render with the handlers-enabled panel.
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'handlers enabled: all rows rendered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30
            └── LEAF id:1 id:"2" name:"Bob" age:25
        `);
    });
});

describe('new filters tool panel filter types', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('a choice is named by the filter it builds: the one `component` names, or the default for a name nothing is registered under', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [101] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agSelectableColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: { component: 'agSetColumnFilter', doesFilterPass: () => true } },
                            { filter: 'set' },
                        ],
                    },
                },
            ],
            rowData: [{ name: 'Alice' }],
            sideBar: 'filters-new',
            enableFilterHandlers: true,
            suppressSetFilterByDefault: true,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'name', expanded: true }] } },
                },
            },
        });
        const select = () => getGridElement(api)!.querySelector<HTMLElement>('.ag-filter-type-select');
        await waitFor(() => expect(select()).not.toBeNull());
        await openPicker(select()!);
        expect(getSelectOptionLabels()).toEqual(['Selection Filter', 'Simple Filter']);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #101');
        warnSpy.mockRestore();
    });

    test("a selectable column names its data type's simple filter, a bigint one included", async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'age', cellDataType: 'number' },
                { field: 'serial', cellDataType: 'bigint' },
            ],
            defaultColDef: { filter: 'agSelectableColumnFilter' },
            rowData: [
                { age: 30, serial: 9007199254740992n },
                { age: 31, serial: 9007199254740993n },
            ],
            sideBar: 'filters-new',
            enableFilterHandlers: true,
            suppressSetFilterByDefault: true,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: {
                        'filters-new': {
                            filters: [
                                { colId: 'age', expanded: true },
                                { colId: 'serial', expanded: true },
                            ],
                        },
                    },
                },
            },
        });
        const filterTypes = () =>
            Array.from(
                getGridElement(api)!.querySelectorAll('.ag-filter-type-select .ag-picker-field-display'),
                (el) => el.textContent
            );
        await waitFor(() => expect(filterTypes()).toHaveLength(2));
        expect(filterTypes()).toEqual(['Simple Filter', 'Simple Filter']);

        // the labels are alike, so the filter shows itself by comparing past what a number can hold
        await api.setColumnFilterModel('serial', {
            filterType: 'bigint',
            type: 'greaterThan',
            filter: '9007199254740992',
        });
        api.onFilterChanged();
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a choice naming a component of its own without a `name` is warned about once read, with no panel open', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [280] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        class Unnamed implements IFilterComp {
            private readonly eGui = document.createElement('div');
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public isFilterActive(): boolean {
                return false;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel(): null {
                return null;
            }
            public setModel(): void {}
        }
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agSelectableColumnFilter',
                    filterParams: { filters: [{ filter: { component: Unnamed, doesFilterPass: () => true } }] },
                },
            ],
            rowData: [{ name: 'Alice' }],
            enableFilterHandlers: true,
        });
        api.getColumnFilterHandler('name');
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #280');
        warnSpy.mockRestore();
    });

    test('a choice naming a component of its own takes none of its data type params', async () => {
        const seen: unknown[] = [];
        class OwnFilter implements IFilterComp {
            private readonly eGui = document.createElement('div');
            public init(params: IFilterParams): void {
                seen.push(Reflect.get(params, 'isValidDate'));
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public isFilterActive(): boolean {
                return false;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel(): null {
                return null;
            }
            public setModel(): void {}
        }
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'when',
                    cellDataType: 'date',
                    filter: 'agSelectableColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: { component: OwnFilter, doesFilterPass: () => true }, name: 'Own' },
                            { filter: 'agDateColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: [{ when: new Date(2024, 0, 1) }],
            enableFilterHandlers: true,
        });
        await api.getColumnFilterInstance('when');

        expect(seen).toEqual([undefined]);
    });

    test('an index naming no filter selects the first, from `defaultFilterIndex` or a saved state, below the list as past its end', async () => {
        const filters = [{ filter: 'agTextColumnFilter' }, { filter: 'agNumberColumnFilter' }];
        for (const badIndex of [5, -1, 0.5]) {
            const named = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: { filters, defaultFilterIndex: badIndex },
                    },
                ],
                rowData: [{ name: 'Alice' }, { name: 'Bob' }],
                enableFilterHandlers: true,
            });
            await named.setColumnFilterModel('name', { filterType: 'text', type: 'contains', filter: 'li' });
            named.onFilterChanged();
            expect(named.getDisplayedRowCount()).toBe(1);
            named.destroy();

            // a saved index naming no filter selects the first, not the definition's default
            const saved = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: { filters, defaultFilterIndex: 1 },
                    },
                ],
                rowData: [{ name: 'Alice' }, { name: 'Bob' }],
                enableFilterHandlers: true,
                initialState: { filter: { selectableFilters: { name: badIndex } } },
            });
            expect(saved.getState().filter?.selectableFilters).toEqual({ name: 0 });
            saved.destroy();
        }
    });

    test("a Set Filter choice lists its values with the column's custom data type formatter", async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'day',
                    cellDataType: 'ukDate',
                    filter: 'agSelectableColumnFilter',
                    filterParams: { filters: [{ filter: 'agSetColumnFilter', filterParams: { treeList: false } }] },
                },
            ],
            dataTypeDefinitions: {
                ukDate: {
                    baseDataType: 'date',
                    extendsDataType: 'date',
                    valueFormatter: ({ value }) => (value ? `UK ${value.getUTCDate()}/${value.getUTCMonth() + 1}` : ''),
                },
            },
            rowData: [{ day: new Date(Date.UTC(2024, 0, 2)) }, { day: new Date(Date.UTC(2024, 2, 4)) }],
            enableFilterHandlers: true,
        });
        const filter = await ColumnFilterHarness.open(api, 'day');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'UK 2/1', 'UK 4/3']);
    });

    test('a choice restored through `setState` rebuilds a column filter already built from another', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agSelectableColumnFilter',
                    filterParams: {
                        filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agNumberColumnFilter' }],
                    },
                },
            ],
            defaultColDef: { floatingFilter: true },
            rowData: [{ age: 30 }, { age: 25 }, { age: 3 }],
            enableFilterHandlers: true,
        });
        const floatingInputType = () =>
            getGridElement(api)!.querySelector<HTMLInputElement>('.ag-floating-filter-body input')?.type;
        await api.setColumnFilterModel('age', { filterType: 'text', type: 'contains', filter: '3' });
        api.onFilterChanged();
        expect(api.getDisplayedRowCount()).toBe(2);
        await waitFor(() => expect(floatingInputType()).toBe('text'));

        api.setState({
            filter: {
                selectableFilters: { age: 1 },
                filterModel: { age: { filterType: 'number', type: 'lessThan', filter: 10 } },
            },
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'lessThan', filter: 10 });
        await waitFor(() => expect(floatingInputType()).toBe('number'));
        await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 26 });
        api.onFilterChanged();
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('restoring the choice already active through `setState` keeps the floating filter built from it', async () => {
        const selectable = {
            filter: 'agSelectableColumnFilter',
            filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agNumberColumnFilter' }] },
        };
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'age', ...selectable },
                { field: 'score', ...selectable },
            ],
            defaultColDef: { floatingFilter: true },
            rowData: [{ age: 30, score: 1 }],
            enableFilterHandlers: true,
        });
        const floatingInput = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLInputElement>(
                `.ag-floating-filter[col-id="${colId}"] .ag-floating-filter-body input`
            );
        await waitFor(() => expect(floatingInput('age')?.type).toBe('text'));
        const built = floatingInput('age');

        // the first filter is already active on `age`; `score` switching in the same restore is the control,
        // as both rebuild through the same pass
        api.setState({ filter: { selectableFilters: { age: 0, score: 1 } } });
        await waitFor(() => expect(floatingInput('score')?.type).toBe('number'));
        expect(floatingInput('age')).toBe(built);

        api.setState({ filter: { selectableFilters: { age: 1, score: 1 } } });
        await waitFor(() => expect(floatingInput('age')?.type).toBe('number'));
    });
});
