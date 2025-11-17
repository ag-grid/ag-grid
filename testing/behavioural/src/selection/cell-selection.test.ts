import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    PinnedRowModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import {
    TestGridsManager,
    assertColumnsSelected,
    assertSelectedCellRanges,
    asyncSetTimeout,
    waitForEvent,
} from '../test-utils';
import { GridActions } from './utils';

describe('Cell Selection', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, PaginationModule, PinnedRowModule],
    });

    async function createGrid(go: GridOptions): Promise<[GridApi, GridActions]> {
        const api = gridMgr.createGrid('myGrid', go);
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return [api, actions];
    }

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    const columnDefs = [{ field: 'sport' }, { field: 'year' }, { field: 'amount' }, { field: 'day' }];
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
        { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
        { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
        { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
    ];

    describe('Fill Handle', () => {
        test('Double click on fill handle fills down', async () => {
            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    handle: {
                        mode: 'fill',
                    },
                },
                defaultColDef: {
                    editable: true,
                },
                getRowId(params) {
                    return params.data?.sport;
                },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            await asyncSetTimeout(1);
            const cell = getByTestId(gridDiv, agTestIdFor.cell('tennis', 'sport'));

            const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
            // Need to manually dispatch touchstart because when running in JSDOM the grid will only attach touchstart not mousedown
            cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));

            await cellSelectionChanged;
            await asyncSetTimeout(1);

            const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());

            const fillEnd = waitForEvent('fillEnd', api);

            await userEvent.dblClick(fillHandle);

            await fillEnd;

            const sports: string[] = [];
            api.forEachNode((node) => {
                sports.push(api.getCellValue({ rowNode: node, colKey: 'sport' }) ?? '');
            });

            expect(sports).toEqual(['football', 'rugby', 'tennis', 'tennis', 'tennis', 'tennis', 'tennis']);
        });
    });

    describe('Column selection', () => {
        test('CTRL-clicking a column adds that column to the cell selection', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport'], ['year']], api);
        });

        test('CTRL-clicking a column header only selects cells on the current page', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData: rowData.concat(rowData),
                cellSelection: {
                    suppressColumnSelection: false,
                },
                pagination: true,
                paginationPageSize: 5,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport'], ['year']], api);
        });

        test('CTRL-SHIFT-clicking a column selects all columns in the range', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const amountHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('amount'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(amountHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}{/Control}');

            assertColumnsSelected([['sport', 'year', 'amount']], api);
        });

        test('Select range of columns, deselect middle of range, CTRL-SHIFT-click outside of range', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    suppressColumnSelection: false,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));
            const amountHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('amount'));
            const dayHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(amountHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport', 'amount']], api);

            await userSession.keyboard('{Shift>}');
            await userSession.click(dayHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['year', 'amount', 'day']], api);
        });

        test('CTRL-click column header selects cells in pinned rows as well', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
                enableRowPinning: true,
                isRowPinned: (node) => {
                    if (node.data?.year < 2010) {
                        return 'top';
                    }
                    if (node.data?.year < 2020) {
                        return 'bottom';
                    }
                    return null;
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport']], api);
        });

        test('De-selecting column does not affect existing ranges', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
                enableRowPinning: true,
                isRowPinned: (node) => {
                    if (node.data?.year < 2010) {
                        return 'top';
                    }
                    if (node.data?.year < 2020) {
                        return 'bottom';
                    }
                    return null;
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const yearCol = api.getColumn('year')!;
            const amountCol = api.getColumn('amount')!;

            api.addCellRange({
                columns: [yearCol, amountCol],
                columnStart: yearCol,
                columnEnd: amountCol,
                rowStartIndex: 2,
                rowStartPinned: null,
                rowEndIndex: 4,
                rowEndPinned: null,
            });

            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            // Toggle selection on
            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            const ranges = api.getCellRanges()!;
            expect(ranges).toHaveLength(2);
            expect(ranges[0].startRow?.rowIndex).toBe(2);
            expect(ranges[0].endRow?.rowIndex).toBe(4);
            expect(ranges[0].columns).toEqual([yearCol, amountCol]);
            assertColumnsSelected([['year']], api);

            // Toggle selection off
            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            const ranges2 = api.getCellRanges()!;
            expect(ranges2).toHaveLength(1);
            expect(ranges2[0].startRow?.rowIndex).toBe(2);
            expect(ranges2[0].endRow?.rowIndex).toBe(4);
            expect(ranges2[0].columns).toHaveLength(2);
            expect(ranges2[0].columns[0]).toBe(yearCol);
        });

        test('CTRL-click group column selects all child columns', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs: [
                    {
                        field: 'sport',
                    },
                    {
                        headerName: 'Category A1',
                        children: [
                            {
                                headerName: 'Category A2',
                                children: [{ field: 'year' }, { field: 'amount' }],
                            },
                        ],
                    },
                    {
                        headerName: 'Category B1',
                        children: [{ field: 'day' }],
                    },
                ],
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('0_0'));

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['year', 'amount']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([], api);
        });

        test('Can partially de-select group column by CTRL-clicking child column', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs: [
                    {
                        field: 'sport',
                    },
                    {
                        headerName: 'Category A1',
                        children: [
                            {
                                headerName: 'Category A2',
                                children: [{ field: 'year' }, { field: 'amount' }],
                            },
                        ],
                    },
                    {
                        headerName: 'Category B1',
                        children: [{ field: 'day' }],
                    },
                ],
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('0_0'));
            const yearHeader = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['amount']], api);
        });

        test('CTRL-SHIFT-click group column and partial selections', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs: [
                    {
                        field: 'sport',
                    },
                    {
                        headerName: 'Category A1',
                        children: [
                            {
                                headerName: 'Category A2',
                                children: [{ field: 'year' }, { field: 'amount' }],
                            },
                        ],
                    },
                    {
                        headerName: 'Category B1',
                        children: [{ field: 'day' }],
                    },
                ],
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeader = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(yearHeader.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{/Shift}{/Control}');

            assertColumnsSelected([['sport', 'year']], api);
        });

        test('Hidden columns do not form part of the cell selection', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            api.applyColumnState({ state: [{ colId: 'year', hide: true }] });

            await userSession.keyboard('{Shift>}');
            await userSession.click(dayHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}{/Control}');

            assertColumnsSelected([['sport', 'amount', 'day']], api);
        });

        test('suppressColumnSelection prevents column selection with mouse', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    suppressColumnSelection: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([], api);
        });

        test('suppressMultiRanges prevents multiple column selections', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    suppressMultiRanges: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(dayHeader.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['day']], api);
        });

        test('suppressMultiRanges clears existing selections when selecting a column (header)', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    suppressMultiRanges: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

            api.addCellRange({
                columns: [api.getColumn('sport')!, api.getColumn('year')!],
                rowStartIndex: 1,
                rowEndIndex: 3,
            });

            assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 3, columns: ['sport', 'year'] }], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 6, columns: ['sport'] }], api);
        });

        test('suppressMultiRanges clears existing selections when selecting a column (group header)', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs: [
                    {
                        field: 'sport',
                    },
                    {
                        headerName: 'Category A1',
                        children: [
                            {
                                headerName: 'Category A2',
                                children: [{ field: 'year' }, { field: 'amount' }],
                            },
                        ],
                    },
                    {
                        headerName: 'Category B1',
                        children: [{ field: 'day' }],
                    },
                ],
                rowData,
                cellSelection: { suppressMultiRanges: true },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('0_0'));

            api.addCellRange({
                columns: [api.getColumn('sport')!, api.getColumn('year')!],
                rowStartIndex: 1,
                rowEndIndex: 3,
            });

            assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 3, columns: ['sport', 'year'] }], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 6, columns: ['year', 'amount'] }], api);
        });
    });
});
