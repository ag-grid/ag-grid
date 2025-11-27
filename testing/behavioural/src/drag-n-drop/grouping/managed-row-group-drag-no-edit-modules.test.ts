import {
    CellApiModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    EventApiModule,
    RowApiModule,
    RowDragModule,
    RowSelectionModule,
    ValidationModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager } from '../../test-utils';

describe('managed row drag without edit modules', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: false,
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            RowDragModule,
            RowSelectionModule,
            RowGroupingModule,
            ColumnApiModule,
            EventApiModule,
            RowApiModule,
            CellApiModule,
            ValidationModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('moves a row between groups when edit modules are absent', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-no-edit-modules', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:"B1"
            · └── LEAF id:2 group:"B" value:"A2"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('B');
    });
});
