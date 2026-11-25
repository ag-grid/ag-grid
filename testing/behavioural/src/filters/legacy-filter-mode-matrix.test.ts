import { waitFor } from '@testing-library/dom';
import { _doOnce } from 'ag-stack';
import {
    ColumnFilterHarness,
    FloatingFilterHarness,
    LEGACY_FILTER_WARNING_IDS,
    TestGridsManager,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';
import type { MockInstance } from 'vitest';
import { expect } from 'vitest';

import type { ColDef, GridApi, GridOptions, IssueRaisedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    ExternalFilterModule,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    _resetValidationLogging,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { MultiFilterModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

const rowData = [
    { id: 1, name: 'Alpha', country: 'Spain', date: '2024-01-01' },
    { id: 2, name: 'Alphabet', country: 'Italy', date: '2024-02-01' },
    { id: 3, name: 'Bravo', country: 'Spain', date: '2024-03-01' },
    { id: 4, name: 'Charlie', country: 'France', date: '2024-04-01' },
];

const containsRow = (model: string | null, value: unknown) =>
    model == null || String(value).toLowerCase().includes(model.toLowerCase());

/** Pre-handlers custom filter: logic and state live in the component. */
class LegacyContains {
    private readonly gui = document.createElement('div');
    private model: string | null = null;
    private params: any;
    public init(params: any): void {
        this.params = params;
    }
    public getGui(): HTMLElement {
        return this.gui;
    }
    public isFilterActive(): boolean {
        return this.model != null;
    }
    public doesFilterPass(p: any): boolean {
        return containsRow(this.model, this.params.getValue(p.node));
    }
    public getModel(): string | null {
        return this.model;
    }
    public setModel(model: string | null): void {
        this.model = model;
    }
}

/** Handlers-era custom filter: display only; the model lives in the grid. */
class DisplayContains {
    private readonly gui = document.createElement('div');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.gui;
    }
    public refresh(): boolean {
        return true;
    }
}

/** One component carrying both the legacy methods and the display methods. */
class HybridContains extends LegacyContains {
    public refresh(): boolean {
        return true;
    }
}

class LegacyFloating {
    private readonly gui = document.createElement('div');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.gui;
    }
    public onParentModelChanged(): void {}
}

class DisplayFloating {
    private readonly gui = document.createElement('div');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.gui;
    }
    public refresh(): void {}
}

class HybridFloating extends LegacyFloating {
    public refresh(): void {}
}

const containsPass = ({ model, node, handlerParams }: any) => containsRow(model, handlerParams.getValue(node));
const containsHandler = () => ({ doesFilterPass: containsPass });

const text = (filter: string) => ({ filterType: 'text', type: 'contains', filter });
const multiModel = (filter: string) => ({ filterType: 'multi', filterModels: [text(filter), null] });

interface Entry {
    name: string;
    options: GridOptions;
    /** The model applied through `api.setColumnFilterModel` to `colId`. */
    model?: unknown;
    colId?: string;
    /** Replaces the default probe. Returns extra observable state. */
    act?: (api: GridApi) => Promise<unknown>;
    /** Warnings expected with `enableFilterHandlers` unset. */
    warn: number[];
    /** The grid's existing warning that explains why unset and `true` differ, instead of a legacy one. */
    existingWarn?: number;
}

const col = (def: ColDef): ColDef => ({ field: 'name', ...def });

