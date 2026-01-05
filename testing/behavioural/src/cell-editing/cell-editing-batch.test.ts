import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

describe('Cell Editing Batch', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [BatchEditModule],
    });

    const rowDataFactory = () => [
        {
            number: 10,
            string1: 'test',
            string2: 'test',
            date: new Date('2025-01-01'),
            dateStr: '2025-01-01',
            boolean: true,
        },
        {
            number: undefined,
            string1: undefined,
            string2: undefined,
            date: undefined,
            dateStr: undefined,
            boolean: undefined,
        },
    ];

    let rowData: any[];

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    test('should decorate cell as pending', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
        });

        api.startBatchEdit();

        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('100{Enter}');

        await asyncSetTimeout(1);

        expect(api.getCellEditorInstances()).toHaveLength(0);

        expect(cell).toHaveTextContent('100');
        expect(cell).toHaveClass(/ag-cell-batch-edit/);

        const cell2 = getByTestId(gridDiv, agTestIdFor.cell('1', 'number'));
        expect(cell2).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test('cell not pending after commit', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
        });

        api.startBatchEdit();

        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('100{Enter}');
        await asyncSetTimeout(1);

        expect(api.getCellEditorInstances()).toHaveLength(0);

        api.commitBatchEdit();

        await asyncSetTimeout(1);

        expect(cell).toHaveTextContent('100');
        expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

        const cell2 = getByTestId(gridDiv, agTestIdFor.cell('1', 'number'));
        expect(cell2).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test('cell not pending or updated after cancel', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
        });

        api.startBatchEdit();

        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('100{Enter}');
        await asyncSetTimeout(1);

        expect(api.getCellEditorInstances()).toHaveLength(0);

        api.cancelBatchEdit();

        await asyncSetTimeout(1);

        expect(cell).toHaveTextContent('10');
        expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

        const cell2 = getByTestId(gridDiv, agTestIdFor.cell('1', 'number'));
        expect(cell2).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test('commit keeps edited value when focus leaves grid', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
            stopEditingWhenCellsLoseFocus: true,
        });

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        const commitButton = document.createElement('button');
        document.body.appendChild(commitButton);
        commitButton.addEventListener('click', () => api.commitBatchEdit());

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        await userEvent.keyboard('123');
        await asyncSetTimeout(1);

        await userEvent.click(commitButton);
        await asyncSetTimeout(1);

        expect(cell).toHaveTextContent('123');
        expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

        commitButton.remove();
    });

    test('valueGetter sees pending edits during batch edit', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                {
                    field: 'b',
                    valueGetter: (params) => params.getValue('a'),
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('initial');

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'xx{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        api.startBatchEdit();

        await userEvent.dblClick(cellA);
        const editor2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor2);
        await userEvent.type(editor2, 'yy{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('yy');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');
    });
});
