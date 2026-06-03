import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    PinnedRowModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
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
        modules: [ClientSideRowModelModule, CellSelectionModule, PaginationModule, PinnedRowModule, TextEditorModule],
    });

    async function createGrid(go: GridOptions): Promise<[GridApi, GridActions]> {
        const api = gridMgr.createGrid('myGrid', go);
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return [api, actions];
    }

    function getAriaAnnouncementText(gridDiv: HTMLElement): string {
        return gridDiv.querySelector('.ag-aria-description-container')?.textContent ?? '';
    }

    function getRenderedHeaderGroupCell(gridDiv: HTMLElement): HTMLElement {
        const groupHeader = gridDiv.querySelector('.ag-header-group-cell') as HTMLElement | null;
        expect(groupHeader).toBeTruthy();
        return groupHeader!;
    }

    async function focusHeaderAndGetAnnouncement(api: GridApi, colKey: string): Promise<string> {
        api.setFocusedHeader(api.getColumnGroup(colKey) ?? colKey);
        await asyncSetTimeout(300);

        return getAriaAnnouncementText(getGridElement(api)! as HTMLElement);
    }

    const columnDefs = [{ field: 'sport' }, { field: 'year' }, { field: 'amount' }, { field: 'day' }];
    let rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
        { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
        { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
        { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        rowData = [
            { sport: 'football', year: 2021, amount: 43, day: 'monday' },
            { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
            { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
            { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
            { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
            { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
            { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
        ];
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

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

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── sport "Sport" width:200 editable
                ├── year "Year" width:200 editable
                ├── amount "Amount" width:200 editable
                └── day "Day" width:200 editable
            `);
        });
    });

    describe('Column selection', () => {
        test('CTRL-clicking a column adds that column to the cell selection', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport'], ['year']], api);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        });

        test('clicking selects column and clears all other ranges', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(api, `clicking selects column and clears all other ranges setup`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(api, `clicking selects column and clears all other ranges setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

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

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);
            expect(api.getCellRanges()).toHaveLength(1);

            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['year']], api);
            await new GridRows(api, `clicking selects column and clears all other ranges final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('clicking a column header only selects cells on the current page', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData: rowData.concat(rowData),
                cellSelection: {
                    enableColumnSelection: true,
                },
                pagination: true,
                paginationPageSize: 5,
            });
            await new GridColumns(api, `clicking a column header only selects cells on the current page setup`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    ├── year "Year" width:200
                    ├── amount "Amount" width:200
                    └── day "Day" width:200
                `);
            await new GridRows(api, `clicking a column header only selects cells on the current page setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                ├── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                ├── LEAF id:7 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:8 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:9 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:10 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:11 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:12 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:13 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport'], ['year']], api);
            await new GridRows(api, `clicking a column header only selects cells on the current page final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    ├── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                    ├── LEAF id:7 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:8 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:9 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:10 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:11 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:12 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    └── LEAF id:13 sport:"rowing" year:2019 amount:32 day:"saturday"
                `);
        });

        test('SHIFT-clicking a column selects all columns in the range, CTRL-SHIFT-click is additive', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(
                api,
                `SHIFT-clicking a column selects all columns in the range, CTRL-SHIFT-click is ad setup`
            ).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(
                api,
                `SHIFT-clicking a column selects all columns in the range, CTRL-SHIFT-click is ad setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));
            const amountHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('amount'));
            const dayHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(amountHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['sport', 'year', 'amount']], api);

            await userSession.click(dayHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['day']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['day'], ['year']], api);

            await userSession.keyboard('{Shift>}');
            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['day'], ['sport', 'year']], api);
            await new GridRows(
                api,
                `SHIFT-clicking a column selects all columns in the range, CTRL-SHIFT-click is ad final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('Select range of columns, deselect middle of range, CTRL-SHIFT-click outside of range', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(
                api,
                `Select range of columns, deselect middle of range, CTRL-SHIFT-click outside of r setup`
            ).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(
                api,
                `Select range of columns, deselect middle of range, CTRL-SHIFT-click outside of r setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));
            const amountHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('amount'));
            const dayHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(amountHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport', 'amount']], api);

            await userSession.keyboard('{Shift>}');
            await userSession.click(dayHeaderCell.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['year', 'amount', 'day']], api);
            await new GridRows(
                api,
                `Select range of columns, deselect middle of range, CTRL-SHIFT-click outside of r final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('click column header selects cells in pinned rows as well', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
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
            await new GridColumns(api, `click column header selects cells in pinned rows as well setup`).checkColumns(
                `
                    CENTER
                    ├── sport "Sport" width:200
                    ├── year "Year" width:200
                    ├── amount "Amount" width:200
                    └── day "Day" width:200
                `
            );
            await new GridRows(api, `click column header selects cells in pinned rows as well setup`).check(`
                PINNED_TOP id:t-top-3 sport:"cricket" year:2003 amount:11 day:"friday"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                PINNED_BOTTOM id:b-bottom-2 sport:"tennis" year:2018 amount:235 day:"thursday"
                PINNED_BOTTOM id:b-bottom-6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);
            await new GridRows(api, `click column header selects cells in pinned rows as well final state`).check(`
                PINNED_TOP id:t-top-3 sport:"cricket" year:2003 amount:11 day:"friday"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                PINNED_BOTTOM id:b-bottom-2 sport:"tennis" year:2018 amount:235 day:"thursday"
                PINNED_BOTTOM id:b-bottom-6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('De-selecting column does not affect existing ranges', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
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
            await new GridColumns(api, `De-selecting column does not affect existing ranges setup`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(api, `De-selecting column does not affect existing ranges setup`).check(`
                PINNED_TOP id:t-top-3 sport:"cricket" year:2003 amount:11 day:"friday"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                PINNED_BOTTOM id:b-bottom-2 sport:"tennis" year:2018 amount:235 day:"thursday"
                PINNED_BOTTOM id:b-bottom-6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

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
            await new GridRows(api, `De-selecting column does not affect existing ranges final state`).check(`
                PINNED_TOP id:t-top-3 sport:"cricket" year:2003 amount:11 day:"friday"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                PINNED_BOTTOM id:b-bottom-2 sport:"tennis" year:2018 amount:235 day:"thursday"
                PINNED_BOTTOM id:b-bottom-6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('click group column selects all child columns, CTRL-click deselects child columns', async () => {
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
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(
                api,
                `click group column selects all child columns, CTRL-click deselects child columns setup`
            ).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├─┬ "Category A1" GROUP
                │ └─┬ "Category A2" GROUP
                │   ├── year "Year" width:200
                │   └── amount "Amount" width:200
                └─┬ "Category B1" GROUP
                  └── day "Day" width:200
            `);
            await new GridRows(
                api,
                `click group column selects all child columns, CTRL-click deselects child columns setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('0_0'));

            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);

            assertColumnsSelected([['year', 'amount']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([], api);
            await new GridRows(
                api,
                `click group column selects all child columns, CTRL-click deselects child columns final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
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
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(api, `Can partially de-select group column by CTRL-clicking child column setup`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    ├─┬ "Category A1" GROUP
                    │ └─┬ "Category A2" GROUP
                    │   ├── year "Year" width:200
                    │   └── amount "Amount" width:200
                    └─┬ "Category B1" GROUP
                      └── day "Day" width:200
                `);
            await new GridRows(api, `Can partially de-select group column by CTRL-clicking child column setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                `
            );

            const gridDiv = getGridElement(api)! as HTMLElement;

            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('0_0'));
            const yearHeader = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);

            await userSession.keyboard('{Control>}');
            await userSession.click(yearHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['amount']], api);
            await new GridRows(api, `Can partially de-select group column by CTRL-clicking child column final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                `);
        });

        test('SHIFT-click group column and partial selections', async () => {
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
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(api, `SHIFT-click group column and partial selections setup`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├─┬ "Category A1" GROUP
                │ └─┬ "Category A2" GROUP
                │   ├── year "Year" width:200
                │   └── amount "Amount" width:200
                └─┬ "Category B1" GROUP
                  └── day "Day" width:200
            `);
            await new GridRows(api, `SHIFT-click group column and partial selections setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeader = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(yearHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['sport', 'year']], api);
            await new GridRows(api, `SHIFT-click group column and partial selections final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('Hidden columns do not form part of the cell selection', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });
            await new GridColumns(api, `Hidden columns do not form part of the cell selection setup`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(api, `Hidden columns do not form part of the cell selection setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            api.applyColumnState({ state: [{ colId: 'year', hide: true }] });
            await new GridColumns(api, `Hidden columns do not form part of the cell selection after applyColumnState`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    ├── amount "Amount" width:200
                    └── day "Day" width:200
                `);
            await new GridRows(api, `Hidden columns do not form part of the cell selection after applyColumnState`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                `);

            await userSession.keyboard('{Shift>}');
            await userSession.click(dayHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['sport', 'amount', 'day']], api);
        });

        test('Disabling column selection prevents column selection with mouse', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
            });
            await new GridColumns(api, `Disabling column selection prevents column selection with mouse setup`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    ├── year "Year" width:200
                    ├── amount "Amount" width:200
                    └── day "Day" width:200
                `);
            await new GridRows(api, `Disabling column selection prevents column selection with mouse setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const yearHeaderCell = getByTestId(gridDiv, agTestIdFor.headerCell('year'));

            await userSession.click(sportHeaderCell.querySelector('.ag-header-cell-label')!);
            assertColumnsSelected([], api);

            await userSession.click(yearHeaderCell.querySelector('.ag-header-cell-label')!);
            assertColumnsSelected([], api);
            await new GridRows(api, `Disabling column selection prevents column selection with mouse final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    └── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                `);
        });

        test('suppressMultiRanges prevents multiple column selections', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                    suppressMultiRanges: true,
                },
            });
            await new GridColumns(api, `suppressMultiRanges prevents multiple column selections setup`).checkColumns(
                `
                    CENTER
                    ├── sport "Sport" width:200
                    ├── year "Year" width:200
                    ├── amount "Amount" width:200
                    └── day "Day" width:200
                `
            );
            await new GridRows(api, `suppressMultiRanges prevents multiple column selections setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['sport']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(dayHeader.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([['day']], api);
            await new GridRows(api, `suppressMultiRanges prevents multiple column selections final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('suppressMultiRanges clears existing selections when selecting a column (header)', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                    suppressMultiRanges: true,
                },
            });
            await new GridColumns(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (header) setup`
            ).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
            await new GridRows(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (header) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

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
            await new GridRows(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (header) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
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
                cellSelection: { enableColumnSelection: true, suppressMultiRanges: true },
            });
            await new GridColumns(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (group he setup`
            ).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├─┬ "Category A1" GROUP
                │ └─┬ "Category A2" GROUP
                │   ├── year "Year" width:200
                │   └── amount "Amount" width:200
                └─┬ "Category B1" GROUP
                  └── day "Day" width:200
            `);
            await new GridRows(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (group he setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

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
            await new GridRows(
                api,
                `suppressMultiRanges clears existing selections when selecting a column (group he final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        test('ALT-click sorts, does not select column', async () => {
            const userSession = userEvent.setup();

            const [api] = await createGrid({
                columnDefs,
                rowData,
                cellSelection: {
                    enableColumnSelection: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

            await userSession.keyboard('{Alt>}');
            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            assertColumnsSelected([], api);

            await new GridRows(api, 'grid').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
            `);
        });

        test('CTRL-click group header de-selects children from existing spanning range', async () => {
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
                cellSelection: { enableColumnSelection: true },
            });
            await new GridColumns(api, `CTRL-click group header de-selects children from existing spanning range setup`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    ├─┬ "Category A1" GROUP
                    │ └─┬ "Category A2" GROUP
                    │   ├── year "Year" width:200
                    │   └── amount "Amount" width:200
                    └─┬ "Category B1" GROUP
                      └── day "Day" width:200
                `);
            await new GridRows(api, `CTRL-click group header de-selects children from existing spanning range setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
                `);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));
            const catA1Header = getByTestId(gridDiv, agTestIdFor.headerGroupCell('1_0'));
            const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));

            await userSession.click(sportHeader.querySelector('.ag-header-cell-label')!);

            await userSession.keyboard('{Shift>}');
            await userSession.click(dayHeader.querySelector('.ag-header-cell-label')!);
            await userSession.keyboard('{/Shift}');

            assertColumnsSelected([['sport', 'year', 'amount', 'day']], api);

            await userSession.keyboard('{Control>}');
            await userSession.click(catA1Header.querySelector('.ag-header-group-cell-label')!);
            await userSession.keyboard('{/Control}');

            assertColumnsSelected([['sport', 'day']], api);
            await new GridRows(
                api,
                `CTRL-click group header de-selects children from existing spanning range final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 sport:"rowing" year:2019 amount:32 day:"saturday"
            `);
        });

        describe('ARIA announcements', () => {
            test('sortable leaf header announces ENTER sort when column selection is disabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [{ field: 'sport', sortable: true }],
                    rowData,
                });
                await new GridColumns(
                    api,
                    `sortable leaf header announces ENTER sort when column selection is disabled setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `sortable leaf header announces ENTER sort when column selection is disabled setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'sport');
                const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

                expect(announcement).toContain('Press ENTER to sort');
                expect(announcement).not.toContain('Press ALT ENTER to sort');
                expect(sportHeader.getAttribute('aria-sort')).toBe('none');
                await new GridRows(
                    api,
                    `sortable leaf header announces ENTER sort when column selection is disabled final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('sortable leaf header announces selection and ALT ENTER sort when column selection is enabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [{ field: 'sport', sortable: true }],
                    rowData,
                    cellSelection: { enableColumnSelection: true },
                });
                await new GridColumns(
                    api,
                    `sortable leaf header announces selection and ALT ENTER sort when column selectio setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
                await new GridRows(
                    api,
                    `sortable leaf header announces selection and ALT ENTER sort when column selectio setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'sport');
                const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

                expect(announcement).toContain('Press Enter to toggle selection for all visible cells in this column');
                expect(announcement).toContain('Press ALT ENTER to sort');
                expect(announcement).not.toContain('Press ENTER to sort');
                expect(sportHeader.getAttribute('aria-sort')).toBe('none');
                await new GridRows(
                    api,
                    `sortable leaf header announces selection and ALT ENTER sort when column selectio final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('non-sortable leaf header only announces selection when column selection is enabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [{ field: 'sport', sortable: false }],
                    rowData,
                    cellSelection: { enableColumnSelection: true },
                });
                await new GridColumns(
                    api,
                    `non-sortable leaf header only announces selection when column selection is enabl setup`
                ).checkColumns(`
                    CENTER
                    └── sport "Sport" width:200 !sortable
                `);
                await new GridRows(
                    api,
                    `non-sortable leaf header only announces selection when column selection is enabl setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'sport');
                const sportHeader = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

                expect(announcement).toContain('Press Enter to toggle selection for all visible cells in this column');
                expect(announcement).not.toContain('Press ENTER to sort');
                expect(announcement).not.toContain('Press ALT ENTER to sort');
                expect(sportHeader.getAttribute('aria-sort')).toBeNull();
                await new GridRows(
                    api,
                    `non-sortable leaf header only announces selection when column selection is enabl final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('expandable group header announces ENTER expand or collapse when column selection is disabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [
                        {
                            groupId: 'expandableGroup',
                            headerName: 'Expandable Group',
                            openByDefault: true,
                            children: [
                                { field: 'sport' },
                                { field: 'year', columnGroupShow: 'open' },
                                { field: 'amount', columnGroupShow: 'closed' },
                            ],
                        },
                    ],
                    rowData,
                });
                await new GridColumns(
                    api,
                    `expandable group header announces ENTER expand or collapse when column selection setup`
                ).checkColumns(`
                    CENTER
                    └─┬ "Expandable Group" GROUP open
                      ├── sport "Sport" width:200
                      ├── year "Year" width:200 columnGroupShow:open
                      └── amount "Amount" width:200 columnGroupShow:closed hidden
                `);
                await new GridRows(
                    api,
                    `expandable group header announces ENTER expand or collapse when column selection setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'expandableGroup');
                const groupHeader = getRenderedHeaderGroupCell(gridDiv);

                expect(announcement).toContain('Press ENTER to expand or collapse this column group');
                expect(announcement).not.toContain(
                    'Press Enter to toggle selection for all visible cells in this column group'
                );
                expect(groupHeader.getAttribute('aria-expanded')).toBe('true');
                await new GridRows(
                    api,
                    `expandable group header announces ENTER expand or collapse when column selection final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32
                `);
            });

            test('expandable group header announces selection and ALT ENTER expand or collapse when column selection is enabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [
                        {
                            groupId: 'expandableGroup',
                            headerName: 'Expandable Group',
                            openByDefault: true,
                            children: [
                                { field: 'sport' },
                                { field: 'year', columnGroupShow: 'open' },
                                { field: 'amount', columnGroupShow: 'closed' },
                            ],
                        },
                    ],
                    rowData,
                    cellSelection: { enableColumnSelection: true },
                });
                await new GridColumns(
                    api,
                    `expandable group header announces selection and ALT ENTER expand or collapse whe setup`
                ).checkColumns(`
                    CENTER
                    └─┬ "Expandable Group" GROUP open
                      ├── sport "Sport" width:200
                      ├── year "Year" width:200 columnGroupShow:open
                      └── amount "Amount" width:200 columnGroupShow:closed hidden
                `);
                await new GridRows(
                    api,
                    `expandable group header announces selection and ALT ENTER expand or collapse whe setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'expandableGroup');
                const groupHeader = getRenderedHeaderGroupCell(gridDiv);

                expect(announcement).toContain(
                    'Press Enter to toggle selection for all visible cells in this column group'
                );
                expect(announcement).toContain('Press ALT ENTER to expand or collapse this column group');
                expect(announcement).not.toContain('Press ENTER to expand or collapse this column group');
                expect(groupHeader.getAttribute('aria-expanded')).toBe('true');
                await new GridRows(
                    api,
                    `expandable group header announces selection and ALT ENTER expand or collapse whe final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021 amount:43
                    ├── LEAF id:1 sport:"rugby" year:2020 amount:102
                    ├── LEAF id:2 sport:"tennis" year:2018 amount:235
                    ├── LEAF id:3 sport:"cricket" year:2003 amount:11
                    ├── LEAF id:4 sport:"golf" year:2021 amount:7
                    ├── LEAF id:5 sport:"swimming" year:2020 amount:93
                    └── LEAF id:6 sport:"rowing" year:2019 amount:32
                `);
            });

            test('non-expandable group header only announces selection when column selection is enabled', async () => {
                const [api] = await createGrid({
                    columnDefs: [
                        {
                            groupId: 'staticGroup',
                            headerName: 'Static Group',
                            children: [{ field: 'sport' }, { field: 'year' }],
                        },
                    ],
                    rowData,
                    cellSelection: { enableColumnSelection: true },
                });
                await new GridColumns(
                    api,
                    `non-expandable group header only announces selection when column selection is en setup`
                ).checkColumns(`
                    CENTER
                    └─┬ "Static Group" GROUP
                      ├── sport "Sport" width:200
                      └── year "Year" width:200
                `);
                await new GridRows(
                    api,
                    `non-expandable group header only announces selection when column selection is en setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021
                    ├── LEAF id:1 sport:"rugby" year:2020
                    ├── LEAF id:2 sport:"tennis" year:2018
                    ├── LEAF id:3 sport:"cricket" year:2003
                    ├── LEAF id:4 sport:"golf" year:2021
                    ├── LEAF id:5 sport:"swimming" year:2020
                    └── LEAF id:6 sport:"rowing" year:2019
                `);

                const gridDiv = getGridElement(api)! as HTMLElement;
                const announcement = await focusHeaderAndGetAnnouncement(api, 'staticGroup');
                const groupHeader = getRenderedHeaderGroupCell(gridDiv);

                expect(announcement).toContain(
                    'Press Enter to toggle selection for all visible cells in this column group'
                );
                expect(announcement).not.toContain('Press ENTER to expand or collapse this column group');
                expect(announcement).not.toContain('Press ALT ENTER to expand or collapse this column group');
                expect(groupHeader.getAttribute('aria-expanded')).toBeNull();
                await new GridRows(
                    api,
                    `non-expandable group header only announces selection when column selection is en final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021
                    ├── LEAF id:1 sport:"rugby" year:2020
                    ├── LEAF id:2 sport:"tennis" year:2018
                    ├── LEAF id:3 sport:"cricket" year:2003
                    ├── LEAF id:4 sport:"golf" year:2021
                    ├── LEAF id:5 sport:"swimming" year:2020
                    └── LEAF id:6 sport:"rowing" year:2019
                `);
            });
        });
    });
});