const customFilterEntries: Entry[] = [
    { name: 'legacy class', options: { columnDefs: [col({ filter: LegacyContains })] }, model: 'alp', warn: [343] },
    {
        name: 'legacy class by registered name',
        options: { components: { legacyContains: LegacyContains }, columnDefs: [col({ filter: 'legacyContains' })] },
        model: 'alp',
        warn: [343],
    },
    {
        name: '{ component } with no logic',
        options: { columnDefs: [col({ filter: { component: LegacyContains } })] },
        model: 'alp',
        warn: [343],
    },
    {
        name: '{ component: legacy, doesFilterPass }',
        options: { columnDefs: [col({ filter: { component: LegacyContains, doesFilterPass: containsPass } })] },
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: '{ component: display, doesFilterPass }',
        options: { columnDefs: [col({ filter: { component: DisplayContains, doesFilterPass: containsPass } })] },
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: '{ component: display, handler }',
        options: { columnDefs: [col({ filter: { component: DisplayContains, handler: containsHandler } })] },
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: '{ component: hybrid, doesFilterPass }',
        options: { columnDefs: [col({ filter: { component: HybridContains, doesFilterPass: containsPass } })] },
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: '{ component: registered name, doesFilterPass }',
        options: {
            components: { displayContains: DisplayContains },
            columnDefs: [col({ filter: { component: 'displayContains', doesFilterPass: containsPass } })],
        },
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: 'legacy class in defaultColDef',
        options: { defaultColDef: { filter: LegacyContains }, columnDefs: [{ field: 'name' }] },
        model: 'alp',
        warn: [343],
    },
    {
        name: 'legacy class in columnTypes',
        options: {
            columnTypes: { custom: { filter: LegacyContains } },
            columnDefs: [{ field: 'name', type: 'custom' }],
        },
        model: 'alp',
        warn: [343],
    },
    {
        name: 'legacy class inside a column group',
        options: { columnDefs: [{ headerName: 'g', children: [col({ filter: LegacyContains })] }] },
        model: 'alp',
        warn: [343],
    },
    {
        name: 'legacy class on a hidden column',
        options: { columnDefs: [col({ filter: LegacyContains, hide: true })] },
        model: 'alp',
        warn: [343],
    },
    {
        name: 'legacy class with filter: false on the column (no filter)',
        options: { defaultColDef: { filter: LegacyContains }, columnDefs: [col({ filter: false })] },
        warn: [],
    },
    {
        name: 'defaultColDef custom filter overridden by a built-in on every column',
        options: { defaultColDef: { filter: LegacyContains }, columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        model: text('alp'),
        warn: [],
    },
];

const builtInEntries: Entry[] = [
    { name: 'filter: true', options: { columnDefs: [col({ filter: true })] }, model: text('alp'), warn: [] },
    {
        name: 'text filter, string name',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'text filter, { component } form',
        options: { columnDefs: [col({ filter: { component: 'agTextColumnFilter' } })] },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'text filter, { handler } form',
        options: { columnDefs: [col({ filter: { component: 'agTextColumnFilter', handler: 'agTextColumnFilter' } })] },
        model: text('alp'),
        warn: [],
        existingWarn: 335,
    },
    {
        name: 'text filter with buttons, debounce and options',
        options: {
            columnDefs: [
                col({
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        buttons: ['apply', 'reset', 'clear', 'cancel'],
                        closeOnApply: true,
                        debounceMs: 0,
                        caseSensitive: true,
                        trimInput: true,
                        maxNumConditions: 3,
                        filterOptions: ['contains', 'startsWith'],
                        defaultOption: 'startsWith',
                        textMatcher: ({ value, filterText }: any) => value.includes(filterText),
                    },
                }),
            ],
        },
        model: text('Alp'),
        warn: [],
    },
    {
        name: 'function-valued filterParams on a text filter',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter', filterParams: () => ({ buttons: ['apply'] }) })] },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'number filter',
        options: { columnDefs: [{ field: 'id', filter: 'agNumberColumnFilter' }] },
        colId: 'id',
        model: { filterType: 'number', type: 'greaterThan', filter: 2 },
        warn: [],
    },
    {
        name: 'date filter with comparator',
        options: {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        comparator: (filterDate: Date, cell: string) => new Date(cell).getTime() - filterDate.getTime(),
                    },
                },
            ],
        },
        colId: 'date',
        model: { filterType: 'date', type: 'greaterThan', dateFrom: '2024-02-15 00:00:00' },
        warn: [],
    },
    {
        name: 'set filter with values array',
        options: {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['Spain', 'Italy', 'France'] },
                },
            ],
        },
        colId: 'country',
        model: { filterType: 'set', values: ['Spain'] },
        warn: [],
    },
    {
        name: 'set filter with values callback, floating filter',
        options: {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    floatingFilter: true,
                    filterParams: { values: (p: any) => p.success(['Spain', 'Italy', 'France']) },
                },
            ],
        },
        colId: 'country',
        model: { filterType: 'set', values: ['Spain'] },
        warn: [],
    },
    {
        name: 'built-in floating filters named explicitly',
        options: {
            columnDefs: [
                col({
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    floatingFilterComponent: 'agTextColumnFloatingFilter',
                }),
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    floatingFilter: true,
                    floatingFilterComponent: 'agSetColumnFloatingFilter',
                },
                {
                    field: 'id',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    floatingFilterComponent: 'agNumberColumnFloatingFilter',
                    floatingFilterComponentParams: { suppressFilterButton: true },
                },
            ],
        },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'a custom name that nothing registers falls back to the default filter',
        options: { columnDefs: [col({ filter: 'notRegistered' as any })] },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'external filter',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter' })],
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => node.data.id > 1,
        },
        model: text('alp'),
        warn: [],
    },
];

