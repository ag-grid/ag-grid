import { getByTestId, waitFor } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import {
    ClientSideRowModelModule,
    CustomEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridApi, GridReadyEvent, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import {
    asyncSetTimeout,
    ignoreConsoleLicenseKeyError,
    initPointerEventPolyfill,
    mockGridLayout,
    waitForPopup,
} from '../test-utils';

// Custom editor that records cellStartedEdit and afterGuiAttached calls
const editorLog: {
    cellStartedEdit: boolean;
    afterGuiAttachedCalled: boolean;
    focusInCalled: boolean;
    column?: string;
    rowIndex?: number;
}[] = [];

class TrackingEditor implements ICellEditorComp {
    private gui: HTMLDivElement;
    private value: any;
    private entry: (typeof editorLog)[0];

    constructor() {
        this.gui = document.createElement('div');
        this.gui.className = 'tracking-editor';
        this.gui.tabIndex = -1;
        this.entry = { cellStartedEdit: false, afterGuiAttachedCalled: false, focusInCalled: false };
        editorLog.push(this.entry);
    }

    init(params: ICellEditorParams): void {
        this.entry.cellStartedEdit = params.cellStartedEdit;
        this.entry.column = params.column?.getColId();
        this.entry.rowIndex = params.node?.rowIndex ?? undefined;
        this.value = params.value;
        this.gui.textContent = String(this.value ?? '');
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    getValue(): any {
        return this.value;
    }

    afterGuiAttached(): void {
        this.entry.afterGuiAttachedCalled = true;
        this.gui.focus();
    }

    focusIn(): void {
        this.entry.focusInCalled = true;
        this.gui.focus();
    }
}

// Popup version (isPopup = true)
class TrackingPopupEditor extends TrackingEditor {
    isPopup(): boolean {
        return true;
    }
}

/** Helper to render AgGridReact and wait for gridReady */
async function renderGrid(props: {
    rowData: any[];
    columnDefs: any[];
    modules: any[];
    width?: number;
    height?: number;
    defaultColDef?: any;
    editType?: 'fullRow';
}): Promise<{ api: GridApi; gridDiv: HTMLElement; user: ReturnType<typeof userEvent.setup> }> {
    let readyResolve!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        readyResolve = resolve;
    });

    render(
        <div style={{ width: props.width ?? 800, height: props.height ?? 400 }}>
            <AgGridReact
                rowData={props.rowData}
                columnDefs={props.columnDefs}
                getRowId={(params) => params.data.id}
                modules={[ValidationModule, ...props.modules]}
                defaultColDef={props.defaultColDef}
                editType={props.editType}
                onGridReady={(params: GridReadyEvent) => readyResolve(params.api)}
            />
        </div>
    );

    const api = await readyPromise;
    const gridDiv = getGridElement(api)! as HTMLElement;
    const user = userEvent.setup({ skipHover: true });
    await asyncSetTimeout(0);

    return { api, gridDiv, user };
}

