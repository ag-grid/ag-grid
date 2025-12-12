import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { ColDef, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    PinnedRowModule,
    SelectEditorModule,
    TextEditorModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    BatchEditModule,
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    CustomEditorModule,
    RenderApiModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

interface CarRow {
    id: string;
    make: string;
    model: string;
    price: number;
    field4: string;
    field5: string;
    field6: string;
}

describe('Full-row editing documentation examples', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            NumberEditorModule,
            TextEditorModule,
            SelectEditorModule,
            PinnedRowModule,
            BatchEditModule,
            CellSelectionModule,
            ColumnsToolPanelModule,
            ColumnMenuModule,
            ContextMenuModule,
            CustomEditorModule,
            RenderApiModule,
            RowGroupingModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    test('full-row editing doc example tabbing and scrolling behaviour', async () => {
        const makeValues = ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'];
        const baseColumnDefs: ColDef<CarRow>[] = [
            {
                field: 'make',
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: { values: makeValues },
            },
            { field: 'model' },
            { field: 'field4', headerName: 'Read Only', editable: false },
            { field: 'price', cellEditor: 'agNumberCellEditor' },
            {
                headerName: 'Suppress Navigable',
                field: 'field5',
                suppressNavigable: true,
                minWidth: 200,
            },
            { headerName: 'Read Only', field: 'field6', editable: false },
        ];

        const duplicateColumns: ColDef<CarRow>[] = [];
        for (let repeat = 0; repeat < 2; repeat += 1) {
            for (const [index, colDef] of baseColumnDefs.entries()) {
                duplicateColumns.push({ ...colDef, colId: `${colDef.field}-${index}` });
            }
        }
        const columnDefs: ColDef<CarRow>[] = duplicateColumns.map((colDef, index) => ({
            ...colDef,
            colId: `${colDef.colId}-${index}`,
        }));

        const baseRows = [
            { make: 'Toyota', model: 'Celica', price: 35000, field4: 'S-XX', field5: 'S-22', field6: 'S-23' },
            { make: 'Ford', model: 'Mondeo', price: 32000, field4: 'S-YY', field5: 'S-24', field6: 'S-25' },
            { make: 'Porsche', model: 'Boxster', price: 72000, field4: 'S-ZZ', field5: 'S-26', field6: 'S-27' },
        ];
        const totalRows = 100;
        const farRowIndex = totalRows - 1;
        const farRowTemplate = baseRows[farRowIndex % baseRows.length];
        const rowData: CarRow[] = [];
        for (let index = 0; index < totalRows; index += 1) {
            const template = baseRows[index % baseRows.length];
            const batchIndex = Math.floor(index / baseRows.length);
            rowData.push({
                id: String(index),
                ...template,
                model: `${template.model} ${batchIndex}`,
                price: template.price + batchIndex * 1000,
            });
        }
        const rowsToTrimLater = rowData.slice(3);
        const remainingRowCount = rowData.length - rowsToTrimLater.length;

        const api = await gridsManager.createGridAndWait('fullRowEditingDoc', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            animateRows: false,
            defaultColDef: { flex: 1, editable: true, cellDataType: false, minWidth: 120 },
        } satisfies GridOptions<CarRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const findCell = (rowIndex: number, colId: string): HTMLElement => {
            const selector = `.ag-center-cols-container [row-index="${rowIndex}"] [col-id="${colId}"]`;
            const cell = gridElement.querySelector<HTMLElement>(selector);
            if (!cell) {
                throw new Error(`Unable to locate cell row-index=${rowIndex} colId=${colId}`);
            }
            return cell;
        };

        const tabScenarios: Array<{ editType: 'fullRow' | 'singleCell'; tabCount: number }> = [
            { editType: 'singleCell', tabCount: 4 },
            { editType: 'fullRow', tabCount: 8 },
        ];

        for (const { editType, tabCount } of tabScenarios) {
            api.setGridOption('editType', editType);
            const modelCellRow1 = findCell(1, 'model-1-1');
            await user.dblClick(modelCellRow1);
            await waitForInput(gridElement, modelCellRow1);

            for (let i = 0; i < tabCount + 2; i += 1) {
                await user.keyboard('{Tab}');
            }

            const modelCellRow2 = findCell(2, 'model-1-1');
            await waitForInput(gridElement, modelCellRow2);
            api.stopEditing();
            expect(api.getCellEditorInstances()).toHaveLength(0);
        }

        api.setGridOption('editType', 'fullRow');
        const scrollModelCell = findCell(1, 'model-1-1');
        await user.dblClick(scrollModelCell);
        await waitForInput(gridElement, scrollModelCell);

        api.ensureIndexVisible(farRowIndex);
        await asyncSetTimeout(0);
        expect(findCell(farRowIndex, 'make-0-0')).toHaveTextContent(farRowTemplate.make);

        api.ensureColumnVisible('field6-5-11');
        await asyncSetTimeout(0);
        expect(findCell(farRowIndex, 'field6-5-11')).toHaveTextContent(farRowTemplate.field6);

        api.ensureIndexVisible(0);
        await asyncSetTimeout(0);
        expect(findCell(0, 'field6-5-11')).toHaveTextContent('S-23');

        api.ensureColumnVisible('make-0-0');
        await asyncSetTimeout(0);
        expect(findCell(0, 'make-0-0')).toHaveTextContent('Toyota');
        expect(scrollModelCell.querySelector('input')).toBeTruthy();

        api.stopEditing();
        expect(api.getCellEditorInstances()).toHaveLength(0);

        api.setGridOption('editType', 'fullRow');
        const scrollAgainModelCell = findCell(1, 'model-1-1');
        await user.dblClick(scrollAgainModelCell);
        await waitForInput(gridElement, scrollAgainModelCell);
        const scrollAgainMakeCell = findCell(1, 'make-0-0');
        await asyncSetTimeout(0);
        if (!scrollAgainMakeCell.querySelector('[role="combobox"]')) {
            throw new Error('combobox not ready');
        }

        api.ensureColumnVisible('field5-4-10');
        api.ensureColumnVisible('make-0-0');
        expect(scrollAgainModelCell.querySelector('input')).toBeTruthy();
        expect(scrollAgainMakeCell.querySelector('[role="combobox"]')).toBeTruthy();

        api.stopEditing();
        expect(api.getCellEditorInstances()).toHaveLength(0);

        if (rowsToTrimLater.length) {
            api.applyTransaction({ remove: rowsToTrimLater });
            expect(api.getDisplayedRowCount()).toBe(remainingRowCount);
        }

        const trimmedColumnDefs = columnDefs.slice(0, 3);
        api.setGridOption('columnDefs', trimmedColumnDefs);
        api.refreshClientSideRowModel('everything');
        const updatedDefs = api.getColumnDefs();
        expect(updatedDefs).toBeTruthy();
        expect(updatedDefs).toHaveLength(trimmedColumnDefs.length);

        await new GridRows(api, 'full row editing trimmed baseline').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make-0-0:"Toyota" model-1-1:"Celica 0" field4-2-2:"S-XX"
            ├── LEAF id:1 make-0-0:"Ford" model-1-1:"Mondeo 0" field4-2-2:"S-YY"
            └── LEAF id:2 make-0-0:"Porsche" model-1-1:"Boxster 0" field4-2-2:"S-ZZ"
        `);

        const modelCellRow1 = findCell(1, 'model-1-1');
        await user.dblClick(modelCellRow1);
        await waitForInput(gridElement, modelCellRow1);
        await user.keyboard('XYZ');
        await user.keyboard('{Tab}{Tab}');
        api.stopEditing();
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(modelCellRow1).toHaveTextContent('XYZ');

        await new GridRows(api, 'full row editing snapshot').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make-0-0:"Toyota" model-1-1:"Celica 0" field4-2-2:"S-XX"
            ├── LEAF id:1 make-0-0:"Ford" model-1-1:"XYZ" field4-2-2:"S-YY"
            └── LEAF id:2 make-0-0:"Porsche" model-1-1:"Boxster 0" field4-2-2:"S-ZZ"
        `);
    });
});