const multiEntries: Entry[] = [
    {
        name: 'default Multi Filter',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        model: multiModel('alp'),
        warn: [],
    },
    {
        name: 'Multi Filter with text and set children, floating filter',
        options: {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agMultiColumnFilter',
                    floatingFilter: true,
                    filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }] },
                },
            ],
        },
        colId: 'country',
        model: { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['Spain'] }] },
        warn: [],
    },
    ...(['subMenu', 'accordion', 'inline'] as const).map<Entry>((display) => ({
        name: `Multi Filter display: ${display}`,
        options: {
            columnDefs: [
                col({
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: 'agTextColumnFilter', display }, { filter: 'agSetColumnFilter' }],
                    },
                }),
            ],
        },
        model: multiModel('alp'),
        warn: [],
    })),
    {
        name: 'Multi Filter with a { component, doesFilterPass } child',
        options: {
            columnDefs: [
                col({
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: { component: DisplayContains, doesFilterPass: containsPass } }],
                    },
                }),
            ],
        },
        model: { filterType: 'multi', filterModels: ['alp'] },
        warn: [],
        existingWarn: 335,
    },
    {
        name: 'Multi Filter with a legacy class child',
        options: {
            columnDefs: [
                col({ filter: 'agMultiColumnFilter', filterParams: { filters: [{ filter: LegacyContains }] } }),
            ],
        },
        model: { filterType: 'multi', filterModels: ['alp'] },
        warn: [343],
    },
    {
        name: 'Multi Filter buttons on the parent',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter', filterParams: { buttons: ['apply'] } })] },
        model: multiModel('alp'),
        warn: [346],
    },
    {
        name: 'Multi Filter buttons on a child',
        options: {
            columnDefs: [
                col({
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } }] },
                }),
            ],
        },
        model: multiModel('alp'),
        warn: [346],
    },
    {
        name: 'Multi Filter with empty buttons',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter', filterParams: { buttons: [] } })] },
        model: multiModel('alp'),
        warn: [],
    },
    {
        name: 'defaultColDef buttons reach a Multi Filter',
        options: {
            defaultColDef: { filterParams: { buttons: ['apply'] } },
            columnDefs: [col({ filter: 'agMultiColumnFilter' })],
        },
        model: multiModel('alp'),
        warn: [346],
    },
    {
        name: 'defaultColDef buttons with only text columns',
        options: {
            defaultColDef: { filterParams: { buttons: ['apply'] } },
            columnDefs: [col({ filter: 'agTextColumnFilter' })],
        },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'Multi Filter driven only through the grid API',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter', floatingFilter: true })] },
        act: async (api) => {
            await api.setColumnFilterModel('name', multiModel('alp'));
            api.onFilterChanged();
            api.getFilterModel();
            api.getColumnFilterModel('name');
            api.isColumnFilterPresent();
            api.showColumnFilter('name');
            api.hidePopupMenu();
            api.getState();
            await api.setColumnFilterModel('name', null);
            return api.getDisplayedRowCount();
        },
        warn: [],
    },
    {
        name: 'Multi Filter row data update with a set child',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        act: async (api) => {
            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['Alpha'] }],
            });
            api.applyTransaction({ add: [{ id: 9, name: 'Zulu' }] });
            api.setGridOption('rowData', rowData.slice(0, 3));
            return api.getDisplayedRowCount();
        },
        warn: [],
    },
    {
        name: 'Multi Filter app calls getModel on the instance',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        act: async (api) => {
            const instance: any = await api.getColumnFilterInstance('name');
            return instance.getModel();
        },
        warn: [347],
    },
    {
        name: 'Multi Filter app calls setModel on the instance',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        act: async (api) => {
            const instance: any = await api.getColumnFilterInstance('name');
            await instance.setModel(multiModel('alp'));
            api.onFilterChanged();
            return api.getDisplayedRowCount();
        },
        warn: [347],
    },
    {
        name: 'Multi Filter app reads a child instance only',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        act: async (api) => {
            const instance: any = await api.getColumnFilterInstance('name');
            return typeof instance.getChildFilterInstance(0);
        },
        warn: [],
    },
];

