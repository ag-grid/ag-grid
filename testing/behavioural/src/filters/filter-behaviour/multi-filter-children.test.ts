import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, ColumnFilterHarness, GridRows, asyncSetTimeout } from 'ag-test-utils';

import type {
    ColDef,
    DoesFilterPassParams,
    GridApi,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IMultiFilter,
} from 'ag-grid-community';
import { CustomFilterModule, enableDevValidations, getGridElement } from 'ag-grid-community';

import {
    ROWS,
    createFloatingGrid,
    setupMultiFilterSuite,
    visibleFloatingInput,
    visibleFloatingKind,
} from './multiFilterHarness';
import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

/** Multi Filter children: custom `filters[]`, floating filters, display styles, child value getters and components. */
describe('Multi Filter — sub-filter combos & combined model (coverage)', () => {
    const gridsManager = setupMultiFilterSuite();

    test('custom filters[]: two text filters combine with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                        ],
                    },
                },
            ],
            rowData: [{ name: 'alice' }, { name: 'albert' }, { name: 'annie' }, { name: 'bob' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        // Two selects / two bodies — one per sub-filter (each maxNumConditions:1).
        await filter.selectOperator('Begins with', 0);
        await filter.setText('a', 0);
        await asyncSetTimeout(0);
        await filter.selectOperator('Ends with', 1);
        await filter.setText('e', 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'text', type: 'startsWith', filter: 'a' },
                { filterType: 'text', type: 'endsWith', filter: 'e' },
            ],
        });
        // startsWith 'a' AND endsWith 'e' ⇒ alice, annie.
        await new GridRows(api, 'two text filters rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"alice"
            └── LEAF id:2 name:"annie"
        `);
    });

    test('custom filters[]: number + set filters combine with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');

        // Sub-filter 0 (number): greater than 28 ⇒ 30, 40, 35.
        await filter.selectOperator('Greater than', 0);
        await filter.setNumber(28, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [{ filterType: 'number', type: 'greaterThan', filter: 28 }, null],
        });
        await new GridRows(api, 'number sub-filter only rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:30
            ├── LEAF id:2 age:40
            └── LEAF id:3 age:35
        `);

        // Sub-filter 1 (set): the list still shows every age key; dropping 40 leaves [25,30,35].
        await filter.toggleSetItem('40');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'number', type: 'greaterThan', filter: 28 },
                { filterType: 'set', values: ['25', '30', '35'] },
            ],
        });
        // AND: age>28 AND set-in-[25,30,35] ⇒ michael(30) + alice(35).
        await new GridRows(api, 'number AND set rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:30
            └── LEAF id:3 age:35
        `);
    });

    test('floating filter reflects the active sub-filter', async () => {
        const api: GridApi = await createFloatingGrid(gridsManager);

        // Nothing active ⇒ the first (text) sub-floating-filter is shown.
        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('');

        // Activate only the set sub-filter ⇒ the read-only set sub-floating-filter takes over.
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['michael'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(visibleFloatingKind()).toBe('set');
        expect(visibleFloatingInput().value).toBe('(1) michael');
        await new GridRows(api, 'floating set-active rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);

        // Switch to only the text sub-filter active ⇒ the text sub-floating-filter returns.
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('bob');
        await new GridRows(api, 'floating text-active rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);
    });

    test("a child using the default filter, a text filter, gets the text floating filter, not the column's default", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    floatingFilter: true,
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: true }, { filter: 'agSetColumnFilter' }] },
                },
            ],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('bob');
    });

    test('readOnly sub-filter renders a disabled floating filter that still reflects the model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    floatingFilter: true,
                    filterParams: {
                        filters: [
                            {
                                filter: 'agTextColumnFilter',
                                filterParams: { debounceMs: 0, maxNumConditions: 1, readOnly: true },
                            },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const input = visibleFloatingInput();
        expect(visibleFloatingKind()).toBe('text');
        // readOnly ⇒ the floating input is disabled (cannot type), but the model still drives it.
        expect(input.disabled).toBe(true);

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(visibleFloatingInput().value).toBe('mich');
        expect(visibleFloatingInput().disabled).toBe(true);
        await new GridRows(api, 'readOnly floating rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"michael"
            └── LEAF id:1 name:"michelle"
        `);
    });

    describe.each([false, true])('display styles, with enableFilterHandlers %s', (enableFilterHandlers) => {
        const displayStyleCols: ColDef[] = [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        { filter: 'agTextColumnFilter', display: 'subMenu', filterParams: { debounceMs: 0 } },
                        { filter: 'agSetColumnFilter', display: 'accordion', title: 'Pick names' },
                    ],
                },
            },
        ];
        const multiFilterIn = (api: GridApi, container: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`${container} .ag-multi-filter`)!;

        test('a sub-menu child shows as a menu item titled by its filter, whose sub-menu holds a filter that filters the rows', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
            });
            await ColumnFilterHarness.open(api, 'name');
            const multiFilter = multiFilterIn(api, '.ag-filter-menu');
            const menuItem = multiFilter.querySelector<HTMLElement>('.ag-multi-filter-menu-item')!;
            expect({
                title: menuItem.textContent!.trim(),
                inlineTextInputs: multiFilter.querySelectorAll('.ag-filter-body input[type="text"]').length,
            }).toEqual({ title: 'Text Filter', inlineTextInputs: 0 });

            menuItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            const input = await waitFor(() => {
                const subMenu = getGridElement(api)!.querySelector('.ag-menu.ag-popup-child:not(.ag-filter-menu)')!;
                return subMenu.querySelector<HTMLInputElement>('.ag-filter-body input[type="text"]')!;
            });
            input.value = 'mich';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            await waitFor(() =>
                expect(api.getFilterModel()).toEqual({
                    name: {
                        filterType: 'multi',
                        filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
                    },
                })
            );
            await new GridRows(api, 'text child filtering from its sub-menu').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);
        });

        test('a sub-menu child is a button that opens a dialog named after its filter', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
            });
            await ColumnFilterHarness.open(api, 'name');
            const multiFilter = multiFilterIn(api, '.ag-filter-menu');
            const menuItem = multiFilter.querySelector<HTMLElement>('.ag-multi-filter-menu-item')!;
            const itemAria = () => ({
                role: menuItem.getAttribute('role'),
                hasPopup: menuItem.getAttribute('aria-haspopup'),
                expanded: menuItem.getAttribute('aria-expanded'),
            });
            expect({
                ...itemAria(),
                menuItems: multiFilter.querySelectorAll('[role="menuitem"]').length,
            }).toEqual({ role: 'button', hasPopup: 'dialog', expanded: 'false', menuItems: 0 });

            menuItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            const subMenu = await waitFor(() => {
                const popup = getGridElement(api)!.querySelector('.ag-menu.ag-popup-child:not(.ag-filter-menu)');
                expect(popup).not.toBeNull();
                return popup!;
            });
            expect({
                ...itemAria(),
                popupRole: subMenu.getAttribute('role'),
                popupName: subMenu.getAttribute('aria-label'),
            }).toEqual({
                role: 'button',
                hasPopup: 'dialog',
                expanded: 'true',
                popupRole: 'dialog',
                popupName: 'Text Filter',
            });
        });

        test('an accordion child shows collapsed under its title until expanded', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
            });
            await ColumnFilterHarness.open(api, 'name');
            const group = multiFilterIn(api, '.ag-filter-menu').querySelector<HTMLElement>('.ag-multi-filter-group')!;
            const container = group.querySelector('.ag-multi-filter-group-container')!;
            const isExpanded = () => !container.classList.contains('ag-hidden');
            expect({
                title: group.querySelector('.ag-multi-filter-group-title')!.textContent,
                expanded: isExpanded(),
                role: container.getAttribute('role'),
                name: document.getElementById(container.getAttribute('aria-labelledby')!)?.textContent,
            }).toEqual({ title: 'Pick names', expanded: false, role: 'group', name: 'Pick names' });

            group.querySelector<HTMLElement>('.ag-multi-filter-group-title-bar')!.click();
            expect(isExpanded()).toBe(true);
            expect(
                Array.from(group.querySelectorAll('.ag-set-filter-item .ag-checkbox-label')).map((e) => e.textContent)
            ).toEqual(['(Select All)', 'alice', 'bob', 'michael', 'michelle']);
        });

        test.each(['', '   '])(
            'an accordion child with a blank title (%j) has an unnamed, role-less container',
            async (title) => {
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    enableFilterHandlers,
                    columnDefs: [
                        {
                            field: 'name',
                            filter: 'agMultiColumnFilter',
                            filterParams: { filters: [{ filter: 'agSetColumnFilter', display: 'accordion', title }] },
                        },
                    ],
                    rowData: ROWS,
                });
                await ColumnFilterHarness.open(api, 'name');
                const container = multiFilterIn(api, '.ag-filter-menu').querySelector(
                    '.ag-multi-filter-group-container'
                )!;
                expect({
                    role: container.getAttribute('role'),
                    labelledBy: container.getAttribute('aria-labelledby'),
                }).toEqual({ role: null, labelledBy: null });
            }
        );

        test('in the filters tool panel, a sub-menu child shows as an accordion', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Name');
            const multiFilter = multiFilterIn(api, '.ag-filter-toolpanel');
            expect({
                menuItems: multiFilter.querySelectorAll('.ag-multi-filter-menu-item').length,
                groups: Array.from(multiFilter.querySelectorAll('.ag-multi-filter-group-title')).map(
                    (e) => e.textContent
                ),
            }).toEqual({ menuItems: 0, groups: ['Text Filter', 'Pick names'] });
        });

        test('a custom sub-menu child keeps its own role and label in the popup and in the filters tool panel', async () => {
            class OwnAriaFilter implements IFilterComp {
                private readonly eGui = document.createElement('div');
                public init(): void {
                    this.eGui.className = 'own-aria-filter';
                    this.eGui.setAttribute('role', 'group');
                    this.eGui.setAttribute('aria-label', 'Own names');
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
            const api: GridApi = await gridsManager.createGridAndWait(
                'grid1',
                {
                    enableFilterHandlers,
                    columnDefs: [
                        {
                            field: 'name',
                            filter: 'agMultiColumnFilter',
                            filterParams: {
                                filters: [
                                    {
                                        filter: enableFilterHandlers
                                            ? { component: OwnAriaFilter, doesFilterPass: () => true }
                                            : OwnAriaFilter,
                                        display: 'subMenu',
                                        title: 'Own',
                                    },
                                ],
                            },
                        },
                    ],
                    rowData: ROWS,
                    sideBar: FILTERS_SIDEBAR,
                },
                { modules: [CustomFilterModule] }
            );
            const ownAria = (el: Element) => ({ role: el.getAttribute('role'), label: el.getAttribute('aria-label') });
            await ColumnFilterHarness.open(api, 'name');
            multiFilterIn(api, '.ag-filter-menu')
                .querySelector<HTMLElement>('.ag-multi-filter-menu-item')!
                .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            const inPopup = await waitFor(() => {
                const el = getGridElement(api)!.querySelector('.ag-popup-child .own-aria-filter');
                expect(el).not.toBeNull();
                return el!;
            });
            expect(ownAria(inPopup)).toEqual({ role: 'group', label: 'Own names' });
            api.hidePopupMenu();

            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Name');
            expect(ownAria(multiFilterIn(api, '.ag-filter-toolpanel').querySelector('.own-aria-filter')!)).toEqual({
                role: 'group',
                label: 'Own names',
            });
        });
    });

    // The documented custom-child form (filter-multi/custom-filter): a fresh wrapper object each time the
    // colDefs are rebuilt, around a stable component and doesFilterPass.
    test('an object-form child rebuilt inline is not treated as a different child', async () => {
        const doesFilterPass = () => true;
        const objectFormChild = () => ({ filter: { component: 'agTextColumnFilter', doesFilterPass } });
        const colDefs = () => [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: { filters: [objectFormChild(), { filter: 'agSetColumnFilter' }] },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: colDefs(),
            rowData: ROWS,
        });

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['bob'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'object-form child, set model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);

        api.setGridOption('columnDefs', colDefs());
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toEqual({
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['bob'] }],
        });
        await new GridRows(api, 'object-form child survives a colDef rebuild').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);
    });

    test("a child with an empty filter value getter reads through the Multi Filter's, with and without filter handlers or an object data type", async () => {
        for (const enableFilterHandlers of [true, false]) {
            for (const cellDataType of ['text', 'object']) {
                const api: GridApi = await gridsManager.createGridAndWait(
                    `grid-${enableFilterHandlers}-${cellDataType}`,
                    {
                        enableFilterHandlers,
                        columnDefs: [
                            {
                                field: 'name',
                                cellDataType,
                                valueFormatter: ({ value }) => value,
                                filterValueGetter: ({ data }) => `${data.name}!`,
                                filter: 'agMultiColumnFilter',
                                filterParams: {
                                    filters: [
                                        { filter: 'agTextColumnFilter', filterValueGetter: '' },
                                        { filter: 'agSetColumnFilter', filterValueGetter: '' },
                                    ],
                                },
                            },
                        ],
                        rowData: ROWS,
                    }
                );
                const filterBy = async (filterModels: (object | null)[]) => {
                    await api.setColumnFilterModel('name', { filterType: 'multi', filterModels });
                    api.onFilterChanged();
                    await asyncSetTimeout(0);
                    await new GridRows(api, `empty child getter, handlers ${enableFilterHandlers}, ${cellDataType}`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            └── LEAF id:2 name:"bob"
                        `);
                };
                await filterBy([{ filterType: 'text', type: 'equals', filter: 'bob!' }, null]);
                await filterBy([null, { filterType: 'set', values: ['bob!'] }]);
            }
        }
    });

    test("a child with its own filter value getter reads another column as that column's value", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            {
                                filter: {
                                    component: 'agTextColumnFilter',
                                    doesFilterPass: ({ node, handlerParams }: DoesFilterPassParams) =>
                                        handlerParams.getValue(node, 'team') === 'red',
                                },
                                filterValueGetter: () => 'the child reads this',
                            },
                        ],
                    },
                },
                { field: 'team' },
            ],
            rowData: [
                { name: 'bob', team: 'red' },
                { name: 'alice', team: 'blue' },
            ],
        });

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'any' }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'child reads the other column').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"bob" team:"red"
        `);
    });

    test('a set child refusing new params stops the Multi Filter refreshing the children after it', async () => {
        const refreshSources: string[] = [];
        const recordingHandler = () => ({
            doesFilterPass: () => true,
            refresh: ({ source }: { source: string }) => {
                refreshSources.push(source);
            },
        });
        const cols = (caseSensitive: boolean) => [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        { filter: 'agSetColumnFilter', filterParams: { caseSensitive } },
                        { filter: { component: 'agTextColumnFilter', handler: recordingHandler } },
                    ],
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: cols(false),
            rowData: ROWS,
        });
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'set', values: ['bob'] }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // the recorder does see a column definition the set child accepts
        api.setGridOption('columnDefs', cols(false));
        await asyncSetTimeout(0);
        expect(refreshSources).toContain('colDef');
        refreshSources.length = 0;

        api.setGridOption('columnDefs', cols(true));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toBeNull();
        expect(refreshSources).not.toContain('colDef');
    });

    test("a values callback, a Multi Filter child's or a Set Filter's own, is not called again when unchanged column definitions are set back, with or without filter handlers", async () => {
        for (const enableFilterHandlers of [false, true]) {
            const calls = { multi: 0, set: 0 };
            const values = (colId: keyof typeof calls) => (params: { success: (values: string[]) => void }) => {
                calls[colId]++;
                params.success(['bob', 'alice']);
            };
            const api: GridApi = await gridsManager.createGridAndWait(`grid-${enableFilterHandlers}`, {
                enableFilterHandlers,
                columnDefs: [
                    {
                        colId: 'multi',
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter' },
                                { filter: 'agSetColumnFilter', filterParams: { values: values('multi') } },
                            ],
                        },
                    },
                    {
                        colId: 'set',
                        field: 'name',
                        filter: 'agSetColumnFilter',
                        filterParams: { values: values('set') },
                    },
                ],
                rowData: ROWS,
            });
            for (const colId of ['multi', 'set']) {
                await ColumnFilterHarness.open(api, colId);
                api.hidePopupMenu();
            }
            const loaded = { ...calls };
            expect({ enableFilterHandlers, loaded }).toEqual({ enableFilterHandlers, loaded: { multi: 1, set: 1 } });

            for (let i = 0; i < 2; ++i) {
                api.setGridOption('columnDefs', api.getColumnDefs()!);
                await asyncSetTimeout(0);
            }

            expect({ enableFilterHandlers, calls }).toEqual({ enableFilterHandlers, calls: loaded });
        }
    });

    test("a child filter component with its own filter value getter reads another column as that column's value", async () => {
        let childParams: IFilterParams | undefined;
        class ProbeFilter implements IFilterComp {
            public init(params: IFilterParams): void {
                childParams = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
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
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: ProbeFilter, filterValueGetter: () => 'the child reads this' }],
                    },
                },
                { field: 'team' },
            ],
            rowData: [{ name: 'bob', team: 'red' }],
        });
        await api.getColumnFilterInstance('name');
        const node = api.getRowNode('0')!;

        expect([childParams!.getValue(node), childParams!.getValue(node, 'team')]).toEqual([
            'the child reads this',
            'red',
        ]);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, a child filter component without isFilterActive filters nothing, is reported, and never throws',
        async (enableFilterHandlers) => {
            // with filter handlers, a custom child also reports the column's missing handler (#277)
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: enableFilterHandlers ? [67, 277] : [67] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            class NoActiveStateFilter implements Omit<IFilterComp, 'isFilterActive'> {
                private model: string | null = null;
                public init(): void {}
                public getGui(): HTMLElement {
                    return document.createElement('div');
                }
                public doesFilterPass(): boolean {
                    return false;
                }
                public getModel(): string | null {
                    return this.model;
                }
                public setModel(model: string | null): void {
                    this.model = model;
                }
            }
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: NoActiveStateFilter }] },
                    },
                ],
                rowData: ROWS,
            });
            const errors: string[] = [];
            let filtered: { active: boolean | undefined; displayed: number } | undefined;
            try {
                await api.setColumnFilterModel('name', { filterType: 'multi', filterModels: [null, 'x'] });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                filtered = { active: api.getColumn('name')?.isFilterActive(), displayed: api.getDisplayedRowCount() };
                api.destroyFilter('name');
                await asyncSetTimeout(0);
            } catch (e) {
                errors.push(String(e));
            }

            // With handlers, the child has no handler (#277): its model is kept and filters nothing.
            const warning = enableFilterHandlers ? 'warning #277' : 'warning #67';
            expect({
                errors,
                warned: warnSpy.mock.calls.flat().join(' ').includes(warning),
                filtered,
            }).toEqual({
                errors: [],
                warned: true,
                filtered: { active: enableFilterHandlers, displayed: ROWS.length },
            });
        }
    );

    test('without filter handlers, an active child filter component filters the rows and reports its model', async () => {
        class NameFilter implements IFilterComp {
            private model: string | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams): boolean {
                return params.data.name === this.model;
            }
            public getModel(): string | null {
                return this.model;
            }
            public setModel(model: string | null): void {
                this.model = model;
            }
            public getModelAsString(model: string | null): string {
                return `named ${model}`;
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: NameFilter }] },
                },
            ],
            rowData: ROWS,
        });
        const model = { filterType: 'multi', filterModels: [null, ROWS[1].name] };

        await api.setColumnFilterModel('name', model);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const multiFilter = await api.getColumnFilterInstance<IMultiFilter>('name');
        expect({
            model: api.getColumnFilterModel('name'),
            displayed: api.getDisplayedRowCount(),
            summary: multiFilter?.getModelAsString?.(model),
        }).toEqual({ model, displayed: 1, summary: `named ${ROWS[1].name}` });
    });
});
