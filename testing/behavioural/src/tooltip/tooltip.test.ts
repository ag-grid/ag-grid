import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Tooltips', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, FormulaModule] as Module[],
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
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Base tooltip');
    });

    test('respects tooltipShowDelay and tooltipHideDelay', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'A', tooltipValueGetter: () => 'Delay tooltip' }],
            rowData: [{ A: 'value' }],
            tooltipShowDelay: 200,
            tooltipHideDelay: 300,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-delay', gridOptions);
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
    });
});