const instanceEntries: Entry[] = [
    {
        name: 'app calls setModel and onFilterChanged on a text filter instance',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        act: async (api) => {
            const instance: any = await api.getColumnFilterInstance('name');
            await instance.setModel(text('alp'));
            api.onFilterChanged();
            return [api.getDisplayedRowCount(), instance.getModel?.()];
        },
        warn: [],
    },
    {
        name: 'app calls getModel on a set filter instance',
        options: {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
        },
        act: async (api) => {
            await api.setColumnFilterModel('country', { filterType: 'set', values: ['Spain'] });
            const instance: any = await api.getColumnFilterInstance('country');
            return [api.getDisplayedRowCount(), instance.getModel?.()];
        },
        warn: [],
    },
    {
        name: 'app calls applyModel and getModelFromUi on a text filter instance',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        act: async (api) => {
            await api.setColumnFilterModel('name', text('alp'));
            const instance: any = await api.getColumnFilterInstance('name');
            return [typeof instance.applyModel, typeof instance.getModelFromUi, instance.getModelFromUi?.()];
        },
        warn: [],
    },
    {
        name: 'app calls a legacy custom filter instance',
        options: { columnDefs: [col({ filter: LegacyContains })] },
        act: async (api) => {
            const instance: any = await api.getColumnFilterInstance('name');
            instance.setModel('alp');
            api.onFilterChanged();
            return [api.getDisplayedRowCount(), instance.getModel()];
        },
        warn: [343],
    },
];

const floatingEntries: Entry[] = [
    {
        name: 'legacy custom floating filter on a built-in filter',
        options: {
            columnDefs: [
                col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: LegacyFloating }),
            ],
        },
        model: text('alp'),
        warn: [344],
    },
    {
        name: 'display custom floating filter on a built-in filter',
        options: {
            columnDefs: [
                col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: DisplayFloating }),
            ],
        },
        model: text('alp'),
        warn: [344],
    },
    {
        name: 'hybrid custom floating filter on a built-in filter',
        options: {
            columnDefs: [
                col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: HybridFloating }),
            ],
        },
        model: text('alp'),
        warn: [344],
    },
    {
        name: 'floating filter component by registered name',
        options: {
            components: { myFloating: LegacyFloating },
            columnDefs: [
                col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: 'myFloating' }),
            ],
        },
        model: text('alp'),
        warn: [344],
    },
    {
        name: 'custom floating filter on a column with floatingFilter off',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter', floatingFilterComponent: LegacyFloating })],
        },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'floatingFilterComponentParams on a built-in floating filter',
        options: {
            columnDefs: [
                col({
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    floatingFilterComponentParams: { suppressFilterButton: true },
                }),
            ],
        },
        model: text('alp'),
        warn: [],
    },
];

const eventEntries: Entry[] = [
    {
        name: 'filterChanged, filterOpened, filterUiChanged, floatingFilterUiChanged listeners',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter', floatingFilter: true })],
            onFilterChanged: () => {},
            onFilterOpened: () => {},
            onFilterUiChanged: () => {},
            onFloatingFilterUiChanged: () => {},
        },
        act: async (api) => {
            api.addEventListener('filterChanged', () => {});
            api.addEventListener('filterOpened', () => {});
            api.addEventListener('filterUiChanged', () => {});
            api.addEventListener('floatingFilterUiChanged', () => {});
            await api.setColumnFilterModel('name', text('alp'));
            return api.getDisplayedRowCount();
        },
        warn: [],
    },
    {
        name: 'global listener',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        act: async (api) => {
            api.addGlobalListener(() => {});
            await api.setColumnFilterModel('name', text('alp'));
            return api.getDisplayedRowCount();
        },
        warn: [],
    },
    {
        name: 'removing a filterModified listener that was never added',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        act: async (api) => {
            api.removeEventListener('filterModified', () => {});
            return api.getDisplayedRowCount();
        },
        warn: [],
    },
    {
        name: 'onFilterModified option',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })], onFilterModified: () => {} },
        model: text('alp'),
        warn: [345],
    },
    {
        name: 'filterModified listener on a built-in filter',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })] },
        act: async (api) => {
            api.addEventListener('filterModified', () => {});
            await api.setColumnFilterModel('name', text('alp'));
            return api.getDisplayedRowCount();
        },
        warn: [345],
    },
    {
        name: 'onFilterModified: undefined',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter' })], onFilterModified: undefined },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'enableFilterHandlers: undefined with a legacy filter',
        options: { columnDefs: [col({ filter: LegacyContains })], enableFilterHandlers: undefined },
        model: 'alp',
        warn: [343],
    },
];

