import { getByTestId } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    KeyCode,
    ROW_NUMBERS_COLUMN_ID,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { CellSelectionModule, RowNumbersModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    assertSelectedCellRanges,
    asyncSetTimeout,
    waitForEvent,
} from '../test-utils';
import { GridActions } from './utils';

describe('Row Numbers Cell Selection', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, RowNumbersModule],
    });

    async function createGrid(go: GridOptions): Promise<[GridApi, GridActions]> {
        const api = gridMgr.createGrid('myGrid', go);
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return [api, actions];
    }

    // Have to use touch instead of click because the grid only attaches touchstart in JSDOM
    function click(element: HTMLElement, options?: MouseEventInit): void {
        element.dispatchEvent(new MouseEvent('touchstart', { bubbles: true, ...options }));
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

    test('rowNumbers valueFormatter overrides the displayed row number', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData: rowData.slice(0, 3),
            rowNumbers: {
                valueFormatter: (params) => `#${params.value}`,
            },
        });

        await new GridRows(api, 'rowNumbers valueFormatter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"#1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"#2" sport:"rugby" year:2020 amount:102 day:"sunday"
            └── LEAF id:2 row-number:"#3" sport:"tennis" year:2018 amount:235 day:"thursday"
        `);
    });

    test('click row number selects row cells, clears existing range', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `click row number selects row cells, clears existing range setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `click row number selects row cells, clears existing range setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2);
        assertSelectedCellRanges([{ rowEndIndex: 1, rowStartIndex: 1, columns }], api);
        await new GridRows(api, `click row number selects row cells, clears existing range final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('click row number focuses first non-row-number cell, never the row-number cell', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(
            api,
            `click row number focuses first non-row-number cell, never the row-number cell setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `click row number focuses first non-row-number cell, never the row-number cell setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
            `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));

        click(row1);
        // focusFirstRenderedCellAtRowPosition runs inside a setTimeout
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        // regression: a prior refactor inverted the predicate and focused ROW_NUMBERS_COLUMN_ID instead
        expect(focused!.column.getColId()).not.toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.column.getColId()).toBe('sport');
        expect(focused!.rowIndex).toBe(0);
        await new GridRows(
            api,
            `click row number focuses first non-row-number cell, never the row-number cell final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('CTRL-click row number selects row cells additively', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `CTRL-click row number selects row cells additively setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `CTRL-click row number selects row cells additively setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 1, rowStartIndex: 1, columns },
            ],
            api
        );
        await new GridRows(api, `CTRL-click row number selects row cells additively final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('CTRL-click row number deselects already-selected row cells', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `CTRL-click row number deselects already-selected row cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `CTRL-click row number deselects already-selected row cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row1, { ctrlKey: true });
        assertSelectedCellRanges([], api);
        await new GridRows(api, `CTRL-click row number deselects already-selected row cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('CTRL-click row number deselects, re-selecting does not merge with adjacent ranges', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(
            api,
            `CTRL-click row number deselects, re-selecting does not merge with adjacent range setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `CTRL-click row number deselects, re-selecting does not merge with adjacent range setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const row3 = getByTestId(gridDiv, agTestIdFor.rowNumber('2'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        click(row3, { shiftKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 2, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 2, rowStartIndex: 2, columns },
            ],
            api
        );

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 2, rowStartIndex: 2, columns },
                { rowEndIndex: 1, rowStartIndex: 1, columns },
            ],
            api
        );
        await new GridRows(
            api,
            `CTRL-click row number deselects, re-selecting does not merge with adjacent range final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('SHIFT-click row number selects range of row cells', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `SHIFT-click row number selects range of row cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `SHIFT-click row number selects range of row cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row4, { shiftKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 3, rowStartIndex: 0, columns }], api);
        await new GridRows(api, `SHIFT-click row number selects range of row cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });

    test('CTRL-SHIFT-click row number selects range of row cells additively', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `CTRL-SHIFT-click row number selects range of row cells additively setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `CTRL-SHIFT-click row number selects range of row cells additively setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row2 = getByTestId(gridDiv, agTestIdFor.rowNumber('1'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row1);
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row2, { ctrlKey: true });
        assertSelectedCellRanges([{ rowEndIndex: 0, rowStartIndex: 0, columns }], api);

        click(row4, { ctrlKey: true, shiftKey: true });
        assertSelectedCellRanges(
            [
                { rowEndIndex: 0, rowStartIndex: 0, columns },
                { rowEndIndex: 3, rowStartIndex: 1, columns },
            ],
            api
        );
        await new GridRows(api, `CTRL-SHIFT-click row number selects range of row cells additively final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
                ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
                ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
                └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
            `
        );
    });

    test('CTRL-click to deselect when range created bottom-up', async () => {
        const [api] = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `CTRL-click to deselect when range created bottom-up setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `CTRL-click to deselect when range created bottom-up setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const row1 = getByTestId(gridDiv, agTestIdFor.rowNumber('0'));
        const row4 = getByTestId(gridDiv, agTestIdFor.rowNumber('3'));
        const columns = api.getColumns()!.map((c) => c.getColId());

        click(row4);
        click(row1, { shiftKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 3, rowEndIndex: 0, columns }], api);

        click(row1, { ctrlKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 3, rowEndIndex: 1, columns }], api);

        click(row4, { ctrlKey: true });
        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 1, columns }], api);
        await new GridRows(api, `CTRL-click to deselect when range created bottom-up final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:4 row-number:"5" sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:5 row-number:"6" sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:6 row-number:"7" sport:"rowing" year:2019 amount:32 day:"saturday"
        `);
    });
});

