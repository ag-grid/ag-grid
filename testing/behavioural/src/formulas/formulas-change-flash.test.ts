import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    HighlightChangesModule,
    NumberEditorModule,
    TextEditorModule,
    ValueCacheModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { TestGridsManager, applyTransactionChecked, asyncSetTimeout, waitForInput } from '../test-utils';

const FLASH_CSS_CLASS = 'ag-cell-data-changed';

const baseRowData = [
    {
        id: 'ROW_0',
        A: 1,
        B: '=A1+1',
        C: '=B1+1',
        D: '=C1+1',
        stable: '=A1-A1',
        ratio: '=10/A1',
    },
    {
        id: 'ROW_1',
        A: 5,
        B: '=A2+1',
        C: '=B2+1',
        D: '=C2+1',
        stable: '=A2-A2',
        ratio: '=10/A2',
    },
];

function createGridOptions(enableFormulaCellFlash: boolean): GridOptions {
    return {
        enableFormulaCellFlash,
        defaultColDef: {
            editable: true,
            allowFormula: true,
            enableCellChangeFlash: true,
        },
        columnDefs: [
            { field: 'A' },
            { field: 'B' },
            { field: 'C' },
            { field: 'D' },
            { field: 'stable' },
            { field: 'ratio' },
        ],
        rowData: baseRowData.map((row) => ({ ...row })),
        getRowId: (params) => params.data.id,
    };
}

function getCell(gridDiv: HTMLElement, rowId: string, colId: string): HTMLElement {
    const cell = gridDiv.querySelector<HTMLElement>(`.ag-row[row-id="${rowId}"] [col-id="${colId}"]`);
    if (!cell) {
        throw new Error(`Cell not found for row "${rowId}" and column "${colId}"`);
    }
    return cell;
}

