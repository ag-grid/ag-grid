import { userEvent } from '@testing-library/user-event';
import {
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    getVisibleTooltips,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
    waitForTooltips,
} from 'ag-test-utils';

import type {
    ColDef,
    GridApi,
    ICellRendererComp,
    ISetFilterCellRendererParams,
    ISetFilterParams,
    SetFilterHandler,
} from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, TooltipModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    value: string | null;
}

describe('Set Filter preservePreviousValues - filter list', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule, GridStateModule, TooltipModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    let nextId = 0;
    const rows = (...values: (string | null)[]): Row[] => values.map((value) => ({ id: String(nextId++), value }));

    function createGrid(
        rowData: Row[],
        filterParams: ISetFilterParams = {},
        colDef: Partial<ColDef<Row>> = {},
        gridId = 'grid'
    ): GridApi<Row> {
        return gridsManager.createGrid<Row>(gridId, {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, ...filterParams },
                    ...colDef,
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
    }

    const modelOf = (api: GridApi<Row>) => api.getColumnFilterModel<{ values: (string | null)[] }>('value');
    const shown = (api: GridApi<Row>) => {
        const values: (string | null)[] = [];
        api.forEachNodeAfterFilter((node) => values.push(node.data!.value));
        return values;
    };
    const setModel = async (api: GridApi<Row>, values: (string | null)[] | null) => {
        // Not awaited: the promise waits out cellDataType inference, which an empty grid never finishes.
        void api.setColumnFilterModel('value', values && { filterType: 'set', values });
        api.onFilterChanged();
        await asyncSetTimeout(0);
    };
    const setRowData = async (api: GridApi<Row>, rowData: Row[]) => {
        api.setGridOption('rowData', rowData);
        await asyncSetTimeout(0);
    };
    const popup = () => document.querySelector<HTMLElement>('.ag-filter-menu')!;
    const missingItems = () =>
        Array.from(popup().querySelectorAll<HTMLElement>('.ag-set-filter-item-missing')).map((item) =>
            item.querySelector('.ag-checkbox-label')?.textContent?.trim()
        );

    test('retained values are listed after the current ones, muted, and announced', async () => {
        const api = createGrid(rows('A', 'B', 'C', 'D'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B']);
        await setRowData(api, rows('C', 'D'));

        const filter = await ColumnFilterHarness.open(api, 'value');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'C', 'D', 'A', 'B']);
        expect(missingItems()).toEqual(['A', 'B']);

        const labels = Array.from(popup().querySelectorAll<HTMLElement>('.ag-filter-virtual-list-item')).map((el) =>
            el.getAttribute('aria-label')
        );
        expect(labels).toEqual([null, null, null, 'A, not in current data', 'B, not in current data']);

        await setRowData(api, rows('A', 'C', 'D'));
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'A', 'C', 'D', 'B']);
        expect(missingItems()).toEqual(['B']);
    });

    test('a retained value whose formatter answers nothing is announced by its value', async () => {
        const api = createGrid(rows('A', 'B'), { valueFormatter: ({ value }) => (value === 'B' ? null : value) });
        await asyncSetTimeout(0);
        await setModel(api, ['B']);
        await setRowData(api, rows('A'));

        await ColumnFilterHarness.open(api, 'value');
        const labels = Array.from(popup().querySelectorAll<HTMLElement>('.ag-filter-virtual-list-item')).map((el) =>
            el.getAttribute('aria-label')
        );
        expect(labels).toEqual([null, null, 'B, not in current data']);
    });

    test('the default tooltip of a retained value says it is not in the current data', async () => {
        const api = gridsManager.createGrid<Row>('grid', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, showTooltips: true },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: rows('A', 'B'),
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        await asyncSetTimeout(0);
        await setModel(api, ['B']);
        await setRowData(api, rows('A'));

        await ColumnFilterHarness.open(api, 'value');
        const item = Array.from(popup().querySelectorAll<HTMLElement>('.ag-set-filter-item')).find(
            (el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() === 'B'
        )!;
        await userEvent.hover(item);
        await waitForTooltips(1);
        expect(getVisibleTooltips()[0].textContent).toBe('B, not in current data');
    });

    test('a value leaving keeps the tooltip its cell renderer set, and suffixes the default one', async () => {
        class TooltipRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ISetFilterCellRendererParams): void {
                this.eGui.textContent = params.valueFormatted ?? '';
                if (params.value === 'B') {
                    params.setTooltip('custom B');
                }
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
        }
        const api = gridsManager.createGrid<Row>('grid', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, showTooltips: true, cellRenderer: TooltipRenderer },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: rows('A', 'B', 'C'),
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        await asyncSetTimeout(0);
        await setModel(api, ['B', 'C']);
        await ColumnFilterHarness.open(api, 'value');
        await setRowData(api, rows('A'));
        expect(missingItems()).toEqual(['B', 'C']);

        const tooltipOf = async (label: string) => {
            const item = Array.from(popup().querySelectorAll<HTMLElement>('.ag-set-filter-item')).find(
                (el) => el.textContent?.trim() === label
            )!;
            await userEvent.hover(item);
            await waitForTooltips(1);
            const text = getVisibleTooltips()[0].textContent;
            await userEvent.unhover(item);
            await waitForTooltips(0);
            return text;
        };
        expect(await tooltipOf('B')).toBe('custom B');
        expect(await tooltipOf('C')).toBe('C, not in current data');
    });

    test('model values never seen in the data are listed, searched and summarised by their key', async () => {
        const valueFormatter = vi.fn(({ value }) => `<${value}>`);
        const api = createGrid(rows('A', 'B'), { valueFormatter }, { floatingFilter: true });
        await asyncSetTimeout(0);
        await setModel(api, ['B', 'X']);
        await setRowData(api, rows('A'));
        expect(document.querySelector<HTMLInputElement>('.ag-floating-filter input')!.value).toBe('(2) <B>,X');

        const filter = await ColumnFilterHarness.open(api, 'value', 'floatingFilter');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '<A>', '<B>', 'X']);
        expect(missingItems()).toEqual(['<B>', 'X']);
        const formatted = valueFormatter.mock.calls.map(([params]) => params.value);
        expect(formatted).toContain('B');
        expect(formatted).not.toContain('X');

        await filter.miniFilterSearch('x');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'X']);
        await filter.miniFilterSearch('');

        await setRowData(api, rows('A', 'X'));
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '<A>', '<X>', '<B>']);
        expect(missingItems()).toEqual(['<B>']);
    });

    test('a model value never seen in the data is labelled by its key, not rendered, until its value arrives', async () => {
        interface Code {
            code: string;
            name: string;
        }
        const rendered: unknown[] = [];
        const cellRenderer = (params: { value: unknown }) => {
            rendered.push(params.value);
            return typeof params.value === 'string' ? params.value : `#${(params.value as Code).name}`;
        };
        const codeRow = (code: string, name: string) => ({ id: String(nextId++), value: { code, name } });
        const api = gridsManager.createGrid('grid', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    keyCreator: (params) => params.value.code,
                    valueFormatter: (params) => params.value?.name ?? '',
                    filterParams: { preservePreviousValues: true, cellRenderer },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [codeRow('A', 'Alpha')],
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('value', { filterType: 'set', values: ['X'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'value');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '#Alpha', 'X']);
        expect(rendered).not.toContain('X');

        api.setGridOption('rowData', [codeRow('A', 'Alpha'), codeRow('X', 'Ex')]);
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '#Alpha', '#Ex']);
    });

    test('in Excel Mode a blank known only from the model is still listed last', async () => {
        const api = createGrid(rows('A', 'B'), { excelMode: 'windows' });
        await asyncSetTimeout(0);
        await setModel(api, ['B', 'Z', null]);

        const filter = await ColumnFilterHarness.open(api, 'value');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'A', 'B', 'Z', '(Blanks)']);
    });

    test('unchecking with no model keeps every retained value selected', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setRowData(api, rows('A', 'B'));

        const filter = await ColumnFilterHarness.open(api, 'value');
        await filter.toggleSetItem('A');
        await filter.apply();
        expect(modelOf(api)?.values).toEqual(['B', 'C']);

        await setRowData(api, rows('A', 'B', 'C'));
        expect(shown(api)).toEqual(['B', 'C']);
    });

    test('retained values take part in the mini filter and Select All', async () => {
        const api = createGrid(rows('Apple', 'Avocado', 'Pear'));
        await asyncSetTimeout(0);
        await setModel(api, ['Pear']);
        await setRowData(api, rows('Avocado', 'Pear'));

        const filter = await ColumnFilterHarness.open(api, 'value');
        await filter.miniFilterSearch('a');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Avocado', 'Pear', 'Apple']);

        await filter.miniFilterSearch('app');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Apple']);
        await filter.toggleSetItem('(Select All)');
        await filter.apply();
        expect(modelOf(api)?.values).toEqual(['Pear', 'Apple']);

        await setRowData(api, rows('Apple', 'Avocado', 'Pear'));
        expect(shown(api)).toEqual(['Apple', 'Pear']);
    });

    test('a tree list keeps retained leaves in place, and mutes a group once all of it is retained', async () => {
        const row = (value: string): Row => ({ id: String(nextId++), value });
        const api = gridsManager.createGrid<Row>('grid', {
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: 'dateString',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, treeList: true },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [row('2024-01-01'), row('2024-01-02'), row('2024-01-03'), row('2025-02-01')],
        });
        await asyncSetTimeout(0);
        await setModel(api, ['2024-01-01', '2024-01-03', '2025-02-01']);
        await setRowData(api, [row('2024-01-02'), row('2024-01-03'), row('2025-02-01')]);

        const filter = await ColumnFilterHarness.open(api, 'value');
        // The (Select All) row's icon expands every group; a reload rebuilds the tree collapsed.
        const expandAll = async () => {
            popup().querySelector<HTMLElement>('.ag-set-filter-group-closed-icon')!.click();
            await asyncSetTimeout(0);
        };
        await expandAll();
        const allLabels = ['(Select All)', '2024', 'January', '01', '02', '03', '2025', 'February', '01'];
        expect(filter.setFilterItemLabels()).toEqual(allLabels);
        expect(missingItems()).toEqual(['01']);

        await setRowData(api, [row('2025-02-01')]);
        await expandAll();
        expect(filter.setFilterItemLabels()).toEqual(allLabels);
        expect(missingItems()).toEqual(['2024', 'January', '01', '02', '03']);

        // Every value retained: each group is muted, but (Select All) spans the list and is not.
        await setRowData(api, []);
        await expandAll();
        expect(missingItems()).toEqual(allLabels.slice(1));
    });

    test('a retained tree list item drawn by a cell renderer is announced as not in the current data', async () => {
        const row = (value: string): Row => ({ id: String(nextId++), value });
        const api = gridsManager.createGrid<Row>('grid', {
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: 'dateString',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        preservePreviousValues: true,
                        treeList: true,
                        cellRenderer: (params: { valueFormatted: string }) => params.valueFormatted,
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [row('2024-01-01'), row('2024-01-02')],
        });
        await asyncSetTimeout(0);
        await setRowData(api, [row('2024-01-02')]);

        await ColumnFilterHarness.open(api, 'value');
        popup().querySelector<HTMLElement>('.ag-set-filter-group-closed-icon')!.click();
        await asyncSetTimeout(0);
        const labels = Array.from(popup().querySelectorAll<HTMLElement>('.ag-filter-virtual-list-item')).map((el) =>
            el.getAttribute('aria-label')
        );
        expect(labels.filter((label) => label?.endsWith('not in current data'))).toEqual([
            '01 Filter Value, not in current data',
        ]);
    });

    test('grid state restores selected retained values', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B']);
        await setRowData(api, rows('A', 'C'));
        const state = api.getState();

        const restored = gridsManager.createGrid<Row>('restored', {
            columnDefs: [
                { field: 'value', filter: 'agSetColumnFilter', filterParams: { preservePreviousValues: true } },
            ],
            getRowId: ({ data }) => data.id,
            rowData: rows('A', 'C'),
            initialState: state,
        });
        await asyncSetTimeout(0);
        expect(modelOf(restored)?.values).toEqual(['A', 'B']);
        expect((restored.getColumnFilterHandler('value') as SetFilterHandler).getFilterKeys().sort()).toEqual([
            'A',
            'B',
            'C',
        ]);

        await setRowData(restored, rows('A', 'B', 'C'));
        expect(shown(restored)).toEqual(['A', 'B']);
    });
});
