import type { GetDetailRowDataParams, GridOptions, IsMasterOpenByDefaultParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid master detail open by default (AG-11476)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const baseOptions = (): GridOptions => ({
        columnDefs: [{ field: 'k' }],
        masterDetail: true,
        rowData: [
            { k: '1', records: [{ x: 'a' }] },
            { k: '2', records: [{ x: 'b' }] },
        ],
        detailCellRendererParams: {
            detailGridOptions: {
                columnDefs: [{ field: 'x' }],
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                params.successCallback(params.data.records);
            },
        },
    });

    test('isMasterOpenByDefault expands only the matching master rows', async () => {
        const seen: { key: string; level: number; hasData: boolean }[] = [];
        const gridOptions: GridOptions = {
            ...baseOptions(),
            isMasterOpenByDefault: (params: IsMasterOpenByDefaultParams) => {
                seen.push({
                    key: params.data.k,
                    level: params.level,
                    hasData: params.rowNode.data === params.data,
                });
                return params.data.k === '1';
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:0 k:"1"
            │ └─┬ detail id:detail_0 k:"1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:0 x:"a"
            └── master collapsed id:1 k:"2"
        `);

        // params are populated correctly for each master row
        expect(seen).toEqual([
            { key: '1', level: 0, hasData: true },
            { key: '2', level: 0, hasData: true },
        ]);
    });

    test('masterDefaultExpanded expands master rows independently of groupDefaultExpanded', async () => {
        const gridOptions: GridOptions = {
            ...baseOptions(),
            groupDefaultExpanded: 0,
            masterDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:0 k:"1"
            │ └─┬ detail id:detail_0 k:"1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:0 x:"a"
            └─┬ master id:1 k:"2"
            · └─┬ detail id:detail_1 k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"b"
        `);
    });

    test('masterDefaultExpanded falls back to groupDefaultExpanded when not set', async () => {
        const gridOptions: GridOptions = {
            ...baseOptions(),
            groupDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:0 k:"1"
            │ └─┬ detail id:detail_0 k:"1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:0 x:"a"
            └─┬ master id:1 k:"2"
            · └─┬ detail id:detail_1 k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"b"
        `);
    });

    test('isGroupOpenByDefault does not expand master rows (non-breaking)', async () => {
        const gridOptions: GridOptions = {
            ...baseOptions(),
            isGroupOpenByDefault: () => true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:0 k:"1"
            └── master collapsed id:1 k:"2"
        `);
    });
});
