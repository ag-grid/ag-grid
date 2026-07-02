import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, ICellRendererComp, ICellRendererParams, Module } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Tooltips', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, FormulaModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });
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
});