describe('Row Numbers Keyboard Navigation', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, RowNumbersModule],
    });

    async function createGrid(go: GridOptions): Promise<GridApi> {
        const api = gridMgr.createGrid('myGrid', go);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return api;
    }

    function pressKey(element: HTMLElement, key: string, opts?: KeyboardEventInit): void {
        element.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key, bubbles: true }));
    }

    function getAriaAnnouncementText(gridDiv: HTMLElement): string {
        return gridDiv.querySelector('.ag-aria-description-container')?.textContent ?? '';
    }

    function getFocusedHeaderColId(): string | null {
        const activeElement = document.activeElement as HTMLElement | null;
        return activeElement?.closest('.ag-header-cell')?.getAttribute('col-id') ?? null;
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
    const dataColumns = columnDefs.map((colDef) => colDef.field!);
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
    ];

    test('Arrow Left from first data column navigates to row number cell', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Arrow Left from first data column navigates to row number cell setup`).checkColumns(
            `
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `
        );
        await new GridRows(api, `Arrow Left from first data column navigates to row number cell setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.LEFT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(0);
        await new GridRows(api, `Arrow Left from first data column navigates to row number cell final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Arrow Right from row number cell navigates to first data column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Arrow Right from row number cell navigates to first data column setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `Arrow Right from row number cell navigates to first data column setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.RIGHT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.column.getColId()).toBe('sport');
        expect(focused!.rowIndex).toBe(0);
        await new GridRows(api, `Arrow Right from row number cell navigates to first data column final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `
        );
    });

    test('Arrow Up/Down navigates within row number column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Arrow Up/Down navigates within row number column setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Arrow Up/Down navigates within row number column setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        let focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        pressKey(focusedCell, KeyCode.DOWN);
        await asyncSetTimeout(0);

        let focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(1);

        focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        pressKey(focusedCell, KeyCode.DOWN);
        await asyncSetTimeout(0);

        focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(2);

        focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        pressKey(focusedCell, KeyCode.UP);
        await asyncSetTimeout(0);

        focused = api.getFocusedCell();
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(focused!.rowIndex).toBe(1);
        await new GridRows(api, `Arrow Up/Down navigates within row number column final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Tab can focus row number cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Tab can focus row number cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Tab can focus row number cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        // Focus the last column of row 0
        api.setFocusedCell(0, 'day');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        // Tab forward should wrap to next row and focus the row number column
        pressKey(focusedCell, KeyCode.TAB);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.rowIndex).toBe(1);
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        await new GridRows(api, `Tab can focus row number cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Tab from header into grid can focus row number cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Tab from header into grid can focus row number cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Tab from header into grid can focus row number cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedHeader('day');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const dayHeader = getByTestId(gridDiv, agTestIdFor.headerCell('day'));
        pressKey(dayHeader, KeyCode.TAB);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused).toBeTruthy();
        expect(focused!.rowIndex).toBe(0);
        expect(focused!.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        await new GridRows(api, `Tab from header into grid can focus row number cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Row number header focus does not announce select-all hint when cell selection integration is disabled', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
        });
        await new GridColumns(
            api,
            `Row number header focus does not announce select-all hint when cell selection in setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `Row number header focus does not announce select-all hint when cell selection in setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        rowNumberHeader.dispatchEvent(new Event('focus'));

        await asyncSetTimeout(300);

        expect(getAriaAnnouncementText(gridDiv)).toBe('');
        await new GridRows(
            api,
            `Row number header focus does not announce select-all hint when cell selection in final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Row number header focus does not announce column selection hint', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: { enableColumnSelection: true },
            rowNumbers: true,
        });
        await new GridColumns(api, `Row number header focus does not announce column selection hint setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `Row number header focus does not announce column selection hint setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        rowNumberHeader.dispatchEvent(new Event('focus'));

        await asyncSetTimeout(300);

        const announcement = getAriaAnnouncementText(gridDiv);
        expect(announcement).toContain('Press Space or Enter to select all cells');
        expect(announcement).not.toContain('Press Enter to toggle selection for all visible cells in this column');
        await new GridRows(api, `Row number header focus does not announce column selection hint final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `
        );
    });

    test('Space on row number header selects all cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Space on row number header selects all cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Space on row number header selects all cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedHeader(ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        pressKey(rowNumberHeader, KeyCode.SPACE);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 3, columns: dataColumns }], api);
        expect(getFocusedHeaderColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        await new GridRows(api, `Space on row number header selects all cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Enter on row number header selects all cells', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Enter on row number header selects all cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Enter on row number header selects all cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedHeader(ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberHeader = getByTestId(gridDiv, agTestIdFor.headerCell(ROW_NUMBERS_COLUMN_ID));
        pressKey(rowNumberHeader, KeyCode.ENTER);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 3, columns: dataColumns }], api);
        expect(getFocusedHeaderColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        await new GridRows(api, `Enter on row number header selects all cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Space on row number cell does not select cells in that row', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Space on row number cell does not select cells in that row setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Space on row number cell does not select cells in that row setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.SPACE);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([], api);
        await new GridRows(api, `Space on row number cell does not select cells in that row final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Enter on row number cell selects all cells in that row', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Enter on row number cell selects all cells in that row setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Enter on row number cell selects all cells in that row setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(2, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.ENTER);
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns }], api);
        await new GridRows(api, `Enter on row number cell selects all cells in that row final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Row number cell includes aria-rowindex attribute', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
        });
        await new GridColumns(api, `Row number cell includes aria-rowindex attribute setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Row number cell includes aria-rowindex attribute setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.ensureIndexVisible(2);
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const rowNumberCell = getByTestId(gridDiv, agTestIdFor.rowNumber('2'));

        expect(rowNumberCell.getAttribute('aria-rowindex')).toBe('4');
        await new GridRows(api, `Row number cell includes aria-rowindex attribute final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Row number cell focus announces select-row-cells hint', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Row number cell focus announces select-row-cells hint setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Row number cell focus announces select-row-cells hint setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(300);

        expect(getAriaAnnouncementText(gridDiv)).toContain('Press Enter to select all cells on this row');
        await new GridRows(api, `Row number cell focus announces select-row-cells hint final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Arrow navigation into row number cell does not clear an existing range', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Arrow navigation into row number cell does not clear an existing range setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `Arrow navigation into row number cell does not clear an existing range setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `
        );

        api.addCellRange({
            rowStartIndex: 0,
            rowEndIndex: 1,
            columnStart: 'sport',
            columnEnd: 'year',
        });

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;
        expect(focusedCell).toBeTruthy();

        pressKey(focusedCell, KeyCode.LEFT);
        await asyncSetTimeout(0);

        const focused = api.getFocusedCell();
        expect(focused?.column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 1, columns: ['sport', 'year'] }], api);
        await new GridRows(api, `Arrow navigation into row number cell does not clear an existing range final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `);
    });

    test('Ctrl+Enter on row number cell supports add and remove selection', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Ctrl+Enter on row number cell supports add and remove selection setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `Ctrl+Enter on row number cell supports add and remove selection setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 0, columns: dataColumns }], api);

        api.setFocusedCell(2, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges(
            [
                { rowStartIndex: 0, rowEndIndex: 0, columns: dataColumns },
                { rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns },
            ],
            api
        );

        api.setFocusedCell(0, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 2, columns: dataColumns }], api);
        await new GridRows(api, `Ctrl+Enter on row number cell supports add and remove selection final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `
        );
    });

    test('Ctrl+Enter does not deselect with suppressMultiRanges', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: { suppressMultiRanges: true },
            rowNumbers: true,
        });
        await new GridColumns(api, `Ctrl+Enter does not deselect with suppressMultiRanges setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(api, `Ctrl+Enter does not deselect with suppressMultiRanges setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: dataColumns }], api);

        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER, { ctrlKey: true });
        await asyncSetTimeout(0);
        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: dataColumns }], api);
        await new GridRows(api, `Ctrl+Enter does not deselect with suppressMultiRanges final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Shift+Arrow Down from row number cell preserves full-row range', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(api, `Shift+Arrow Down from row number cell preserves full-row range setup`).checkColumns(
            `
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `
        );
        await new GridRows(api, `Shift+Arrow Down from row number cell preserves full-row range setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(1, ROW_NUMBERS_COLUMN_ID);
        await asyncSetTimeout(0);
        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.ENTER);
        await asyncSetTimeout(0);

        pressKey(gridDiv.querySelector('.ag-cell-focus') as HTMLElement, KeyCode.DOWN, { shiftKey: true });
        await asyncSetTimeout(0);

        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 2, columns: dataColumns }], api);
        await new GridRows(api, `Shift+Arrow Down from row number cell preserves full-row range final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('Shift+Arrow Left from first data column does not extend range into row number column', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: true,
        });
        await new GridColumns(
            api,
            `Shift+Arrow Left from first data column does not extend range into row number co setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `Shift+Arrow Left from first data column does not extend range into row number co setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        api.setFocusedCell(0, 'sport');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const focusedCell = gridDiv.querySelector('.ag-cell-focus') as HTMLElement;

        pressKey(focusedCell, KeyCode.LEFT, { shiftKey: true });
        await asyncSetTimeout(0);

        const ranges = api.getCellRanges();
        if (ranges && ranges.length > 0) {
            for (const range of ranges) {
                const rangeCols = range.columns.map((c) => c.getColId());
                expect(rangeCols).not.toContain(ROW_NUMBERS_COLUMN_ID);
            }
        }
        await new GridRows(
            api,
            `Shift+Arrow Left from first data column does not extend range into row number co final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('toggling rowNumbers off removes the column; turning it back on restores it', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
        });
        await new GridColumns(api, `toggling rowNumbers off removes the column; turning it back on restores it setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `toggling rowNumbers off removes the column; turning it back on restores it setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
                ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
                ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
                └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
            `);
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)).not.toBeNull();

        api.setGridOption('rowNumbers', false);
        await new GridColumns(
            api,
            `toggling rowNumbers off removes the column; turning it back on restores it after setGridOption rowNumbers`
        ).checkColumns(`
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `toggling rowNumbers off removes the column; turning it back on restores it after setGridOption rowNumbers`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 sport:"cricket" year:2003 amount:11 day:"friday"
        `);
        await asyncSetTimeout(0);
        const offCol = api.getColumn(ROW_NUMBERS_COLUMN_ID);
        expect(offCol === null ? null : offCol.getColId()).toBeNull();
        expect(api.getDisplayedLeftColumns().map((c) => c.getColId())).not.toContain(ROW_NUMBERS_COLUMN_ID);

        api.setGridOption('rowNumbers', true);
        await new GridColumns(
            api,
            `toggling rowNumbers off removes the column; turning it back on restores it after setGridOption rowNumbers #2`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `toggling rowNumbers off removes the column; turning it back on restores it after setGridOption rowNumbers #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
        await asyncSetTimeout(0);
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)).not.toBeNull();
    });

    test('rowNumbers options (width, headerTooltip, valueGetter) flow through to the colDef', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: {
                width: 90,
                headerTooltip: 'Row #',
                valueGetter: () => 'X',
            },
        });
        await new GridColumns(
            api,
            `rowNumbers options (width, headerTooltip, valueGetter) flow through to the colDe setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:90 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `rowNumbers options (width, headerTooltip, valueGetter) flow through to the colDe setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"X" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"X" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"X" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"X" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const col = api.getColumn(ROW_NUMBERS_COLUMN_ID)!;
        const def = col.getColDef();
        expect(def.headerTooltip).toBe('Row #');
        expect(col.getActualWidth()).toBe(90);
        // valueGetter override should produce 'X' for each row.
        const firstRow = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: firstRow, colKey: col })).toBe('X');
        await new GridRows(
            api,
            `rowNumbers options (width, headerTooltip, valueGetter) flow through to the colDe final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"X" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"X" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"X" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"X" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
    });

    test('rowNumbers options mutated at runtime propagate via updateColumns', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: { width: 80 },
        });
        await new GridColumns(api, `rowNumbers options mutated at runtime propagate via updateColumns setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:80 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── sport "Sport" width:200
                ├── year "Year" width:200
                ├── amount "Amount" width:200
                └── day "Day" width:200
            `);
        await new GridRows(api, `rowNumbers options mutated at runtime propagate via updateColumns setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);

        const colBefore = api.getColumn(ROW_NUMBERS_COLUMN_ID)!;
        expect(colBefore.getActualWidth()).toBe(80);

        api.setGridOption('rowNumbers', { width: 120, headerTooltip: 'New' });
        await new GridColumns(
            api,
            `rowNumbers options mutated at runtime propagate via updateColumns after setGridOption rowNumbers`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:120 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
        await new GridRows(
            api,
            `rowNumbers options mutated at runtime propagate via updateColumns after setGridOption rowNumbers`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 row-number:"1" sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:1 row-number:"2" sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:2 row-number:"3" sport:"tennis" year:2018 amount:235 day:"thursday"
            └── LEAF id:3 row-number:"4" sport:"cricket" year:2003 amount:11 day:"friday"
        `);
        await asyncSetTimeout(0);

        const colAfter = api.getColumn(ROW_NUMBERS_COLUMN_ID)!;
        expect(colAfter.getActualWidth()).toBe(120);
        expect(colAfter.getColDef().headerTooltip).toBe('New');
    });

    test('row-numbers col is right-pinned under enableRtl', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            rowNumbers: true,
            enableRtl: true,
        });

        await new GridColumns(api, 'rowNumbers col pins right under RTL').checkColumns(`
            CENTER
            ├── sport "Sport" width:200
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
            RIGHT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:right
        `);
        expect(api.getDisplayedRightColumns().map((c) => c.getColId())).toContain(ROW_NUMBERS_COLUMN_ID);
    });
});

describe('Row Numbers refresh coalescing', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, RowNumbersModule] });

    afterEach(() => gridMgr.reset());

    function countRefreshes(api: GridApi): { displayed: number } {
        const counts = { displayed: 0 };
        api.addEventListener('displayedColumnsChanged', () => counts.displayed++);
        return counts;
    }

    test('changing a rowNumbers def prop refreshes once, not twice', async () => {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            rowNumbers: { width: 60 },
        });
        await new GridColumns(api, 'rowNumbers width 60').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);
        await new GridRows(api, 'rowNumbers width 60').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 row-number:"1" a:1 b:2
        `);
        const counts = countRefreshes(api);

        api.setGridOption('rowNumbers', { width: 90 });
        await asyncSetTimeout(20);
        await new GridColumns(api, 'rowNumbers width 90').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:90 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);

        // Single pass: rowNumbersSvc owns the refresh (columnModel no longer also refreshes on `rowNumbers`).
        expect(counts.displayed).toBe(1);
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)!.getActualWidth()).toBe(90);
    });

    test('toggling rowNumbers on then off adds/removes the column in a single refresh each', async () => {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
        });
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)).toBeNull();

        const counts = countRefreshes(api);
        api.setGridOption('rowNumbers', true);
        await asyncSetTimeout(20);
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)).not.toBeNull();
        expect(counts.displayed).toBe(1);
        await new GridColumns(api, 'rowNumbers toggled on').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);

        api.setGridOption('rowNumbers', false);
        await asyncSetTimeout(20);
        expect(api.getColumn(ROW_NUMBERS_COLUMN_ID)).toBeNull();
        // Exactly one displayed-cols refresh per toggle (2 total).
        expect(counts.displayed).toBe(2);
        expect(api.getAllGridColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        await new GridColumns(api, 'rowNumbers toggled off').checkColumns(`
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);
    });
});
