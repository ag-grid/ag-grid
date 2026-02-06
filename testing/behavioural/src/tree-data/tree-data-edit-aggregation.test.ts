import { userEvent } from '@testing-library/user-event';

import type { GridOptions, IAggFuncParams, ValueSetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, cachedJSONObjects, waitForInput } from '../test-utils';

interface VehicleRow {
    id: string;
    group: string[];
    type: 'chapter' | 'paragraph' | 'line' | 'sub_line';
    model: string;
    qty?: number;
    price?: number;
    total?: number;
}

describe('ag-grid tree data edit aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule, TextEditorModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Aggregation triggering for parent item when using treeData with a valueSetter (AG-16104)', async () => {
        const rowData: VehicleRow[] = cachedJSONObjects.array([
            { id: '1', group: ['1'], type: 'chapter', model: 'Model Y' },
            { id: '2', group: ['1', '2'], type: 'paragraph', model: 'F-Series' },
            { id: '3', group: ['1', '2', '3'], type: 'line', model: 'Corolla' },
            { id: '4', group: ['1', '2', '3', '4'], type: 'sub_line', model: 'EQA', qty: 2, price: 100, total: 200 },
            { id: '5', group: ['1', '2', '3', '5'], type: 'sub_line', model: '500', qty: 3, price: 100, total: 300 },
            { id: '6', group: ['1', '2', '3', '6'], type: 'sub_line', model: 'Juke', qty: 2, price: 150, total: 300 },
            { id: '7', group: ['1', '2', '7'], type: 'line', make: 'Toyota', model: 'Corolla' },
            { id: '8', group: ['1', '2', '7', '8'], type: 'sub_line', model: 'EQA', qty: 2, price: 100, total: 200 },
            { id: '9', group: ['1', '2', '7', '9'], type: 'sub_line', model: '500', qty: 3, price: 100, total: 300 },
            { id: '10', group: ['1', '2', '7', '10'], type: 'sub_line', model: 'Juke', qty: 2, price: 150, total: 300 },
        ]);

        const unFormatNumber = (value: unknown, decimals = 2): number => {
            if (value === null || value === undefined || value === '') {
                return 0;
            }

            const toFixedNumber = (num: number): number => parseFloat(num.toFixed(decimals));
            const toNumber = (input: string): number | null => {
                const parsed = Number(input);
                return Number.isFinite(parsed) ? parsed : null;
            };

            const original = `${value}`;
            const firstAttempt = toNumber(original.replace(/,/g, ''));
            if (firstAttempt !== null) {
                return toFixedNumber(firstAttempt);
            }

            const secondAttempt = toNumber(original.replace(/\./g, ''));
            if (secondAttempt !== null) {
                return toFixedNumber(secondAttempt);
            }

            return 0;
        };

        const sumFunctionWithQty = (params: IAggFuncParams<VehicleRow, number>): number => {
            let result = 0;

            for (const value of params.values ?? []) {
                result += unFormatNumber(value);
            }

            if (params.data) {
                const { type, qty } = params.data;
                const qtyText = qty === undefined || qty === null ? '' : `${qty}`;
                const shouldScale = (type === 'line' || type === 'paragraph') && qtyText !== '';
                if (shouldScale) {
                    let parsedQty = unFormatNumber(qty, 3);
                    if (parsedQty === 0) {
                        parsedQty = 1;
                    }
                    result = result * parsedQty;
                }
                params.data[params.colDef.field!] = result;
            }

            return result;
        };

        const propagateTotals = (params: ValueSetterParams<VehicleRow>): boolean => {
            const data = params.data;
            if (!data) {
                return false;
            }
            const isSummaryRow = data.type === 'chapter' || data.type === 'paragraph' || data.type === 'line';
            if (isSummaryRow) {
                if (params.newValue != params.oldValue) {
                    const children = params.node?.childrenAfterGroup ?? [];
                    const numberOfChildren = children.length;
                    const pricePerChild = numberOfChildren ? unFormatNumber(params.newValue) / numberOfChildren : 0;
                    if (children.length > 0) {
                        children.forEach((child) => child.setDataValue('total', pricePerChild));
                    }
                    data.total = unFormatNumber(params.newValue);
                    params.api.refreshClientSideRowModel('aggregate');
                }
                return true;
            }
            data.total = unFormatNumber(params.newValue);
            data.price = data.total / (data.qty || 1);
            return true;
        };

        const gridOptions: GridOptions<VehicleRow> = {
            rowData,
            treeData: true,
            groupDefaultExpanded: -1,
            animateRows: false,
            getDataPath: (data) => data.group,
            getRowId: (params) => params.data?.id ?? '',
            defaultColDef: { flex: 1 },
            columnDefs: [
                { field: 'model', editable: true },
                {
                    field: 'total',
                    editable: true,
                    aggFunc: 'sumFunctionWithQty',
                    valueSetter: propagateTotals,
                },
            ],
            aggFuncs: {
                sumFunctionWithQty,
            },
        };

        const api = gridsManager.createGrid('tree-edit-aggregation', gridOptions);

        await new GridRows(api, 'initial tree data snapshot').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" model:"Model Y" total:1600
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" model:"F-Series" total:1600
            · · ├─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" model:"Corolla" total:800
            · · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" model:"EQA" total:200
            · · │ ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" model:"500" total:300
            · · │ └── 6 LEAF id:6 ag-Grid-AutoColumn:"6" model:"Juke" total:300
            · · └─┬ 7 GROUP id:7 ag-Grid-AutoColumn:"7" model:"Corolla" total:800
            · · · ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" model:"EQA" total:200
            · · · ├── 9 LEAF id:9 ag-Grid-AutoColumn:"9" model:"500" total:300
            · · · └── 10 LEAF id:10 ag-Grid-AutoColumn:"10" model:"Juke" total:300
        `);

        const gridDiv = TestGridsManager.getHTMLElement(api);
        expect(gridDiv).not.toBeNull();

        const totalCell = gridDiv!.querySelector<HTMLElement>('[row-id="2"] [col-id="total"]');
        expect(totalCell).not.toBeNull();

        await userEvent.dblClick(totalCell!);
        const editor = await waitForInput(gridDiv!, totalCell!);
        await userEvent.clear(editor);
        await userEvent.type(editor, '2000{Enter}');

        await asyncSetTimeout(0);

        await new GridRows(api, 'paragraph edit should keep aggregates exact').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" model:"Model Y" total:1999.98
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" model:"F-Series" total:1999.98
            · · ├─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" model:"Corolla" total:999.99
            · · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" model:"EQA" total:333.33
            · · │ ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" model:"500" total:333.33
            · · │ └── 6 LEAF id:6 ag-Grid-AutoColumn:"6" model:"Juke" total:333.33
            · · └─┬ 7 GROUP id:7 ag-Grid-AutoColumn:"7" model:"Corolla" total:999.99
            · · · ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" model:"EQA" total:333.33
            · · · ├── 9 LEAF id:9 ag-Grid-AutoColumn:"9" model:"500" total:333.33
            · · · └── 10 LEAF id:10 ag-Grid-AutoColumn:"10" model:"Juke" total:333.33
        `);
    });
});
