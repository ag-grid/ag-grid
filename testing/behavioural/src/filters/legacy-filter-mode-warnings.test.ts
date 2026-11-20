import { _doOnce } from 'ag-stack';
import { LEGACY_FILTER_WARNING_IDS, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';
import type { MockInstance } from 'vitest';

import type {
    ColDef,
    GridApi,
    GridOptions,
    IMultiFilter,
    IServerSideGetRowsParams,
    IssueRaisedEvent,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    _resetValidationLogging,
    enableDevValidations,
} from 'ag-grid-community';
import { MultiFilterModule, RowGroupingModule, ServerSideRowModelModule, SetFilterModule } from 'ag-grid-enterprise';

const legacyInit = vi.fn();

class LegacyFilter {
    private readonly gui = document.createElement('div');
    public init(): void {
        legacyInit();
    }
    public getGui(): HTMLElement {
        return this.gui;
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

class LegacyFloatingFilter {
    private readonly gui = document.createElement('div');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.gui;
    }
    public onParentModelChanged(): void {}
}

const rowData = [
    { id: 1, name: 'Alpha', country: 'Spain' },
    { id: 2, name: 'Bravo', country: 'Italy' },
];

describe('legacy filter mode warnings', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ServerSideRowModelModule,
            ValidationModule,
            CustomFilterModule,
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            MultiFilterModule,
            RowGroupingModule,
        ],
    });

    let consoleWarnSpy: MockInstance;
    let raised: IssueRaisedEvent[];

    const onIssueRaised = (event: IssueRaisedEvent) => {
        if (event.attributedToThisGrid) {
            raised.push(event);
        }
    };
    const count = (id: number) => raised.filter((event) => event.id === id).length;
    const legacyIdsRaised = () =>
        raised.map((event) => event.id).filter((id) => LEGACY_FILTER_WARNING_IDS.includes(id));

    const createGrid = (options: GridOptions, id = 'grid') =>
        gridsManager.createGrid(id, { rowData, onIssueRaised, ...options });

    beforeEach(() => {
        gridsManager.reset();
        _resetValidationLogging();
        _doOnce._set.clear();
        enableDevValidations({ throwOn: [], showOverlayOn: [] });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        legacyInit.mockClear();
        raised = [];
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    describe('custom filters (343)', () => {
        test('a class filter is reported when the columns are set, before it is opened', () => {
            createGrid({ columnDefs: [{ field: 'name', filter: LegacyFilter }] });

            expect(count(343)).toBe(1);
            expect(legacyInit).not.toHaveBeenCalled();
        });

        test('a class filter added by a column definition update is reported', () => {
            const api = createGrid({ columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }] });
            expect(count(343)).toBe(0);

            api.setGridOption('columnDefs', [{ field: 'name', filter: LegacyFilter }]);

            expect(count(343)).toBe(1);
        });

        test('the `{ component }` form without logic is reported', () => {
            createGrid({ columnDefs: [{ field: 'name', filter: { component: LegacyFilter } }] });

            expect(count(343)).toBe(1);
        });

        test('a filter registered by name is reported', () => {
            createGrid({
                components: { legacyFilter: LegacyFilter },
                columnDefs: [{ field: 'name', filter: 'legacyFilter' }],
            });

            expect(count(343)).toBe(1);
        });

        test('an object-form Multi Filter child is reported when the columns are set', () => {
            createGrid({
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: { filters: [{ filter: LegacyFilter }] },
                    },
                ],
            });

            expect(count(343)).toBe(1);
        });

        test('an auto group column filter is reported when the columns are set', () => {
            createGrid({
                columnDefs: [{ field: 'country', rowGroup: true }, { field: 'name' }],
                autoGroupColumnDef: { field: 'name', filter: LegacyFilter },
            });

            expect(count(343)).toBe(1);
        });

        const multiWithFunctionParams: ColDef = {
            field: 'name',
            filter: 'agMultiColumnFilter',
            filterParams: () => ({ filters: [{ filter: LegacyFilter }] }),
        };

        test('a Multi Filter child from function-valued params is reported when the filter is created', async () => {
            const api = createGrid({ columnDefs: [multiWithFunctionParams] });
            expect(count(343)).toBe(0);

            await api.getColumnFilterInstance('name');

            expect(count(343)).toBe(1);
        });

        test('a Multi Filter child from function-valued params is reported on the server-side row model', async () => {
            const api = createGrid({
                rowData: undefined,
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) =>
                        params.success({ rowData: rowData.slice(), rowCount: rowData.length }),
                },
                columnDefs: [multiWithFunctionParams],
            });
            await waitForNoLoadingRows(api);
            expect(count(343)).toBe(0);

            await api.getColumnFilterInstance('name');

            expect(count(343)).toBe(1);
        });

        test('each grid reports once, however many of its columns use legacy filters', () => {
            const options: GridOptions = {
                columnDefs: [
                    { field: 'name', filter: LegacyFilter },
                    { field: 'country', filter: LegacyFilter },
                ],
            };
            createGrid(options, 'grid1');
            createGrid(options, 'grid2');

            expect(count(343)).toBe(2);
        });

        test('the warning recommends migrating before setting `enableFilterHandlers: false`', () => {
            createGrid({ columnDefs: [{ field: 'name', filter: LegacyFilter }] });

            const { message } = raised.find((event) => event.id === 343)!;
            const linkIndex = message.indexOf('/component-filter/#migrating-to-filter-handlers');
            expect(linkIndex).toBeGreaterThan(-1);
            expect(linkIndex).toBeLessThan(message.indexOf('enableFilterHandlers: false'));
        });
    });

    describe('custom floating filters (344)', () => {
        test('a custom floating filter is reported', () => {
            createGrid({
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        floatingFilterComponent: LegacyFloatingFilter,
                    },
                ],
            });

            expect(count(344)).toBe(1);
        });

        test('a custom floating filter of a Multi Filter child is reported', () => {
            createGrid({
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        floatingFilter: true,
                        filterParams: {
                            filters: [{ filter: 'agTextColumnFilter', floatingFilterComponent: LegacyFloatingFilter }],
                        },
                    },
                ],
            });

            expect(count(344)).toBe(1);
        });
    });

    describe('filterModified (345)', () => {
        test('an `onFilterModified` option is reported', () => {
            createGrid({ columnDefs: [{ field: 'name' }], onFilterModified: () => {} });

            expect(count(345)).toBe(1);
        });

        test('an `onFilterModified` option set after creation is reported', () => {
            const api = createGrid({ columnDefs: [{ field: 'name' }] });
            expect(count(345)).toBe(0);

            api.setGridOption('onFilterModified', () => {});

            expect(count(345)).toBe(1);
        });

        test('a `filterModified` listener is reported', () => {
            const api = createGrid({ columnDefs: [{ field: 'name' }] });
            expect(count(345)).toBe(0);

            api.addEventListener('filterModified', () => {});

            expect(count(345)).toBe(1);
        });
    });

    describe('Multi Filter (346, 347)', () => {
        test.each<[string, ColDef['filterParams']]>([
            ['parent `buttons`', { buttons: ['apply'] }],
            ['parent `closeOnApply`', { closeOnApply: true }],
            ['child `buttons`', { filters: [{ filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } }] }],
            [
                'child `closeOnApply`',
                { filters: [{ filter: 'agTextColumnFilter', filterParams: { closeOnApply: true } }] },
            ],
        ])('%s is reported', async (_name, filterParams) => {
            const api = createGrid({ columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter', filterParams }] });

            await api.getColumnFilterInstance('name');

            expect(count(346)).toBe(1);
        });

        test('the grid using a default Multi Filter reports nothing; an application method call is reported', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter', floatingFilter: true }],
            });
            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'equals', filter: 'Alpha' }],
            });
            api.onFilterChanged();
            api.getFilterModel();
            api.showColumnFilter('name');
            await asyncSetTimeout(0);
            api.setFilterModel(null);
            await asyncSetTimeout(0);
            expect(legacyIdsRaised()).toEqual([]);

            const filter = await api.getColumnFilterInstance<IMultiFilter>('name');
            filter!.getModel();

            expect(count(347)).toBe(1);
        });
    });

    describe('enableFilterHandlers set', () => {
        const legacyUsage: GridOptions = {
            columnDefs: [
                {
                    field: 'name',
                    filter: LegacyFilter,
                    floatingFilter: true,
                    floatingFilterComponent: LegacyFloatingFilter,
                },
            ],
            onFilterModified: () => {},
        };

        test('`false` reports a deprecation and no warnings', () => {
            createGrid({ ...legacyUsage, enableFilterHandlers: false });

            expect(legacyIdsRaised()).toEqual([348]);
            expect(raised.find((event) => event.id === 348)!.severity).toBe('deprecation');
        });

        test('`true` reports nothing', () => {
            const api = createGrid({ ...legacyUsage, enableFilterHandlers: true });
            api.addEventListener('filterModified', () => {});

            expect(legacyIdsRaised()).toEqual([]);
        });
    });

    test('grid-provided filters report nothing', async () => {
        const api: GridApi = createGrid({
            columnDefs: [
                { field: 'id', filter: 'agNumberColumnFilter', floatingFilter: true },
                { field: 'name', filter: true, floatingFilter: true },
                { field: 'country', filter: 'agSetColumnFilter', floatingFilter: true },
                { colId: 'multi', field: 'name', filter: 'agMultiColumnFilter', floatingFilter: true },
                {
                    colId: 'logic',
                    field: 'country',
                    filter: { component: LegacyFilter, doesFilterPass: () => true },
                },
                { colId: 'unregistered', field: 'country', filter: 'notRegistered' },
            ],
        });
        for (const colId of ['id', 'name', 'country', 'multi', 'logic', 'unregistered']) {
            await api.getColumnFilterInstance(colId);
        }

        expect(legacyIdsRaised()).toEqual([]);
        expect(consoleWarnSpy.mock.calls.flat().join(' ')).not.toMatch(/warning #34[3-8]/);
    });
});
