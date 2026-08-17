import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, waitForInput } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
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
    ];
}

describe('Cell editing validation modes', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [ClientSideRowModelModule, NumberEditorModule, TextEditorModule],
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

    describe.each(['singleCell', 'fullRow'] as const)('editType: %s', (editType) => {
        const create = async (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`validation-${editType}-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType,
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: invalid value + Enter keeps editor(s) open and does not commit', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(ageCell.querySelector('input')).toBeTruthy();
            expect(rowData[0].age).toBe(23);
        });

        test('block: valid value + Enter commits and closes editor(s)', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(55);
        });

        test('block: invalid value + api.stopEditing keeps editor(s) open and does not commit', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            api.stopEditing();

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);
        });

        test('block: invalid value + Escape reverts and closes editor(s)', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Escape}');
            // Escape stop is scheduled async in cellKeyboardListenerFeature.
            await new Promise((r) => setTimeout(r));

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);
        });

        test('revert: invalid value + Enter reverts and closes editor(s)', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);
        });

        test('revert: valid value + Enter commits and closes editor(s)', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(55);
        });

        test('block: a blocked value can be corrected in place and then committed', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();
            const gridElement = getGridElement(api)! as HTMLElement;

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            let ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}');

            // blocked: still editing, nothing committed
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            // correct the value in the still-open editor and commit
            ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(55);
        });

        test('block: a blocked commit does not fire cellValueChanged; a later valid commit does', async () => {
            const rowData = makeRowData();
            const onCellValueChanged = vi.fn();
            const api = await gridsManager.createGridAndWait(`validation-${editType}-events`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType,
                invalidEditValueMode: 'block',
                onCellValueChanged,
            } satisfies GridOptions<PersonRow>);
            const user = userEvent.setup();
            const gridElement = getGridElement(api)! as HTMLElement;

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            let ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}');

            expect(onCellValueChanged).not.toHaveBeenCalled();

            ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}');

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith(expect.objectContaining({ oldValue: 23, newValue: 55 }));
        });

        test('api.stopEditing(true) cancels the edit and reverts, regardless of mode', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(getGridElement(api)! as HTMLElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            api.stopEditing(true);

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);
        });
    });

    // Full-row editing opens every editable cell in the row at once, so a stop request may
    // carry a rowNode with no specific column. These cases guard that cell-level validation
    // is still honoured on that path.
    describe('fullRow with a cell invalid in a non-focused column', () => {
        const create = async (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`validation-fullrow-other-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'fullRow',
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: invalid age while focus is on athlete keeps editors open on stopEditing', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            // Open the whole row via the age cell, type an invalid value there.
            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');

            // Move focus to the (valid) athlete cell within the same row, then stop.
            const athleteInput = await waitForInput(gridElement, cell(api, 0, 'athlete'));
            athleteInput.focus();
            api.stopEditing();

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'fullRow block: invalid age in a non-focused column still holds the row ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('fullRow with row-level validation (getFullRowEditValidationErrors)', () => {
        const create = async (invalidEditValueMode: 'revert' | 'block') =>
            gridsManager.createGridAndWait(`validation-fullrow-rowlevel-${invalidEditValueMode}`, {
                columnDefs,
                rowData: makeRowData(),
                defaultColDef: { editable: true },
                editType: 'fullRow',
                invalidEditValueMode,
                // Row is invalid when the athlete name is "Invalid" (7 chars, so no cell-level error).
                getFullRowEditValidationErrors: ({ editorsState }) => {
                    const athlete = editorsState.find((e) => e.colId === 'athlete')?.newValue;
                    return athlete === 'Invalid' ? ['Row is invalid'] : null;
                },
            } satisfies GridOptions<PersonRow>);

        test('block: row-level error + Enter keeps editors open', async () => {
            const api = await create('block');
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'Invalid');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBeGreaterThan(0);

            // Row-level error: the "Invalid" name is staged (🖍️) but held; row-level rules mark no
            // single cell, so there is no ❌ — unlike a cell-level error.
            await new GridRows(api, 'fullRow block: row-level error holds the staged name, no cell ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 athlete:🖍️"Invalid" "Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: row-level error + api.stopEditing keeps editors open', async () => {
            const api = await create('block');
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'Invalid');
            api.stopEditing();

            expect(editorCount(api)).toBeGreaterThan(0);

            // Row-level error holds the row open on stopEditing too (staged 🖍️, no single-cell ❌).
            await new GridRows(api, 'fullRow block: row-level error holds row open on stopEditing').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 athlete:🖍️"Invalid" "Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: row-level error + Enter closes editors and reverts', async () => {
            const api = await create('revert');
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'Invalid');
            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(athleteCell).toHaveTextContent('Alice');

            // Revert closes the whole row and restores source values — no pending/invalid markers.
            await new GridRows(api, 'fullRow revert: row-level error reverted, row restored').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('fullRow with multiple invalid cells', () => {
        const twoNumberCols: ColDef[] = [
            { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
            { field: 'score', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 10 } },
        ];

        test('block: two invalid cells keep the whole row open and commit neither', async () => {
            const rowData = [{ age: 23, score: 5 }];
            const api = await gridsManager.createGridAndWait('validation-fullrow-multi', {
                columnDefs: twoNumberCols,
                rowData,
                defaultColDef: { editable: true },
                editType: 'fullRow',
                invalidEditValueMode: 'block',
            });
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');

            const scoreInput = await waitForInput(gridElement, cell(api, 0, 'score'));
            await user.clear(scoreInput);
            await user.type(scoreInput, '888');

            api.stopEditing();

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);
            expect(rowData[0].score).toBe(5);

            await new GridRows(api, 'fullRow block: both age and score flagged ❌, neither committed').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ ❌ id:0 age:23❌ score:5❌
            `);
        });
    });

    // GridRows snapshots verify the rendered/pending row state (🖍️ markers, committed vs source
    // values). editType renders differently, so these live outside the parametrised block.
    describe('grid state snapshots', () => {
        test('singleCell block: an invalid value that is corrected commits cleanly (no stale pending state)', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('validation-snap-single', {
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
            let ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}'); // blocked

            // blocked: cell actively editing (🖍️) and flagged invalid (❌); model keeps source value
            await new GridRows(api, 'singleCell block: invalid value held, cell flagged').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}'); // corrected, commits

            // editor closed, value committed, no lingering pending (🖍️) or invalid (❌) marker
            await new GridRows(api, 'singleCell block: corrected value committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('fullRow block: correcting the invalid cell commits the whole row cleanly', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('validation-snap-fullrow', {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'fullRow',
                invalidEditValueMode: 'block',
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            let ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');
            await user.keyboard('{Enter}'); // blocked, row stays open

            expect(editorCount(api)).toBeGreaterThan(0);

            // whole row actively editing (🖍️), the invalid cell flagged (❌)
            await new GridRows(api, 'fullRow block: invalid cell holds the row open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            await user.keyboard('{Enter}'); // corrected, row commits

            await new GridRows(api, 'fullRow block: corrected row committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: invalid value discarded, source value restored', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('validation-snap-revert', {
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
            await user.keyboard('{Enter}');

            await new GridRows(api, 'revert: source value restored').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });
});