const typeInPopup =
    (buttons: boolean) =>
    async (api: GridApi): Promise<unknown> => {
        const popup = await ColumnFilterHarness.open(api, 'name');
        await popup.setText('alp');
        if (buttons) {
            await popup.apply();
        }
        await waitFor(() => expect(api.getColumnFilterModel('name')).not.toBeNull());
        return [api.getDisplayedRowCount(), api.getColumnFilterModel('name')];
    };

const typeInFloating = async (api: GridApi): Promise<unknown> => {
    await FloatingFilterHarness.get(api, 'name').setValue('alp');
    await waitFor(() => expect(api.getColumnFilterModel('name')).not.toBeNull());
    return [api.getDisplayedRowCount(), api.getColumnFilterModel('name')];
};

const uiEntries: Entry[] = [
    {
        name: 'typing in a text filter popup',
        options: { columnDefs: [col({ filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } })] },
        act: typeInPopup(false),
        warn: [],
    },
    {
        name: 'typing in a text filter popup, then apply button',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter', filterParams: { buttons: ['apply', 'reset'] } })],
        },
        act: typeInPopup(true),
        warn: [],
    },
    {
        name: 'typing in a text filter floating filter',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter', floatingFilter: true, filterParams: { debounceMs: 0 } })],
        },
        act: typeInFloating,
        warn: [],
    },
    {
        name: 'typing in a Multi Filter popup',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter' })] },
        act: typeInPopup(false),
        warn: [],
    },
    {
        name: 'typing in a Multi Filter floating filter',
        options: { columnDefs: [col({ filter: 'agMultiColumnFilter', floatingFilter: true })] },
        act: typeInFloating,
        warn: [],
    },
    {
        name: 'typing in a text filter popup with a filterModified listener',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } })],
            onFilterModified: () => {},
        },
        act: typeInPopup(false),
        warn: [345],
    },
];

const miscEntries: Entry[] = [
    {
        name: '{ component: registered legacy name } with no logic',
        options: {
            components: { legacyContains: LegacyContains },
            columnDefs: [col({ filter: { component: 'legacyContains' } })],
        },
        model: 'alp',
        warn: [343],
    },
    {
        name: 'custom text filterOptions with a predicate',
        options: {
            columnDefs: [
                col({
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        filterOptions: [
                            'contains',
                            {
                                displayKey: 'startsA',
                                displayName: 'Starts A',
                                predicate: (_filter: string[], cell: string) => cell.startsWith('A'),
                                numberOfInputs: 0,
                            },
                        ],
                    },
                }),
            ],
        },
        model: { filterType: 'text', type: 'startsA' },
        warn: [],
    },
    {
        name: 'set filter with keyCreator, valueFormatter and comparator',
        options: {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        keyCreator: (p: any) => p.value,
                        valueFormatter: (p: any) => String(p.value).toUpperCase(),
                        comparator: (a: string, b: string) => a.localeCompare(b),
                    },
                },
            ],
        },
        colId: 'country',
        model: { filterType: 'set', values: ['Spain'] },
        warn: [],
    },
    {
        name: 'row grouping with an auto group column filter',
        options: {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, col({ filter: 'agTextColumnFilter' })],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
        },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'filter menu tab and header filter button options',
        options: {
            columnDefs: [
                col({ filter: 'agTextColumnFilter', menuTabs: ['filterMenuTab'], suppressHeaderFilterButton: true }),
            ],
        },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'initialState filter model',
        options: {
            columnDefs: [col({ filter: 'agTextColumnFilter' })],
            initialState: { filter: { filterModel: { name: text('alp') } } },
        },
        act: async (api) => [api.getDisplayedRowCount(), api.getFilterModel()],
        warn: [],
    },
];

