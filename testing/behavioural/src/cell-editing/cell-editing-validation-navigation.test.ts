import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    ScrollApiModule,
    TextEditorModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

interface PersonRow {
    athlete: string;
    age: number;
}

const columnDefs: ColDef<PersonRow>[] = [
    { field: 'athlete', cellEditor: 'agTextCellEditor', cellEditorParams: { maxLength: 10 } },
    { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
];

function makeRowData(): PersonRow[] {
    return [
        { athlete: 'Alice', age: 23 },
        { athlete: 'Bob', age: 40 },
        { athlete: 'Carol', age: 31 },
    ];
}

describe('Cell editing validation interacting with navigation', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [ClientSideRowModelModule, NumberEditorModule, ScrollApiModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement => {
        const gridElement = getGridElement(api)! as HTMLElement;
        return gridElement.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;
    };

    const editorCount = (api: GridApi): number => api.getCellEditorInstances().length;

    // --- singleCell block: Tab / Shift+Tab out of an invalid cell is prevented ---

    test('singleCell block: Tab from an invalid cell is blocked, editor stays, no commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-block-tab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell block: invalid age typed, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        expect(editorCount(api)).toBeGreaterThan(0);
        expect(cell(api, 0, 'age').querySelector('input')).toBeTruthy();
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'singleCell block: Tab blocked, age held invalid ❌, data still 23').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('singleCell block: Shift+Tab from an invalid cell is blocked, editor stays, no commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-block-shifttab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell block: invalid age typed, before Shift+Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Shift>}{Tab}{/Shift}');

        expect(editorCount(api)).toBeGreaterThan(0);
        expect(cell(api, 0, 'age').querySelector('input')).toBeTruthy();
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'block: Shift+Tab blocked, invalid value still held').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    // --- singleCell revert: Tab / Shift+Tab out of an invalid cell reverts ---

    test('singleCell revert: Tab from an invalid cell reverts and does not commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-revert-tab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'revert',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell revert: invalid age typed, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        // The invalid edit reverted: the source cell no longer holds an open editor and data is unchanged.
        expect(cell(api, 0, 'age').querySelector('input')).toBeFalsy();
        expect(rowData[0].age).toBe(23);

        // Source value restored on the reverted cell (no pending marker on age row 0).
        await new GridRows(api, 'singleCell revert: source value restored').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            ├── LEAF 🖍️ id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('singleCell revert: Shift+Tab from an invalid cell reverts and does not commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-revert-shifttab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'revert',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell revert: invalid age typed, before Shift+Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Shift>}{Tab}{/Shift}');

        expect(cell(api, 0, 'age').querySelector('input')).toBeFalsy();
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'revert: Shift+Tab discarded the invalid value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    // --- fullRow block: navigation blocked while a cell in the row is invalid ---

    test('fullRow block: Tab between cells within the row is blocked, editors stay, focus stays in row', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-fullRow-block-within', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // Full-row edit opens editors for every editable cell (athlete + age).
        await user.dblClick(cell(api, 0, 'athlete'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '999');

        // Move focus back to the (valid) athlete cell, then Tab towards the invalid age cell.
        const athleteInput = await waitForInput(gridElement, cell(api, 0, 'athlete'));
        athleteInput.focus();
        await new GridRows(api, 'fullRow block: invalid age typed, before Tab within the row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        const rowEl = gridElement.querySelector<HTMLElement>('[row-index="0"]')!;
        expect(editorCount(api)).toBe(2);
        expect(cell(api, 0, 'athlete').querySelector('input')).toBeTruthy();
        expect(rowEl.contains(document.activeElement)).toBe(true);
        // Moving within the row under edit is legitimate, so the caret hands over to the next editor.
        expect(document.activeElement).toBe(cell(api, 0, 'age').querySelector('input'));
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'fullRow block: whole row editing, age held invalid ❌, data still 23').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('fullRow block: Tab that would leave the last cell of the row is blocked', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-fullRow-block-leave', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // Open the row via the last editable cell (age) and make it invalid, then Tab forward.
        await user.dblClick(cell(api, 0, 'age'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'fullRow block: invalid age typed, before Tab off the row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        // Block guarantee: the row's editors stay open, no value commits, the next row is NOT
        // entered for editing, and focus stays pinned to the invalid row (it must not leak to the
        // next row's cell).
        const rowEl = gridElement.querySelector<HTMLElement>('[row-index="0"]')!;
        expect(editorCount(api)).toBe(2);
        expect(rowData[0].age).toBe(23);
        expect(cell(api, 1, 'athlete').querySelector('input')).toBeFalsy();
        expect(rowEl.contains(document.activeElement)).toBe(true);

        await new GridRows(api, 'fullRow block: Tab off last cell blocked, row 1 not entered, age ❌').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('singleCell block: Tab off the last column does not leak focus to the next row', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-block-leave', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // age is the last column; make it invalid, then Tab forward (would cross into the next row).
        await user.dblClick(cell(api, 0, 'age'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell block: invalid age typed, before Tab off the last column').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        const rowEl = gridElement.querySelector<HTMLElement>('[row-index="0"]')!;
        expect(cell(api, 0, 'age').querySelector('input')).toBeTruthy();
        expect(rowData[0].age).toBe(23);
        expect(cell(api, 1, 'athlete').querySelector('input')).toBeFalsy();
        expect(rowEl.contains(document.activeElement)).toBe(true);

        await new GridRows(api, 'block: Tab off the last column held the row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    // --- Arrow keys don't navigate (or commit) while an editor is open ---

    test('singleCell block: arrow keys while editing an invalid cell do not navigate or commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-block-arrows', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');

        await new GridRows(api, 'singleCell block: invalid age typed, before the arrow keys').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowRight}');

        // An open editor swallows arrow keys: no navigation happens, so the editor stays put and nothing commits.
        expect(editorCount(api)).toBeGreaterThan(0);
        expect(cell(api, 0, 'age').querySelector('input')).toBeTruthy();
        expect(cell(api, 1, 'age').querySelector('input')).toBeFalsy();
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'block: arrow keys neither navigated nor committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    // --- enterNavigatesVertically + invalid value in block mode ---

    test('singleCell block: enterNavigatesVertically + invalid value blocks the vertical move', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-block-enterVertical', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
            enterNavigatesVertically: true,
            enterNavigatesVerticallyAfterEdit: true,
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');
        await new GridRows(api, 'singleCell block: invalid age typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Enter}');

        // Enter on an invalid cell is blocked before any vertical navigation, so the editor stays here.
        expect(editorCount(api)).toBeGreaterThan(0);
        expect(cell(api, 0, 'age').querySelector('input')).toBeTruthy();
        expect(cell(api, 1, 'age').querySelector('input')).toBeFalsy();
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'block: the vertical move was blocked, nothing committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    // --- valid value + Tab commits / navigates ---

    test('singleCell: valid value + Tab commits and moves to the next cell', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-singleCell-valid-tab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '55');
        await new GridRows(api, 'singleCell: valid age typed, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        expect(rowData[0].age).toBe(55);
        // Editing moved off the original cell.
        expect(cell(api, 0, 'age').querySelector('input')).toBeFalsy();

        // Value committed to the row, no lingering pending marker.
        await new GridRows(api, 'singleCell: committed value on Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:55
            ├── LEAF 🖍️ id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('fullRow: valid value + Tab moves within the row and commits on stopEditing', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-fullRow-valid-tab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'athlete'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '55');

        const athleteInput = await waitForInput(gridElement, cell(api, 0, 'athlete'));
        athleteInput.focus();
        await new GridRows(api, 'fullRow: valid age typed, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        // Valid full-row edit: Tab is not blocked, the row keeps editing (both editors stay open).
        expect(editorCount(api)).toBe(2);
        expect(rowData[0].age).toBe(23);

        // Mid-edit: row 0 carries a pending (🖍️) age of 55, not yet committed to data.
        await new GridRows(api, 'fullRow: pending value mid-edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        // Committing the row persists the pending value.
        api.stopEditing();
        expect(editorCount(api)).toBe(0);
        expect(rowData[0].age).toBe(55);

        // Row committed: age persisted, no pending marker remaining.
        await new GridRows(api, 'fullRow: committed value after stopEditing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:55
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('fullRow + suppressStartEditOnTab: valid edit + Tab keeps the row editing without crashing', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('nav-fullRow-suppressStartEditOnTab', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            suppressStartEditOnTab: true,
        } satisfies GridOptions<PersonRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'athlete'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '55');

        const athleteInput = await waitForInput(gridElement, cell(api, 0, 'athlete'));
        athleteInput.focus();
        await new GridRows(api, 'fullRow: valid age typed, before Tab with suppressStartEditOnTab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        await user.keyboard('{Tab}');

        // Still a valid row edit in progress; committing persists the value.
        expect(editorCount(api)).toBe(2);

        await new GridRows(api, 'fullRow: Tab left the row editing, its value still pending').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);

        api.stopEditing();
        expect(editorCount(api)).toBe(0);
        expect(rowData[0].age).toBe(55);

        await new GridRows(api, 'fullRow: the pending value committed on stopEditing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:55
            ├── LEAF id:1 athlete:"Bob" age:40
            └── LEAF id:2 athlete:"Carol" age:31
        `);
    });

    test('fullRow block: blocked Tab pins focus to the FIRST invalid cell, not the tabbed-from cell', async () => {
        const twoNumberCols: ColDef[] = [
            { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
            { field: 'score', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 10 } },
        ];
        const rowData = [
            { age: 23, score: 5 },
            { age: 40, score: 7 },
        ];
        const api = await gridsManager.createGridAndWait('nav-fullRow-first-invalid', {
            columnDefs: twoNumberCols,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // Make the FIRST column (age) invalid; leave the last column (score) valid.
        await user.dblClick(cell(api, 0, 'age'));
        const ageInput = await waitForInput(gridElement, cell(api, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '999');

        // Focus the valid last cell (score) and Tab off it — navigation is blocked by age.
        const scoreInput = await waitForInput(gridElement, cell(api, 0, 'score'));
        scoreInput.focus();
        await new GridRows(api, 'fullRow block: age invalid and score valid, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 age:23❌ score:5
            └── LEAF id:1 age:40 score:7
        `);

        await user.keyboard('{Tab}');

        // Focus is pinned to the first invalid cell (age), not the tabbed-from cell (score).
        expect(cell(api, 0, 'age').contains(document.activeElement)).toBe(true);
        expect(cell(api, 0, 'score').contains(document.activeElement)).toBe(false);
        // The caret lands in the invalid cell's editor input, ready for correction — not the cell shell.
        expect(document.activeElement).toBe(cell(api, 0, 'age').querySelector('input'));
        expect(rowData[0].age).toBe(23);
        expect(rowData[0].score).toBe(5);

        await new GridRows(api, 'fullRow block: only age is ❌, score stays valid, neither committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 age:23❌ score:5
            └── LEAF id:1 age:40 score:7
        `);
    });

    test('fullRow block: blocked Tab pins focus to the first invalid cell in a wide, horizontally-scrolled grid', async () => {
        const wideCols: ColDef[] = Array.from({ length: 15 }, (_, i) => ({
            field: `c${i}`,
            width: 200,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: { min: 0, max: 100 },
        }));
        const rowData = [
            Object.fromEntries(wideCols.map((_, i) => [`c${i}`, i])),
            Object.fromEntries(wideCols.map((_, i) => [`c${i}`, i + 1])),
        ];
        const api = await gridsManager.createGridAndWait('nav-fullRow-block-wide-invalid', {
            columnDefs: wideCols,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // Open the row and make the FIRST column (c0) invalid.
        await user.dblClick(cell(api, 0, 'c0'));
        const firstInput = await waitForInput(gridElement, cell(api, 0, 'c0'));
        await user.clear(firstInput);
        await user.type(firstInput, '999');

        // Scroll the far end into view; c0 is now well outside the horizontal viewport.
        await new GridRows(api, 'fullRow block wide: c0 invalid, before scrolling it out of view').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 c0:0❌ c1:1 c2:2 c3:3 c4:4 c5:5 c6:6 c7:7 c8:8 c9:9 c10:10 c11:11 c12:12 c13:13 c14:14
            └── LEAF id:1 c0:1 c1:2 c2:3 c3:4 c4:5 c5:6 c6:7 c7:8 c8:9 c9:10 c10:11 c11:12 c12:13 c13:14 c14:15
        `);

        api.ensureColumnVisible('c14');
        await asyncSetTimeout(0);

        // Focus the last (valid, visible) cell's editor and Tab forward — block mode must pin focus
        // to the first invalid cell (c0), not leak to row 1 nor stay on the tabbed-from cell.
        const lastInput = await waitForInput(gridElement, cell(api, 0, 'c14'));
        lastInput.focus();
        await new GridRows(api, 'fullRow block wide: scrolled to c14, before Tab').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 c0:0❌ c1:1 c2:2 c3:3 c4:4 c5:5 c6:6 c7:7 c8:8 c9:9 c10:10 c11:11 c12:12 c13:13 c14:14
            └── LEAF id:1 c0:1 c1:2 c2:3 c3:4 c4:5 c5:6 c6:7 c7:8 c8:9 c9:10 c10:11 c11:12 c12:13 c13:14 c14:15
        `);

        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Focus pinned to the first invalid cell (c0), scrolled back into view; nothing committed,
        // and the next row was not entered.
        expect(cell(api, 0, 'c0').contains(document.activeElement)).toBe(true);
        expect(rowData[0].c0).toBe(0);
        expect(cell(api, 1, 'c0')?.querySelector('input')).toBeFalsy();

        await new GridRows(api, 'fullRow block: c0 still invalid, the whole row uncommitted').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 c0:0❌ c1:1 c2:2 c3:3 c4:4 c5:5 c6:6 c7:7 c8:8 c9:9 c10:10 c11:11 c12:12 c13:13 c14:14
            └── LEAF id:1 c0:1 c1:2 c2:3 c3:4 c4:5 c5:6 c6:7 c7:8 c8:9 c9:10 c10:11 c11:12 c12:13 c13:14 c14:15
        `);
    });
});