describe('ag-grid formulas cell flashing', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            HighlightChangesModule,
            TextEditorModule,
            NumberEditorModule,
            ValueCacheModule,
        ] as Module[],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('dependent formula cells update without flashing when formula flashing is disabled', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashDisabled', createGridOptions(false));
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const aCell = getCell(gridDiv, 'ROW_0', 'A');
        const bCell = getCell(gridDiv, 'ROW_0', 'B');
        const cCell = getCell(gridDiv, 'ROW_0', 'C');
        const dCell = getCell(gridDiv, 'ROW_0', 'D');
        const stableCell = getCell(gridDiv, 'ROW_0', 'stable');
        const ratioCell = getCell(gridDiv, 'ROW_0', 'ratio');

        api.getDisplayedRowAtIndex(0)!.setDataValue('A', 2);
        await asyncSetTimeout(0);

        expect(aCell).toHaveClass(FLASH_CSS_CLASS);
        expect(bCell).toHaveTextContent('3');
        expect(cCell).toHaveTextContent('4');
        expect(dCell).toHaveTextContent('5');
        expect(stableCell).toHaveTextContent('0');
        expect(ratioCell).toHaveTextContent('5');
        expect(bCell).not.toHaveClass(FLASH_CSS_CLASS);
        expect(cCell).not.toHaveClass(FLASH_CSS_CLASS);
        expect(dCell).not.toHaveClass(FLASH_CSS_CLASS);
        expect(stableCell).not.toHaveClass(FLASH_CSS_CLASS);
        expect(ratioCell).not.toHaveClass(FLASH_CSS_CLASS);
    });

    test('direct and transitive formula dependents flash when formula flashing is enabled', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashEnabled', createGridOptions(true));
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const bCell = getCell(gridDiv, 'ROW_0', 'B');
        const cCell = getCell(gridDiv, 'ROW_0', 'C');
        const dCell = getCell(gridDiv, 'ROW_0', 'D');
        const stableCell = getCell(gridDiv, 'ROW_0', 'stable');
        const ratioCell = getCell(gridDiv, 'ROW_0', 'ratio');
        const unrelatedCell = getCell(gridDiv, 'ROW_1', 'B');

        api.getDisplayedRowAtIndex(0)!.setDataValue('A', 2);
        await asyncSetTimeout(0);

        expect(bCell).toHaveTextContent('3');
        expect(cCell).toHaveTextContent('4');
        expect(dCell).toHaveTextContent('5');
        expect(ratioCell).toHaveTextContent('5');
        expect(bCell).toHaveClass(FLASH_CSS_CLASS);
        expect(cCell).toHaveClass(FLASH_CSS_CLASS);
        expect(dCell).toHaveClass(FLASH_CSS_CLASS);
        expect(ratioCell).toHaveClass(FLASH_CSS_CLASS);
        expect(stableCell).not.toHaveClass(FLASH_CSS_CLASS);
        expect(unrelatedCell).not.toHaveClass(FLASH_CSS_CLASS);
    });

    test('plain source column edits update dependent formulas when only the target column allows formulas', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashMixedColumns', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'C', allowFormula: true }],
            rowData: [{ id: 'ROW_0', A: 1.25, B: 4, C: '=A1*B1' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const cCell = getCell(gridDiv, 'ROW_0', 'C');
        expect(cCell).toHaveTextContent('5');

        api.getRowNode('ROW_0')!.setDataValue('B', 5);
        await asyncSetTimeout(0);

        expect(cCell).toHaveTextContent('6.25');
    });

    test('editor commits on plain source columns update dependent formulas when only the target column allows formulas', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashMixedColumnsEditor', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'C', allowFormula: true }],
            rowData: [{ id: 'ROW_0', A: 1.25, B: 4, C: '=A1*B1' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const bCell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'B'));
        const cCell = getCell(gridDiv, 'ROW_0', 'C');

        await user.dblClick(bCell);
        const input = await waitForInput(gridDiv, bCell, { popup: false });
        await user.clear(input);
        await user.type(input, '5{Enter}');
        await asyncSetTimeout(0);

        expect(api.getRowNode('ROW_0')!.getDataValue('C')).toBe(6.25);
        expect(cCell).toHaveTextContent('6.25');
    });

    test('update transactions use targeted formula flashing', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashTransaction', createGridOptions(true));
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const bCell = getCell(gridDiv, 'ROW_0', 'B');
        const cCell = getCell(gridDiv, 'ROW_0', 'C');
        const dCell = getCell(gridDiv, 'ROW_0', 'D');
        const stableCell = getCell(gridDiv, 'ROW_0', 'stable');
        const ratioCell = getCell(gridDiv, 'ROW_0', 'ratio');

        applyTransactionChecked(api, {
            update: [{ ...baseRowData[0], A: 4 }],
        });
        await asyncSetTimeout(0);

        expect(bCell).toHaveTextContent('5');
        expect(cCell).toHaveTextContent('6');
        expect(dCell).toHaveTextContent('7');
        expect(ratioCell).toHaveTextContent('2.5');
        expect(bCell).toHaveClass(FLASH_CSS_CLASS);
        expect(cCell).toHaveClass(FLASH_CSS_CLASS);
        expect(dCell).toHaveClass(FLASH_CSS_CLASS);
        expect(ratioCell).toHaveClass(FLASH_CSS_CLASS);
        expect(stableCell).not.toHaveClass(FLASH_CSS_CLASS);
    });

    test('formula error transitions count as value changes for flashing', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashErrors', createGridOptions(true));
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const ratioCell = getCell(gridDiv, 'ROW_0', 'ratio');

        api.getDisplayedRowAtIndex(0)!.setDataValue('A', 0);
        await asyncSetTimeout(0);

        expect(ratioCell).toHaveTextContent('#DIV/0!');
        expect(ratioCell).toHaveClass(FLASH_CSS_CLASS);
    });

    test('editing a formula string rewires dependents and flashes the edited cell', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashFormulaEdit', createGridOptions(true));
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const bCell = getCell(gridDiv, 'ROW_0', 'B');
        const cCell = getCell(gridDiv, 'ROW_0', 'C');
        const dCell = getCell(gridDiv, 'ROW_0', 'D');

        // Replace B's formula: was =A1+1 (→2), becomes =A1*10 (→10). C=B+1, D=C+1 cascade.
        api.getRowNode('ROW_0')!.setDataValue('B', '=A1*10');
        await asyncSetTimeout(0);

        expect(bCell).toHaveTextContent('10');
        expect(cCell).toHaveTextContent('11');
        expect(dCell).toHaveTextContent('12');
        expect(bCell).toHaveClass(FLASH_CSS_CLASS);
        expect(cCell).toHaveClass(FLASH_CSS_CLASS);
        expect(dCell).toHaveClass(FLASH_CSS_CLASS);
    });

    test('range dependencies flash when any referenced cell changes', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashRange', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A' }, { field: 'total' }],
            rowData: [
                { id: 'ROW_0', A: 1, total: '=SUM(A1:A2)' },
                { id: 'ROW_1', A: 2, total: '=SUM(A1:A2)' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const totalRow0 = getCell(gridDiv, 'ROW_0', 'total');
        const totalRow1 = getCell(gridDiv, 'ROW_1', 'total');

        api.getRowNode('ROW_0')!.setDataValue('A', 10);
        await asyncSetTimeout(0);

        expect(totalRow0).toHaveTextContent('12');
        expect(totalRow1).toHaveTextContent('12');
        expect(totalRow0).toHaveClass(FLASH_CSS_CLASS);
        expect(totalRow1).toHaveClass(FLASH_CSS_CLASS);
    });

    test('cross-row dependents flash when a referenced row cell changes', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashCrossRow', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A' }, { field: 'mirror' }],
            rowData: [
                { id: 'ROW_0', A: 3, mirror: '=A1+1' },
                { id: 'ROW_1', A: 7, mirror: '=A1+100' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const mirrorRow0 = getCell(gridDiv, 'ROW_0', 'mirror');
        const mirrorRow1 = getCell(gridDiv, 'ROW_1', 'mirror');

        // Both mirror cells reference ROW_0's A cell (A1). Changing A in ROW_0 should flash both.
        api.getRowNode('ROW_0')!.setDataValue('A', 50);
        await asyncSetTimeout(0);

        expect(mirrorRow0).toHaveTextContent('51');
        expect(mirrorRow1).toHaveTextContent('150');
        expect(mirrorRow0).toHaveClass(FLASH_CSS_CLASS);
        expect(mirrorRow1).toHaveClass(FLASH_CSS_CLASS);
    });

    test('structural sorts recompute formulas without flashing', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashStructuralSort', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A' }, { field: 'mirror' }],
            rowData: [
                { id: 'ROW_0', A: 5, mirror: '=A1+100' },
                { id: 'ROW_1', A: 1, mirror: '=A1+100' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        expect(getCell(gridDiv, 'ROW_0', 'mirror')).toHaveTextContent('105');
        expect(getCell(gridDiv, 'ROW_1', 'mirror')).toHaveTextContent('105');

        api.applyColumnState({ state: [{ colId: 'A', sort: 'asc' }] });
        await asyncSetTimeout(0);

        const mirrorRow0After = getCell(gridDiv, 'ROW_0', 'mirror');
        const mirrorRow1After = getCell(gridDiv, 'ROW_1', 'mirror');
        expect(mirrorRow0After).toHaveTextContent('101');
        expect(mirrorRow1After).toHaveTextContent('101');
        expect(mirrorRow0After).not.toHaveClass(FLASH_CSS_CLASS);
        expect(mirrorRow1After).not.toHaveClass(FLASH_CSS_CLASS);
    });

    test('update-only transactions under active sort refresh formulas against the new order and flash changed dependents', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashSortedUpdate', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [{ field: 'A', sort: 'asc' }, { field: 'mirror' }],
            rowData: [
                { id: 'ROW_0', A: 5, mirror: '=A1+100' },
                { id: 'ROW_1', A: 1, mirror: '=A1+100' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        // Sorted asc by A: ROW_1 (A=1) is at position 0, so A1 = 1 → mirror = 101 everywhere.
        expect(getCell(gridDiv, 'ROW_0', 'mirror')).toHaveTextContent('101');
        expect(getCell(gridDiv, 'ROW_1', 'mirror')).toHaveTextContent('101');

        // Update ROW_0.A = 0. Sort reshuffles: ROW_0 (A=0) now at position 0, so A1 = 0 → mirror = 100.
        // Both mirror cells changed value, so both should flash even though the sort-active
        // fallback goes through the blanket refreshFormulas path.
        applyTransactionChecked(api, { update: [{ id: 'ROW_0', A: 0, mirror: '=A1+100' }] });
        await asyncSetTimeout(0);

        const mirrorRow0After = getCell(gridDiv, 'ROW_0', 'mirror');
        const mirrorRow1After = getCell(gridDiv, 'ROW_1', 'mirror');
        expect(mirrorRow0After).toHaveTextContent('100');
        expect(mirrorRow1After).toHaveTextContent('100');
        expect(mirrorRow0After).toHaveClass(FLASH_CSS_CLASS);
        expect(mirrorRow1After).toHaveClass(FLASH_CSS_CLASS);
    });

    test('valueGetter-backed source column updates propagate to formula dependents on row data update', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashValueGetterSource', {
            enableFormulaCellFlash: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [
                { field: 'A' },
                { colId: 'doubled', valueGetter: (p: any) => (p.node.data?.A ?? 0) * 2 },
                { field: 'result' },
            ],
            rowData: [{ id: 'ROW_0', A: 3, result: '=B1+1' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const resultCell = getCell(gridDiv, 'ROW_0', 'result');
        const doubledCell = getCell(gridDiv, 'ROW_0', 'doubled');

        expect(doubledCell).toHaveTextContent('6');
        expect(resultCell).toHaveTextContent('7');

        // Transaction update changes A, which the valueGetter turns into a change on 'doubled'.
        // The formula in 'result' references column B (the doubled column) and must pick up the change.
        applyTransactionChecked(api, { update: [{ id: 'ROW_0', A: 10, result: '=B1+1' }] });
        await asyncSetTimeout(0);

        expect(doubledCell).toHaveTextContent('20');
        expect(resultCell).toHaveTextContent('21');
        expect(resultCell).toHaveClass(FLASH_CSS_CLASS);
    });

    test('row data updates re-evaluate nested valueGetter getValue calls against the new snapshot when valueCache is enabled', async () => {
        const api = await gridMgr.createGridAndWait('formulaFlashValueGetterNestedCache', {
            enableFormulaCellFlash: true,
            valueCache: true,
            defaultColDef: { editable: true, allowFormula: true, enableCellChangeFlash: true },
            columnDefs: [
                { field: 'A' },
                { colId: 'doubled', valueGetter: (p: any) => Number(p.getValue('A') ?? 0) * 2 },
                { field: 'result' },
            ],
            rowData: [{ id: 'ROW_0', A: 3, result: '=B1+1' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const doubledCell = getCell(gridDiv, 'ROW_0', 'doubled');
        const resultCell = getCell(gridDiv, 'ROW_0', 'result');

        expect(doubledCell).toHaveTextContent('6');
        expect(resultCell).toHaveTextContent('7');

        api.getRowNode('ROW_0')!.updateData({ id: 'ROW_0', A: 10, result: '=B1+1' });
        await asyncSetTimeout(0);

        expect(doubledCell).toHaveTextContent('20');
        expect(resultCell).toHaveTextContent('21');
        expect(resultCell).toHaveClass(FLASH_CSS_CLASS);
    });
});
