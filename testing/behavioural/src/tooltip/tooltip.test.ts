/* eslint-disable no-restricted-syntax -- AG-18026 file-level exemption, ruled by the owner rather than
   swept site-by-site. Nearly every delay here is a genuine timer window the grid owns: the tooltip is
   shown and hidden on `tooltipShowDelay`/`tooltipHideDelay` timers (200ms/300ms in these tests), so the
   waits are the observation window for "the tooltip has/has not appeared yet" and are not guesses.
   Polling with `waitFor` cannot express the "not yet shown" half of that, and would make ~90 sites
   unfalsifiable. Do NOT convert this file. New tests added here must still justify their own delays. */
import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    RenderApiModule,
    TextEditorModule,
    TooltipModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type {
    CellRendererSelectorResult,
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    ITooltipComp,
    ITooltipParams,
    Module,
} from 'ag-grid-community';
import { BatchEditModule, FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, mockGridLayout } from '../test-utils';

describe('Tooltips', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, FormulaModule, RenderApiModule, TextEditorModule, BatchEditModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });
    /** Texts of tooltips that are on screen and not fading out. */
    const visibleTooltipTexts = () =>
        getTooltips()
            .filter((tooltip) => !tooltip.classList.contains('ag-tooltip-hiding'))
            .map((tooltip) => tooltip.textContent ?? '');
    const hasTooltipText = (text: string) => getTooltips().some((tooltip) => tooltip.textContent?.includes(text));

    test('shows tooltip when configured', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipValueGetter: () => 'Base tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-base', gridOptions);
        await new GridColumns(api, `shows tooltip when configured setup`).checkColumns(`
            CENTER
            └── A width:200
        `);
        await new GridRows(api, `shows tooltip when configured setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Base tooltip');
        await new GridRows(api, `shows tooltip when configured final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
    });

    test('AG-17120 tooltipField cell tooltip reflects the pending value during a batch edit', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', editable: true, tooltipField: 'A' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-batch-edit-field', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        // before any edit, the tooltip reflects the original cell value
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('value');

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('edited{Enter}');
        await asyncSetTimeout(1);

        // editor is closed, the edit stays pending in the batch
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // tooltip is a display feature, so it surfaces the pending batch value like cell rendering and copy
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('edited');

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // once committed, the tooltip reflects the saved value
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('edited');
        await new GridRows(api, `AG-17120 tooltipField batch edit committed final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"edited"
        `);
    });

    test('AG-17120 tooltipField pointing at another column reflects that column pending batch value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', tooltipField: 'B' },
                { field: 'B', editable: true },
            ],
            rowData: [{ A: 'a-value', B: 'b-value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-batch-edit-foreign', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));
        const cellB = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'B')));

        // A's tooltip reads field B, initially the committed value
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-value');

        await userEvent.unhover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        // edit column B, leaving a pending batch value on B
        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);
        await userEvent.keyboard('b-edited{Enter}');
        await asyncSetTimeout(1);
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // hovering A surfaces B's pending value, matching how copy resolves foreign fields
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-edited');

        await userEvent.unhover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-edited');
        await new GridRows(api, `AG-17120 tooltipField foreign column committed final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"a-value" B:"b-edited"
        `);
    });

    test('AG-17120 tooltipField reads the data field, not a matching column value getter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', tooltipField: 'B' },
                { field: 'B', valueGetter: (params) => `${params.data.B}-computed` },
            ],
            rowData: [{ A: 'a-value', B: 'b-value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-field-value-getter', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        // tooltipField is a data-field lookup: A's tooltip is data.B, never column B's computed value
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-value');
        expect(hasTooltipText('computed')).toBe(false);
    });

    test('AG-17120 tooltipField reads the pending data value, not a matching column value getter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', tooltipField: 'B' },
                { field: 'B', editable: true, valueGetter: (params) => `${params.data.B}-computed` },
            ],
            rowData: [{ A: 'a-value', B: 'b-value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-field-pending-value-getter', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));
        const cellB = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'B')));

        // baseline: A's tooltip is data.B, never column B's computed value
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-value');
        expect(hasTooltipText('computed')).toBe(false);

        await userEvent.unhover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        // edit column B, leaving a pending batch value on B
        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);
        await userEvent.keyboard('b-edited{Enter}');
        await asyncSetTimeout(1);
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // A's tooltip surfaces B's pending data value, not the valueGetter's computed output
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('b-edited');
        expect(hasTooltipText('computed')).toBe(false);
    });

    test('AG-17120 tooltipValueGetter cell tooltip reflects the pending value during a batch edit', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', editable: true, tooltipValueGetter: (params) => `Tooltip: ${params.value}` }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-batch-edit-getter', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        // before any edit, the tooltip reflects the original cell value
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: value');

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('edited{Enter}');
        await asyncSetTimeout(1);

        // editor is closed, the edit stays pending in the batch
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // params.value is the cell's own display value, which shows the pending batch value
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: edited');

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // once committed, the tooltip reflects the saved value
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: edited');
        await new GridRows(api, `AG-17120 tooltipValueGetter batch edit committed final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"edited"
        `);
    });

    test('respects tooltipShowDelay and tooltipHideDelay', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipValueGetter: () => 'Delay tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
            tooltipHideDelay: 300,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-delay', gridOptions);
        await new GridColumns(api, `respects tooltipShowDelay and tooltipHideDelay setup`).checkColumns(`
            CENTER
            └── A width:200
        `);
        await new GridRows(api, `respects tooltipShowDelay and tooltipHideDelay setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(150);
        expect(getTooltips()).toHaveLength(0);

        await asyncSetTimeout(100);
        await waitForTooltips(1);
        const tooltip = getTooltips()[0];
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await asyncSetTimeout(150);
        expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(false);

        await asyncSetTimeout(200);
        await waitFor(() => expect(tooltip.classList.contains('ag-tooltip-hiding')).toBe(true));
        await new GridRows(api, `respects tooltipShowDelay and tooltipHideDelay final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 A:"value"
        `);
    });

    test('respects tooltipSwitchShowDelay when moving between cells', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipValueGetter: (params) => `Row ${params.node?.id}` }],
            rowData: [{ A: 'one' }, { A: 'two' }],
            tooltipShowDelay: 500,
            tooltipHideDelay: 200,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-switch', gridOptions);
        await new GridColumns(api, `respects tooltipSwitchShowDelay when moving between cells setup`).checkColumns(`
            CENTER
            └── A width:200
        `);
        await new GridRows(api, `respects tooltipSwitchShowDelay when moving between cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 A:"one"
            └── LEAF id:1 A:"two"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const firstCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));
        const secondCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('1', 'A')));

        await userEvent.hover(firstCell);
        await asyncSetTimeout(550);
        await waitForTooltips(1);

        await userEvent.unhover(firstCell);
        await asyncSetTimeout(50);

        await userEvent.hover(secondCell);
        await asyncSetTimeout(150);
        expect(hasTooltipText('Row 1')).toBe(false);

        await asyncSetTimeout(120);
        await waitFor(() => expect(hasTooltipText('Row 1')).toBe(true));
        await new GridRows(api, `respects tooltipSwitchShowDelay when moving between cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 A:"one"
            └── LEAF id:1 A:"two"
        `);
    });

    test('does not leak tooltips when a setTooltip cellRenderer is refreshed repeatedly', async () => {
        // a cellRenderer whose refresh() returns false is recreated on every refresh, so its init()
        // (and therefore setTooltip) runs again each time. a leaked state manager stays wired to the
        // live cell element and would surface a duplicate tooltip on hover.
        class TooltipRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value ?? '');
                params.setTooltip(`Tip for ${params.value}`, () => true);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
            public destroy(): void {}
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', cellRenderer: TooltipRenderer }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-setTooltip-leak', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        // each force refresh recreates the renderer and re-runs setTooltip via the refreshCell path
        for (let i = 0; i < 5; i++) {
            api.refreshCells({ force: true });
        }

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tip for value');

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);
    });

    test('does not duplicate after formula errors toggle during edits', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', editable: true },
                { field: 'result', tooltipValueGetter: () => 'My cell tooltip' },
            ],
            defaultColDef: {
                editable: true,
                allowFormula: true,
            },
            rowNumbers: true,
            rowData: [
                { id: 'r1', A: 1 },
                { id: 'r2', A: 2, result: '=ERRORIFONE(REF(COLUMN("A"),ROW("r1"),COLUMN("A"),ROW("r2")))' },
            ],
            getRowId: (params) => params.data?.id,
            formulaFuncs: {
                ERRORIFONE: {
                    func: (params) => {
                        for (const value of Array.from(params.values)) {
                            if (Number(value) === 1) {
                                throw new Error("Error, discovered a '1' in params");
                            }
                        }
                        return 'SUCCESS';
                    },
                },
            },
            tooltipShowDelay: 200,
            tooltipHideDelay: 200,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-dup', gridOptions);
        await new GridColumns(api, `does not duplicate after formula errors toggle during edits setup`).checkColumns(
            `
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── A width:200 editable
                └── result "Result" width:200 editable
            `
        );
        await new GridRows(api, `does not duplicate after formula errors toggle during edits setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" A:1
            └── LEAF id:r2 row-number:"2" A:2 result:"#ERROR!"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const resultCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r2', 'result')));
        await userEvent.hover(resultCell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0].classList.contains('ag-cell-formula-tooltip')).toBe(true);

        await userEvent.unhover(resultCell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.getRowNode('r1')!.setDataValue('A', 2);
        await asyncSetTimeout(50);

        await userEvent.hover(resultCell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('My cell tooltip');

        await userEvent.unhover(resultCell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.getRowNode('r1')!.setDataValue('A', 1);
        await asyncSetTimeout(50);

        await userEvent.hover(resultCell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0].classList.contains('ag-cell-formula-tooltip')).toBe(true);
        await new GridRows(api, `does not duplicate after formula errors toggle during edits final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" A:1
            └── LEAF id:r2 row-number:"2" A:2 result:"#ERROR!"
        `);
    });

    test('keeps the formula error tooltip after a colDef change on a column with no tooltip config', async () => {
        // formula and validation error tooltips are not gated by the column's own tooltip config, so a
        // colDef change must leave every cell with a tooltip feature, not just tooltip-enabled columns.
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A' }, { field: 'result' }],
            defaultColDef: {
                editable: true,
                allowFormula: true,
            },
            rowData: [
                { id: 'r1', A: 1 },
                { id: 'r2', A: 2, result: '=ERRORIFONE(REF(COLUMN("A"),ROW("r1"),COLUMN("A"),ROW("r2")))' },
            ],
            getRowId: (params) => params.data.id,
            formulaFuncs: {
                ERRORIFONE: {
                    func: (params) => {
                        for (const value of Array.from(params.values)) {
                            if (Number(value) === 1) {
                                throw new Error("Error, discovered a '1' in params");
                            }
                        }
                        return 'SUCCESS';
                    },
                },
            },
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-formula-colDefChanged', gridOptions);
        await new GridRows(api, `formula error tooltip after colDef change setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" A:1
            └── LEAF id:r2 row-number:"2" A:2 result:"#ERROR!"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r2', 'result'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0].classList.contains('ag-cell-formula-tooltip')).toBe(true);

        await userEvent.unhover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r2', 'result'))));
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.setGridOption('columnDefs', [{ field: 'A' }, { field: 'result', headerName: 'Renamed' }]);
        await asyncSetTimeout(50);
        await new GridColumns(api, `formula error tooltip after colDef change renamed`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── A width:200 editable
            └── result "Renamed" width:200 editable
        `);
        await new GridRows(api, `formula error tooltip after colDef change renamed`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" A:1
            └── LEAF id:r2 row-number:"2" A:2 result:"#ERROR!"
        `);

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r2', 'result'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0].classList.contains('ag-cell-formula-tooltip')).toBe(true);
    });

    test('keeps the row validation error tooltip after a colDef change on a column with no tooltip config', async () => {
        // row validation errors surface on every cell of the row, including one that is not editing and
        // has no tooltip config of its own — the second source that ignores column.isTooltipEnabled().
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', editable: true },
                { field: 'B', editable: false },
            ],
            rowData: [{ id: 'r1', A: 'a1', B: 'b1' }],
            getRowId: (params) => String(params.data.id),
            editType: 'fullRow',
            getFullRowEditValidationErrors: ({ editorsState }) =>
                editorsState.some((state) => String(state.newValue).includes('bad')) ? ['Row is not allowed'] : [],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-row-validation-colDefChanged', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.dblClick(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(1);
        await userEvent.keyboard('bad');
        await asyncSetTimeout(1);

        // B is not editable, so it is not editing and resolves the row's validation error
        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'B'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Row is not allowed')).toBe(true);

        await userEvent.unhover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'B'))));
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.setGridOption('columnDefs', [
            { field: 'A', editable: true },
            { field: 'B', editable: false, headerName: 'Renamed' },
        ]);
        await asyncSetTimeout(50);

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'B'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Row is not allowed')).toBe(true);
    });

    test('does not leave an open colDef tooltip showing a stale value', async () => {
        // a showing tooltip renders the value it was created with, so a cell repaint that changes the
        // value has to take the tooltip down rather than leave the old text on screen.
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipValueGetter: (params) => `Tip ${params.value}` }],
            rowData: [{ id: 'r1', A: 'a1' }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-stale-open', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Tip a1')).toBe(true);

        // the value changes while the tooltip is still open
        api.getRowNode('r1')!.setDataValue('A', 'a2');
        await new GridRows(api, `open tooltip stale value`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 A:"a2"
        `);

        await waitFor(() => expect(visibleTooltipTexts()).not.toContain('Tip a1'));
    });

    test('takes down an open custom tooltip when its params change behind the same text', async () => {
        // a custom component renders data/node/valueFormatted, none of which the resolved text reflects.
        class DataTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `Data: ${params.data.A}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipComponent: DataTooltip, tooltipValueGetter: () => 'constant' }],
            rowData: [{ id: 'r1', A: 'a1' }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-stale-params', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(visibleTooltipTexts()).toEqual(['Data: a1']);

        // the row data behind the component changes; the text the column resolves does not
        api.setGridOption('rowData', [{ id: 'r1', A: 'a2' }]);

        await waitFor(() => expect(visibleTooltipTexts()).not.toContain('Data: a1'));
    });

    test('never shows a tooltip whose source was cleared while the show delay was running', async () => {
        class TooltipRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Renderer tip', () => true);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'A',
                    cellRendererSelector: (params) =>
                        params.data?.showDetail ? { component: TooltipRenderer } : undefined,
                },
            ],
            rowData: [{ id: 'r1', A: 'a1', showDetail: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 500,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-pending-cleared', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        // the renderer and its tooltip go while the show is still waiting out its delay
        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        api.setGridOption('rowData', [{ id: 'r1', A: 'a2', showDetail: false }]);

        await asyncSetTimeout(700);
        expect(getTooltips()).toHaveLength(0);
    });

    test('never shows a tooltip whose predicate turned false while the show delay was running', async () => {
        class ReRegisteringRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Same tooltip', () => !!params.data.showTip);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: ICellRendererParams): boolean {
                this.eGui.textContent = String(params.value);
                params.setTooltip('Same tooltip', () => !!params.data.showTip);
                return true;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', cellRenderer: ReRegisteringRenderer }],
            rowData: [{ id: 'r1', A: 'a1', showTip: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 500,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-pending-predicate', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        api.setGridOption('rowData', [{ id: 'r1', A: 'a2', showTip: false }]);

        await asyncSetTimeout(700);
        expect(getTooltips()).toHaveLength(0);
    });

    test('takes down an open tooltip when a renderer re-registers the same text behind a new predicate', async () => {
        // a renderer can re-register from refresh() without being torn down: same text, new predicate.
        class ReRegisteringRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Same tooltip', () => !!params.data.showTip);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: ICellRendererParams): boolean {
                this.eGui.textContent = String(params.value);
                params.setTooltip('Same tooltip', () => !!params.data.showTip);
                return true;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', cellRenderer: ReRegisteringRenderer }],
            rowData: [{ id: 'r1', A: 'a1', showTip: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-reregister-same-text', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(visibleTooltipTexts()).toEqual(['Same tooltip']);

        // the renderer survives the update and re-registers the same text, now behind a false predicate
        api.setGridOption('rowData', [{ id: 'r1', A: 'a2', showTip: false }]);

        await waitFor(() => expect(visibleTooltipTexts()).toEqual([]));
    });

    test('takes down an open tooltip when a colDef change swaps the component behind the same text', async () => {
        // the shown component is a snapshot: identical text does not mean the same component or params.
        class TooltipA implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `A: ${params.value}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        class TooltipB implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `B: ${params.value}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipComponent: TooltipA, tooltipValueGetter: () => 'same' }],
            rowData: [{ id: 'r1', A: 'a1' }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-comp-swap-same-text', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(visibleTooltipTexts()).toEqual(['A: same']);

        // the component changes while the tooltip is open, the text it resolves does not
        api.setGridOption('columnDefs', [{ field: 'A', tooltipComponent: TooltipB, tooltipValueGetter: () => 'same' }]);

        await waitFor(() => expect(visibleTooltipTexts()).not.toContain('A: same'));
    });

    test('takes down an open renderer tooltip when its renderer goes and the column resolves the same text', async () => {
        // the column fallback carries a different shouldDisplay, so an identical text must not stay up.
        class TooltipRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Same tooltip', () => true);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'A',
                    tooltipValueGetter: () => 'Same tooltip',
                    cellRendererSelector: (params) =>
                        params.data?.showDetail ? { component: TooltipRenderer } : undefined,
                },
            ],
            rowData: [{ id: 'r1', A: 'a1', showDetail: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-renderer-gone-same-text', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(visibleTooltipTexts()).toEqual(['Same tooltip']);

        // the renderer goes while the tooltip is open; the column resolves the same text
        api.setGridOption('rowData', [{ id: 'r1', A: 'a2', showDetail: false }]);

        await waitFor(() => expect(visibleTooltipTexts()).toEqual([]));
    });

    test('a colDef change swaps the custom tooltip component and its value', async () => {
        // the feature is no longer rebuilt on a colDef change, so the component and the params it
        // receives must be resolved per hover rather than captured when the feature was created.
        class TooltipA implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `A: ${params.value}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        class TooltipB implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `B: ${params.value}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipComponent: TooltipA, tooltipValueGetter: () => 'first' }],
            rowData: [{ id: 'r1', A: 'a1' }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-custom-comp-colDefChanged', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('A: first');

        await userEvent.unhover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.setGridOption('columnDefs', [
            { field: 'A', tooltipComponent: TooltipB, tooltipValueGetter: () => 'second' },
        ]);
        await asyncSetTimeout(50);

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('B: second');
    });

    test('AG-17663 destroys cell renderer tooltip when the selector swaps to no renderer', async () => {
        class TooltipRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Cell renderer tooltip', () => true);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'A',
                    valueGetter: (params) => (params.data?.showDetail ? 'detail' : 'plain'),
                    tooltipValueGetter: () => 'ColDef tooltip',
                    cellRendererSelector: (params) =>
                        params.data?.showDetail ? { component: TooltipRenderer } : undefined,
                },
            ],
            rowData: [{ id: 'r1', showDetail: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-renderer-to-none', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Cell renderer tooltip')).toBe(true);

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        await asyncSetTimeout(50);

        await userEvent.hover(cell);
        await asyncSetTimeout(250);

        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        expect(getTooltips().length).toBeLessThanOrEqual(1);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
    });

    test('keeps the colDef tooltip current when a renderer that never set one is recreated', async () => {
        // refresh() returning false recreates the renderer on every update, tearing the old one down —
        // the teardown path that reverts a renderer-registered tooltip must leave colDef tooltips alone.
        class PlainRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', cellRenderer: PlainRenderer, tooltipValueGetter: (params) => `Tip ${params.value}` },
                { field: 'B', tooltipValueGetter: (params) => `Tip ${params.value}` },
            ],
            rowData: [{ id: 'r1', A: 'a1', B: 'b1' }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-renderer-without-setTooltip', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));
        const cellB = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'B')));

        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Tip a1')).toBe(true);

        await userEvent.unhover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        api.setGridOption('rowData', [{ id: 'r1', A: 'a2', B: 'b2' }]);
        await asyncSetTimeout(50);
        await new GridRows(api, `colDef tooltip survives renderer recreation`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 A:"a2" B:"b2"
        `);

        // the recreated renderer set no tooltip, so the colDef tooltip must show the updated value
        await userEvent.hover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Tip a2')).toBe(true);

        await userEvent.unhover(cellA);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        // a plain cell with no renderer at all takes the same teardown path
        await userEvent.hover(cellB);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Tip b2')).toBe(true);
    });

    test('AG-17663 destroys cell renderer tooltip when cellRendererSelector swaps the renderer', async () => {
        class TooltipRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Cell renderer tooltip', () => true);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        class PlainRenderer implements ICellRendererComp {
            private eGui!: HTMLElement;
            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'A',
                    valueGetter: (params) => (params.data?.showDetail ? 'detail' : 'plain'),
                    tooltipValueGetter: () => 'ColDef tooltip',
                    cellRendererSelector: (params) =>
                        params.data?.showDetail ? { component: TooltipRenderer } : { component: PlainRenderer },
                },
            ],
            rowData: [{ id: 'r1', showDetail: true }],
            getRowId: (params) => String(params.data.id),
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-renderer-swap', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(hasTooltipText('Cell renderer tooltip')).toBe(true);

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        for (let i = 0; i < 5; i++) {
            const showDetail = i % 2 === 1;
            api.setGridOption('rowData', [{ id: 'r1', showDetail }]);
            await asyncSetTimeout(50);
        }
        // final state: plain renderer (no setTooltip), so only the ColDef tooltip should remain
        api.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        await asyncSetTimeout(50);

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);

        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
    });

    test('AG-17872 tooltipComponentSelector receives ITooltipParams and selects a component', async () => {
        // reading params.location — a field that exists only on ITooltipParams — is the compile-time
        // guard that the selector param is typed as ITooltipParams rather than cell params.
        const seenLocations: string[] = [];

        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.classList.add('ag-tooltip-custom');
                this.eGui.textContent = `Tooltip at ${params.location}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'A',
                    tooltipValueGetter: () => 'value tooltip',
                    tooltipComponentSelector: (params) => {
                        seenLocations.push(params.location);
                        return { component: CustomTooltip };
                    },
                },
            ],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-selector-params', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip at cell');
        expect(seenLocations).toContain('cell');
    });

    describe('whenTruncated with cellRendererSelector', () => {
        beforeAll(() => {
            mockGridLayout.useRealOffsetDimensions = true;
        });
        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
        });

        test('AG-17691 does not show whenTruncated tooltip for a non-truncated cell whose selector returns undefined', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    {
                        field: 'A',
                        width: 200,
                        tooltipValueGetter: () => 'Should not show',
                        cellRendererSelector: () => undefined,
                    },
                ],
                rowData: [{ A: 'AGE' }],
                tooltipShowMode: 'whenTruncated',
                tooltipShowDelay: 200,
            };

            const api = await gridMgr.createGridAndWait('myGrid-tooltip-whenTruncated-notTruncated', gridOptions);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

            await userEvent.hover(cell);
            await asyncSetTimeout(250);
            expect(getTooltips()).toHaveLength(0);
        });

        test('AG-17691 keeps showing whenTruncated tooltip for a column with a real cell renderer', async () => {
            class PlainRenderer implements ICellRendererComp {
                private eGui!: HTMLElement;
                public init(params: ICellRendererParams): void {
                    this.eGui = document.createElement('span');
                    this.eGui.textContent = String(params.value);
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public refresh(): boolean {
                    return false;
                }
            }

            const gridOptions: GridOptions = {
                columnDefs: [
                    {
                        field: 'A',
                        width: 200,
                        tooltipValueGetter: () => 'Renderer tooltip',
                        cellRenderer: PlainRenderer,
                    },
                ],
                rowData: [{ A: 'AGE' }],
                tooltipShowMode: 'whenTruncated',
                tooltipShowDelay: 200,
            };

            const api = await gridMgr.createGridAndWait('myGrid-tooltip-whenTruncated-realRenderer', gridOptions);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

            await userEvent.hover(cell);
            await asyncSetTimeout(250);
            await waitForTooltips(1);
            expect(getTooltips()[0]).toHaveTextContent('Renderer tooltip');
        });

        test('AG-17691 keeps showing whenTruncated tooltip for a renderer that registers one via setTooltip', async () => {
            class TooltipRenderer implements ICellRendererComp {
                private eGui!: HTMLElement;
                public init(params: ICellRendererParams): void {
                    this.eGui = document.createElement('span');
                    this.eGui.textContent = String(params.value);
                    params.setTooltip('Renderer set tooltip');
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public refresh(): boolean {
                    return false;
                }
            }

            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'A', width: 200, cellRenderer: TooltipRenderer }],
                rowData: [{ A: 'AGE' }],
                tooltipShowMode: 'whenTruncated',
                tooltipShowDelay: 200,
            };

            const api = await gridMgr.createGridAndWait('myGrid-tooltip-whenTruncated-setTooltip', gridOptions);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

            await userEvent.hover(cell);
            await asyncSetTimeout(250);
            await waitForTooltips(1);
            expect(getTooltips()[0]).toHaveTextContent('Renderer set tooltip');
        });

        test('AG-17691 gates per-cell when a selector returns a renderer for one row and undefined for another', async () => {
            class PlainRenderer implements ICellRendererComp {
                private eGui!: HTMLElement;
                public init(params: ICellRendererParams): void {
                    this.eGui = document.createElement('span');
                    this.eGui.textContent = String(params.value);
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public refresh(): boolean {
                    return false;
                }
            }

            const gridOptions: GridOptions = {
                columnDefs: [
                    {
                        field: 'A',
                        width: 200,
                        tooltipValueGetter: () => 'Selector tooltip',
                        cellRendererSelector: (params): CellRendererSelectorResult | undefined =>
                            params.data.A === 'AGE' ? { component: PlainRenderer } : undefined,
                    },
                ],
                rowData: [{ A: 'AGE' }, { A: 'BEE' }],
                tooltipShowMode: 'whenTruncated',
                tooltipShowDelay: 200,
            };

            const api = await gridMgr.createGridAndWait('myGrid-tooltip-whenTruncated-mixedSelector', gridOptions);
            const gridDiv = getGridElement(api)! as HTMLElement;

            // Row with an active renderer: always shows regardless of truncation.
            const rendererCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));
            await userEvent.hover(rendererCell);
            await asyncSetTimeout(250);
            await waitForTooltips(1);
            expect(getTooltips()[0]).toHaveTextContent('Selector tooltip');

            await userEvent.unhover(rendererCell);
            await waitForTooltips(0);

            // Row where the selector returned undefined renders plain text: gated on overflow, and not truncated.
            const plainCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('1', 'A')));
            await userEvent.hover(plainCell);
            await asyncSetTimeout(250);
            expect(getTooltips()).toHaveLength(0);
        });
    });
});