describe('Cell Editing: tab into editor in React', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ignoreConsoleLicenseKeyError();
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    beforeEach(() => {
        editorLog.length = 0;
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // Bug 2: RichSelect cellStartedEdit regression — tabbing to next row (single column)
    test('cellStartedEdit is true when tabbing to next row in React (single column)', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', val: 'A' },
                { id: '1', val: 'B' },
                { id: '2', val: 'C' },
            ],
            columnDefs: [{ field: 'val', editable: true, cellEditor: TrackingEditor }],
            modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
        });

        // Double-click first cell to start editing
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'val'));
        await user.dblClick(cell0);

        await waitFor(() => {
            expect(editorLog).toHaveLength(1);
        });
        expect(editorLog[0].cellStartedEdit).toBe(true);

        // Tab to next row (single column → moves to row 1)
        await user.keyboard('{Tab}');

        await waitFor(() => {
            expect(editorLog.length).toBeGreaterThanOrEqual(2);
        });

        expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);
    });

    // Bug 3: Multi-column tabbing (same row) in both directions
    test('cellStartedEdit is true when tabbing across columns in React (same row)', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', a: 'A1', b: 'B1', c: 'C1' },
                { id: '1', a: 'A2', b: 'B2', c: 'C2' },
            ],
            columnDefs: [
                { field: 'a', editable: true, cellEditor: TrackingEditor },
                { field: 'b', editable: true, cellEditor: TrackingEditor },
                { field: 'c', editable: true, cellEditor: TrackingEditor },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
        });

        // Double-click first cell to start editing col 'a'
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await user.dblClick(cellA);

        await waitFor(() => {
            expect(editorLog).toHaveLength(1);
        });
        expect(editorLog[0].cellStartedEdit).toBe(true);

        // Tab forward → col 'b'
        await user.keyboard('{Tab}');

        await waitFor(() => {
            expect(editorLog.length).toBeGreaterThanOrEqual(2);
        });
        expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);

        // Tab forward → col 'c'
        await user.keyboard('{Tab}');

        await waitFor(() => {
            expect(editorLog.length).toBeGreaterThanOrEqual(3);
        });
        expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);

        // Shift+Tab backward → col 'b'
        await user.keyboard('{Shift>}{Tab}{/Shift}');

        await waitFor(() => {
            expect(editorLog.length).toBeGreaterThanOrEqual(4);
        });
        expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);
    });

    // Bug 3 extended: Multi-column tabbing across rows (tab far enough to change rows)
    test('cellStartedEdit is true when tabbing across columns and rows in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', a: 'A1', b: 'B1', c: 'C1' },
                { id: '1', a: 'A2', b: 'B2', c: 'C2' },
                { id: '2', a: 'A3', b: 'B3', c: 'C3' },
            ],
            columnDefs: [
                { field: 'a', editable: true, cellEditor: TrackingEditor },
                { field: 'b', editable: true, cellEditor: TrackingEditor },
                { field: 'c', editable: true, cellEditor: TrackingEditor },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
        });

        // Double-click cell (0, 'a') to start editing
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await user.dblClick(cellA);

        await waitFor(() => {
            expect(editorLog).toHaveLength(1);
        });
        expect(editorLog[0].cellStartedEdit).toBe(true);

        // Tab forward through: a→b, b→c, c→(next row a), a→b, b→c
        // This crosses from row 0 to row 1
        for (let i = 0; i < 5; i++) {
            await user.keyboard('{Tab}');

            await waitFor(() => {
                expect(editorLog.length).toBeGreaterThanOrEqual(i + 2);
            });
            expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);
        }

        // Now Shift+Tab backward through: c←b, b←a, a←(prev row c), c←b
        // This crosses back from row 1 to row 0
        for (let i = 0; i < 4; i++) {
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            await waitFor(() => {
                expect(editorLog.length).toBeGreaterThanOrEqual(i + 7);
            });
            expect(editorLog[editorLog.length - 1].cellStartedEdit).toBe(true);
        }
    });

    // Bug 1: Popup editor focus after tab (LargeText-like popup editor)
    test('popup editor receives afterGuiAttached and focus when tabbing in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', val: 'A' },
                { id: '1', val: 'B' },
                { id: '2', val: 'C' },
            ],
            columnDefs: [{ field: 'val', editable: true, cellEditor: TrackingPopupEditor }],
            modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
        });

        // Double-click first cell to start editing
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'val'));
        await user.dblClick(cell0);

        await waitFor(() => {
            expect(editorLog).toHaveLength(1);
            expect(editorLog[0].afterGuiAttachedCalled).toBe(true);
        });
        expect(editorLog[0].cellStartedEdit).toBe(true);

        // Tab to next row
        await user.keyboard('{Tab}');

        await waitFor(() => {
            expect(editorLog.length).toBeGreaterThanOrEqual(2);
            expect(editorLog[editorLog.length - 1].afterGuiAttachedCalled).toBe(true);
        });

        const secondEditor = editorLog[editorLog.length - 1];
        expect(secondEditor.cellStartedEdit).toBe(true);
    });

    // Bug 1 extended: LargeTextCellEditor popup focus after tab
    test('agLargeTextCellEditor popup receives focus when tabbing in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', description: 'Lorem ipsum dolor sit amet' },
                { id: '1', description: 'Consectetur adipiscing elit' },
                { id: '2', description: 'Sed do eiusmod tempor' },
            ],
            columnDefs: [
                {
                    field: 'description',
                    cellEditor: 'agLargeTextCellEditor',
                    cellEditorPopup: true,
                    editable: true,
                },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, LargeTextEditorModule],
        });

        // Double-click first cell to start editing
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'description'));
        await user.dblClick(cell0);

        // Verify popup exists for first editor
        const popup0 = await waitForPopup(gridDiv);
        expect(popup0).toBeTruthy();

        const textarea0 = popup0.querySelector('textarea');
        expect(textarea0).toBeTruthy();

        // Tab to next row
        await user.keyboard('{Tab}');

        // Verify popup exists for second editor and textarea has focus
        const popup1 = await waitForPopup(gridDiv);
        expect(popup1).toBeTruthy();

        const textarea1 = popup1.querySelector('textarea');
        expect(textarea1).toBeTruthy();
    });

    // Bug 2: RichSelect with sync values — tabbing opens the values popup
    test('agRichSelectCellEditor with sync values shows picker when tabbing in React', async () => {
        const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German'];

        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', language: 'English' },
                { id: '1', language: 'Spanish' },
                { id: '2', language: 'French' },
            ],
            columnDefs: [
                {
                    field: 'language',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: languages },
                    editable: true,
                },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, RichSelectModule],
        });

        // Double-click first cell to start editing
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'language'));
        await user.dblClick(cell0);

        // Verify the RichSelect popup/picker opened (aria-expanded)
        await waitFor(() => {
            const expanded = gridDiv.querySelector('.ag-picker-expanded');
            expect(expanded).toBeTruthy();
        });

        // Tab to next row
        await user.keyboard('{Tab}');

        // Verify the new RichSelect picker opened on the next cell
        await waitFor(() => {
            const expanded = gridDiv.querySelector('.ag-picker-expanded');
            expect(expanded).toBeTruthy();
        });
    });

    // Bug 2: RichSelect with async values — tabbing shows "loading" popup
    test('agRichSelectCellEditor with async values shows picker when tabbing in React', async () => {
        const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German'];
        const getValuesAsync = () => new Promise<string[]>((resolve) => setTimeout(() => resolve(languages), 3000));

        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', language: 'English' },
                { id: '1', language: 'Spanish' },
                { id: '2', language: 'French' },
            ],
            columnDefs: [
                {
                    field: 'language',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: getValuesAsync },
                    editable: true,
                },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, RichSelectModule],
        });

        // Double-click first cell to start editing
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'language'));
        await user.dblClick(cell0);

        // Verify the RichSelect popup/picker opened (even with async values loading)
        await waitFor(() => {
            const expanded = gridDiv.querySelector('.ag-picker-expanded');
            expect(expanded).toBeTruthy();
        });

        // Tab to next row before values have loaded
        await user.keyboard('{Tab}');

        // Verify the new RichSelect picker opened on the next cell (showing "loading" state)
        await waitFor(() => {
            const expanded = gridDiv.querySelector('.ag-picker-expanded');
            expect(expanded).toBeTruthy();
        });
    });

    // Bug 3: RichSelect multi-column tabbing in both directions
    test('agRichSelectCellEditor multi-column tabbing shows picker in both directions in React', async () => {
        const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German'];

        const richSelectCol = (field: string) => ({
            field,
            cellEditor: 'agRichSelectCellEditor' as const,
            cellEditorParams: { values: languages },
            editable: true,
        });

        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', a: 'English', b: 'Spanish', c: 'French' },
                { id: '1', a: 'German', b: 'English', c: 'Spanish' },
                { id: '2', a: 'French', b: 'German', c: 'English' },
            ],
            columnDefs: [richSelectCol('a'), richSelectCol('b'), richSelectCol('c')],
            modules: [ClientSideRowModelModule, TextEditorModule, RichSelectModule],
        });

        // Double-click first cell to start editing col 'a' row 0
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await user.dblClick(cellA);

        // Verify picker opened
        await waitFor(() => {
            const expanded = gridDiv.querySelector('.ag-picker-expanded');
            expect(expanded).toBeTruthy();
        });

        // Tab forward through: a→b, b→c, c→(next row a) — crosses row boundary
        for (let i = 0; i < 3; i++) {
            await user.keyboard('{Tab}');

            await waitFor(() => {
                const expanded = gridDiv.querySelector('.ag-picker-expanded');
                expect(expanded).toBeTruthy();
            });
        }

        // Shift+Tab backward through: a→(prev row c), c→b — crosses row boundary back
        for (let i = 0; i < 2; i++) {
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            await waitFor(() => {
                const expanded = gridDiv.querySelector('.ag-picker-expanded');
                expect(expanded).toBeTruthy();
            });
        }
    });

    // agTextCellEditor: tabbing across rows preserves editing and focus
    test('agTextCellEditor maintains editing when tabbing across rows in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', a: 'A1', b: 'B1' },
                { id: '1', a: 'A2', b: 'B2' },
            ],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule],
        });

        // Double-click first cell to start editing with default text editor
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await user.dblClick(cellA);

        await waitFor(() => {
            const input = gridDiv.querySelector('.ag-cell-edit-wrapper input');
            expect(input).toBeTruthy();
        });

        // Tab through a→b, b→(next row a) — crosses row boundary
        await user.keyboard('{Tab}');
        await user.keyboard('{Tab}');

        // Verify editing is active on row 1
        await waitFor(() => {
            const cell = getByTestId(gridDiv, agTestIdFor.cell('1', 'a'));
            expect(cell.querySelector('.ag-cell-edit-wrapper input')).toBeTruthy();
        });
    });

    // agNumberCellEditor: tabbing across rows preserves editing and focus
    test('agNumberCellEditor maintains editing when tabbing across rows in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', price: 10, qty: 5 },
                { id: '1', price: 20, qty: 3 },
            ],
            columnDefs: [
                { field: 'price', editable: true, cellEditor: 'agNumberCellEditor' },
                { field: 'qty', editable: true, cellEditor: 'agNumberCellEditor' },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule, NumberEditorModule],
        });

        // Double-click first cell to start editing
        const cellPrice = getByTestId(gridDiv, agTestIdFor.cell('0', 'price'));
        await user.dblClick(cellPrice);

        await waitFor(() => {
            const input = gridDiv.querySelector('.ag-cell-edit-wrapper input[type="number"]');
            expect(input).toBeTruthy();
        });

        // Tab through price→qty, qty→(next row price) — crosses row boundary
        await user.keyboard('{Tab}');
        await user.keyboard('{Tab}');

        // Verify number editor is active on row 1
        await waitFor(() => {
            const cell = getByTestId(gridDiv, agTestIdFor.cell('1', 'price'));
            expect(cell.querySelector('.ag-cell-edit-wrapper input[type="number"]')).toBeTruthy();
        });
    });

    // agTextCellEditor: Shift+Tab backward across rows
    test('agTextCellEditor maintains editing when Shift+Tab across rows in React', async () => {
        const { gridDiv, user } = await renderGrid({
            rowData: [
                { id: '0', a: 'A1', b: 'B1' },
                { id: '1', a: 'A2', b: 'B2' },
            ],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            modules: [ClientSideRowModelModule, TextEditorModule],
        });

        // Double-click cell (1, 'a') to start editing on row 1
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'a'));
        await user.dblClick(cellA1);

        await waitFor(() => {
            const input = gridDiv.querySelector('.ag-cell-edit-wrapper input');
            expect(input).toBeTruthy();
        });

        // Shift+Tab backward: a→(prev row b) — crosses row boundary back
        await user.keyboard('{Shift>}{Tab}{/Shift}');

        // Verify editing is active on row 0 col b
        await waitFor(() => {
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
            expect(cell.querySelector('.ag-cell-edit-wrapper input')).toBeTruthy();
        });
    });

    describe('editType: fullRow', () => {
        // fullRow: cellStartedEdit is true for the focused cell on initial dblClick
        test('fullRow: cellStartedEdit is true for the focused cell on initial edit', async () => {
            const { gridDiv, user } = await renderGrid({
                rowData: [
                    { id: '0', a: 'A1', b: 'B1', c: 'C1' },
                    { id: '1', a: 'A2', b: 'B2', c: 'C2' },
                ],
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: TrackingEditor },
                    { field: 'b', editable: true, cellEditor: TrackingEditor },
                    { field: 'c', editable: true, cellEditor: TrackingEditor },
                ],
                modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
                editType: 'fullRow',
            });

            // Double-click first cell to start full-row editing
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await user.dblClick(cellA);

            // In fullRow mode, editors are created for the row (async in React).
            // The focused cell (col 'a') should have cellStartedEdit=true
            await waitFor(() => {
                expect(editorLog.length).toBeGreaterThanOrEqual(1);
                expect(editorLog.some((e) => e.cellStartedEdit)).toBe(true);
            });
        });

        // fullRow: tabbing across rows creates editors for the new row
        test('fullRow: editors are created when tabbing to next row', async () => {
            const { gridDiv, user } = await renderGrid({
                rowData: [
                    { id: '0', a: 'A1', b: 'B1', c: 'C1' },
                    { id: '1', a: 'A2', b: 'B2', c: 'C2' },
                ],
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: TrackingEditor },
                    { field: 'b', editable: true, cellEditor: TrackingEditor },
                    { field: 'c', editable: true, cellEditor: TrackingEditor },
                ],
                modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
                editType: 'fullRow',
            });

            // Double-click first cell to start full-row editing
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await user.dblClick(cellA);

            await waitFor(() => {
                expect(editorLog.length).toBeGreaterThanOrEqual(1);
            });

            // Tab through a→b, b→c, c→(next row a) — crosses row boundary
            await user.keyboard('{Tab}');
            await user.keyboard('{Tab}');
            await user.keyboard('{Tab}');

            // New editors should be created for row 1
            await waitFor(() => {
                expect(editorLog.filter((e) => e.rowIndex === 1).length).toBeGreaterThanOrEqual(1);
            });
        });

        // fullRow: cellStartedEdit is true for the focused cell when tabbing across rows
        test('fullRow: cellStartedEdit is true for the focused cell when tabbing to next row', async () => {
            const { gridDiv, user } = await renderGrid({
                rowData: [
                    { id: '0', a: 'A1', b: 'B1', c: 'C1' },
                    { id: '1', a: 'A2', b: 'B2', c: 'C2' },
                ],
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: TrackingEditor },
                    { field: 'b', editable: true, cellEditor: TrackingEditor },
                    { field: 'c', editable: true, cellEditor: TrackingEditor },
                ],
                modules: [ClientSideRowModelModule, TextEditorModule, CustomEditorModule],
                editType: 'fullRow',
            });

            // Double-click first cell to start full-row editing
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await user.dblClick(cellA);

            await waitFor(() => {
                expect(editorLog.length).toBeGreaterThanOrEqual(1);
            });

            // Tab through a→b, b→c, c→(next row a) — crosses row boundary
            await user.keyboard('{Tab}');
            await user.keyboard('{Tab}');
            await user.keyboard('{Tab}');

            // Wait for row 1 editors to be created (React async rendering)
            await waitFor(() => {
                expect(editorLog.filter((e) => e.rowIndex === 1).length).toBeGreaterThanOrEqual(1);
            });

            // The focused cell (col 'a') on row 1 should have cellStartedEdit=true
            const row1FocusedEditor = editorLog.find((e) => e.rowIndex === 1 && e.column === 'a');
            expect(row1FocusedEditor).toBeDefined();
            expect(row1FocusedEditor!.cellStartedEdit).toBe(true);

            // Non-focused cells on row 1 should have cellStartedEdit=false
            const row1NonFocused = editorLog.filter((e) => e.rowIndex === 1 && e.column !== 'a');
            for (const editor of row1NonFocused) {
                expect(editor.cellStartedEdit).toBe(false);
            }
        });

        // fullRow: RichSelect picker opens when tabbing across rows
        test('fullRow: agRichSelectCellEditor opens picker when tabbing to next row', async () => {
            const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German'];

            const { gridDiv, user } = await renderGrid({
                rowData: [
                    { id: '0', a: 'English', b: 'Spanish', c: 'French' },
                    { id: '1', a: 'German', b: 'English', c: 'Spanish' },
                ],
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: languages },
                        editable: true,
                    },
                    {
                        field: 'b',
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: languages },
                        editable: true,
                    },
                    {
                        field: 'c',
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: languages },
                        editable: true,
                    },
                ],
                modules: [ClientSideRowModelModule, TextEditorModule, RichSelectModule],
                editType: 'fullRow',
            });

            // Double-click first cell to start full-row editing
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await user.dblClick(cellA);

            // Verify RichSelect picker opened for focused cell
            await waitFor(() => {
                const expanded = gridDiv.querySelector('.ag-picker-expanded');
                expect(expanded).toBeTruthy();
            });

            // Tab through a→b, b→c, c→(next row a) — crosses row boundary
            for (let i = 0; i < 3; i++) {
                await user.keyboard('{Tab}');
            }

            // After crossing to row 1, picker should still open for the focused cell
            await waitFor(() => {
                const expanded = gridDiv.querySelector('.ag-picker-expanded');
                expect(expanded).toBeTruthy();
            });
        });
    });
});