const ALL = [
    ...customFilterEntries,
    ...builtInEntries,
    ...multiEntries,
    ...instanceEntries,
    ...floatingEntries,
    ...eventEntries,
    ...uiEntries,
    ...miscEntries,
];

describe('legacy filter mode matrix', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ValidationModule,
            CustomFilterModule,
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            ExternalFilterModule,
            SetFilterModule,
            MultiFilterModule,
            RowGroupingModule,
        ],
    });

    let consoleWarnSpy: MockInstance;
    let raised: IssueRaisedEvent[];
    const report: string[] = [];

    const onIssueRaised = (event: IssueRaisedEvent) => {
        if (event.attributedToThisGrid) {
            raised.push(event);
        }
    };
    const legacyIds = () =>
        [...new Set(raised.map((e) => e.id))].filter((id) => LEGACY_FILTER_WARNING_IDS.includes(id)).sort();
    const otherWarnings = () =>
        raised
            .filter((e) => !LEGACY_FILTER_WARNING_IDS.includes(e.id))
            .map((e) => `#${e.id} ${e.message.slice(0, 90)}`);
    const otherIds = () => raised.map((e) => e.id).filter((id) => !LEGACY_FILTER_WARNING_IDS.includes(id));

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });

    afterAll(() => uninstallFilterLayoutMock());

    beforeEach(() => {
        gridsManager.reset();
        _resetValidationLogging();
        _doOnce._set.clear();
        enableDevValidations({ throwOn: [], showOverlayOn: [] });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        raised = [];
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    afterAll(() => {
        console.log(`\nMATRIX REPORT\n${report.join('\n')}`);
    });

    const run = async (entry: Entry, enableFilterHandlers: boolean | undefined) => {
        raised = [];
        const api = await gridsManager.createGridAndWait(`grid-${String(enableFilterHandlers)}`, {
            rowData,
            onIssueRaised,
            ...entry.options,
            ...(enableFilterHandlers === undefined ? {} : { enableFilterHandlers }),
        });
        let outcome: unknown;
        try {
            if (entry.act) {
                outcome = await entry.act(api);
            } else {
                const colId = entry.colId ?? 'name';
                await api.setColumnFilterModel(colId, entry.model);
                outcome = [api.getDisplayedRowCount(), api.getColumnFilterModel(colId)];
            }
        } catch (e) {
            outcome = `THROWS ${(e as Error).message.slice(0, 120)}`;
        }
        const result = {
            ids: legacyIds(),
            other: otherWarnings(),
            otherIds: otherIds(),
            outcome: JSON.stringify(outcome),
        };
        gridsManager.reset();
        return result;
    };

    test.each(ALL.map((entry) => [entry.name, entry] as const))('%s', async (_name, entry) => {
        const unset = await run(entry, undefined);
        const handlers = await run(entry, true);
        const legacy = await run(entry, false);

        report.push(
            [
                `${entry.name}`,
                `  unset   warn=${JSON.stringify(unset.ids)} outcome=${unset.outcome}`,
                `  true    warn=${JSON.stringify(handlers.ids)} outcome=${handlers.outcome}`,
                `  false   warn=${JSON.stringify(legacy.ids)} outcome=${legacy.outcome}`,
                unset.other.length ? `  OTHER unset: ${unset.other.join(' | ')}` : '',
                handlers.other.length ? `  OTHER true: ${handlers.other.join(' | ')}` : '',
            ]
                .filter(Boolean)
                .join('\n')
        );

        expect(unset.ids, 'warnings with enableFilterHandlers unset').toEqual(entry.warn);
        expect(handlers.ids, 'warnings with enableFilterHandlers: true').toEqual([]);
        expect(legacy.ids, 'warnings with enableFilterHandlers: false').toEqual([348]);
        if (entry.existingWarn) {
            expect(unset.otherIds, 'the grid already warns why this fails without filter handlers').toContain(
                entry.existingWarn
            );
        } else if (entry.warn.length === 0) {
            expect(unset.outcome, 'the probe must run, not throw').not.toMatch(/THROWS/);
            expect(unset.outcome, 'unwarned, so the same with enableFilterHandlers unset and true').toBe(
                handlers.outcome
            );
        }
        expect(consoleWarnSpy).toBeDefined();
    });
});
