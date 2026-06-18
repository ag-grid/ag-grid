import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions, RowDragMoveEvent } from 'ag-grid-community';
import { PaginationModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, RowDragDispatcher, TestGridsManager } from '../test-utils';

describe('ag-grid unmanaged drag and drop with pagination', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const generateRowData = () => {
        const rowData: { id: string; name: string }[] = [];
        for (let i = 0; i < 45; i++) {
            rowData.push({ id: `${i}`, name: `row${i}` });
        }
        return rowData;
    };

    test('correct overNode and overIndex in page 1', async () => {
        const columnDefs = [{ field: 'name', rowDrag: true }, { field: 'id' }];

        const rowDragMoveEvents: RowDragMoveEvent[] = [];

        const gridOptions: GridOptions = {
            columnDefs,
            rowData: generateRowData(),
            paginationPageSize: 20,
            pagination: true,
            animateRows: true,
            getRowId: (params) => params.data.id,
            onRowDragMove: (event) => {
                rowDragMoveEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `correct overNode and overIndex in page 1 setup`).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── id "Id" width:200
        `);
        await new GridRows(api, `correct overNode and overIndex in page 1 setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"row0" id:"0"
            ├── LEAF id:1 name:"row1" id:"1"
            ├── LEAF id:2 name:"row2" id:"2"
            ├── LEAF id:3 name:"row3" id:"3"
            ├── LEAF id:4 name:"row4" id:"4"
            ├── LEAF id:5 name:"row5" id:"5"
            ├── LEAF id:6 name:"row6" id:"6"
            ├── LEAF id:7 name:"row7" id:"7"
            ├── LEAF id:8 name:"row8" id:"8"
            ├── LEAF id:9 name:"row9" id:"9"
            ├── LEAF id:10 name:"row10" id:"10"
            ├── LEAF id:11 name:"row11" id:"11"
            ├── LEAF id:12 name:"row12" id:"12"
            ├── LEAF id:13 name:"row13" id:"13"
            ├── LEAF id:14 name:"row14" id:"14"
            ├── LEAF id:15 name:"row15" id:"15"
            ├── LEAF id:16 name:"row16" id:"16"
            ├── LEAF id:17 name:"row17" id:"17"
            ├── LEAF id:18 name:"row18" id:"18"
            ├── LEAF id:19 name:"row19" id:"19"
            ├── LEAF id:20 name:"row20" id:"20"
            ├── LEAF id:21 name:"row21" id:"21"
            ├── LEAF id:22 name:"row22" id:"22"
            ├── LEAF id:23 name:"row23" id:"23"
            ├── LEAF id:24 name:"row24" id:"24"
            ├── LEAF id:25 name:"row25" id:"25"
            ├── LEAF id:26 name:"row26" id:"26"
            ├── LEAF id:27 name:"row27" id:"27"
            ├── LEAF id:28 name:"row28" id:"28"
            ├── LEAF id:29 name:"row29" id:"29"
            ├── LEAF id:30 name:"row30" id:"30"
            ├── LEAF id:31 name:"row31" id:"31"
            ├── LEAF id:32 name:"row32" id:"32"
            ├── LEAF id:33 name:"row33" id:"33"
            ├── LEAF id:34 name:"row34" id:"34"
            ├── LEAF id:35 name:"row35" id:"35"
            ├── LEAF id:36 name:"row36" id:"36"
            ├── LEAF id:37 name:"row37" id:"37"
            ├── LEAF id:38 name:"row38" id:"38"
            ├── LEAF id:39 name:"row39" id:"39"
            ├── LEAF id:40 name:"row40" id:"40"
            ├── LEAF id:41 name:"row41" id:"41"
            ├── LEAF id:42 name:"row42" id:"42"
            ├── LEAF id:43 name:"row43" id:"43"
            └── LEAF id:44 name:"row44" id:"44"
        `);

        const rows = api.getRenderedNodes();
        expect(rows.length).toBe(20);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('4');
        await dispatcher.move('7');
        await dispatcher.finish();

        const lastMoveEvent = rowDragMoveEvents[rowDragMoveEvents.length - 1];
        expect(lastMoveEvent).toBeTruthy();

        expect(lastMoveEvent.node?.id).toBe('4');
        expect(lastMoveEvent.nodes.length).toBe(1);
        expect(lastMoveEvent.nodes[0].id).toBe('4');

        expect(lastMoveEvent.overNode?.id).toBe('7');
        expect(lastMoveEvent.overIndex).toBe(7);
        await new GridRows(api, `correct overNode and overIndex in page 1 final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"row0" id:"0"
            ├── LEAF id:1 name:"row1" id:"1"
            ├── LEAF id:2 name:"row2" id:"2"
            ├── LEAF id:3 name:"row3" id:"3"
            ├── LEAF id:4 name:"row4" id:"4"
            ├── LEAF id:5 name:"row5" id:"5"
            ├── LEAF id:6 name:"row6" id:"6"
            ├── LEAF id:7 name:"row7" id:"7"
            ├── LEAF id:8 name:"row8" id:"8"
            ├── LEAF id:9 name:"row9" id:"9"
            ├── LEAF id:10 name:"row10" id:"10"
            ├── LEAF id:11 name:"row11" id:"11"
            ├── LEAF id:12 name:"row12" id:"12"
            ├── LEAF id:13 name:"row13" id:"13"
            ├── LEAF id:14 name:"row14" id:"14"
            ├── LEAF id:15 name:"row15" id:"15"
            ├── LEAF id:16 name:"row16" id:"16"
            ├── LEAF id:17 name:"row17" id:"17"
            ├── LEAF id:18 name:"row18" id:"18"
            ├── LEAF id:19 name:"row19" id:"19"
            ├── LEAF id:20 name:"row20" id:"20"
            ├── LEAF id:21 name:"row21" id:"21"
            ├── LEAF id:22 name:"row22" id:"22"
            ├── LEAF id:23 name:"row23" id:"23"
            ├── LEAF id:24 name:"row24" id:"24"
            ├── LEAF id:25 name:"row25" id:"25"
            ├── LEAF id:26 name:"row26" id:"26"
            ├── LEAF id:27 name:"row27" id:"27"
            ├── LEAF id:28 name:"row28" id:"28"
            ├── LEAF id:29 name:"row29" id:"29"
            ├── LEAF id:30 name:"row30" id:"30"
            ├── LEAF id:31 name:"row31" id:"31"
            ├── LEAF id:32 name:"row32" id:"32"
            ├── LEAF id:33 name:"row33" id:"33"
            ├── LEAF id:34 name:"row34" id:"34"
            ├── LEAF id:35 name:"row35" id:"35"
            ├── LEAF id:36 name:"row36" id:"36"
            ├── LEAF id:37 name:"row37" id:"37"
            ├── LEAF id:38 name:"row38" id:"38"
            ├── LEAF id:39 name:"row39" id:"39"
            ├── LEAF id:40 name:"row40" id:"40"
            ├── LEAF id:41 name:"row41" id:"41"
            ├── LEAF id:42 name:"row42" id:"42"
            ├── LEAF id:43 name:"row43" id:"43"
            └── LEAF id:44 name:"row44" id:"44"
        `);
    });

    test('correct overNode and overIndex in page 2', async () => {
        const columnDefs = [{ field: 'name', rowDrag: true }, { field: 'id' }];

        const rowDragMoveEvents: RowDragMoveEvent[] = [];

        const gridOptions: GridOptions = {
            columnDefs,
            rowData: generateRowData(),
            paginationPageSize: 20,
            pagination: true,
            animateRows: true,
            getRowId: (params) => params.data.id,
            onRowDragMove: (event) => {
                rowDragMoveEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `correct overNode and overIndex in page 2 setup`).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── id "Id" width:200
        `);
        await new GridRows(api, `correct overNode and overIndex in page 2 setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"row0" id:"0"
            ├── LEAF id:1 name:"row1" id:"1"
            ├── LEAF id:2 name:"row2" id:"2"
            ├── LEAF id:3 name:"row3" id:"3"
            ├── LEAF id:4 name:"row4" id:"4"
            ├── LEAF id:5 name:"row5" id:"5"
            ├── LEAF id:6 name:"row6" id:"6"
            ├── LEAF id:7 name:"row7" id:"7"
            ├── LEAF id:8 name:"row8" id:"8"
            ├── LEAF id:9 name:"row9" id:"9"
            ├── LEAF id:10 name:"row10" id:"10"
            ├── LEAF id:11 name:"row11" id:"11"
            ├── LEAF id:12 name:"row12" id:"12"
            ├── LEAF id:13 name:"row13" id:"13"
            ├── LEAF id:14 name:"row14" id:"14"
            ├── LEAF id:15 name:"row15" id:"15"
            ├── LEAF id:16 name:"row16" id:"16"
            ├── LEAF id:17 name:"row17" id:"17"
            ├── LEAF id:18 name:"row18" id:"18"
            ├── LEAF id:19 name:"row19" id:"19"
            ├── LEAF id:20 name:"row20" id:"20"
            ├── LEAF id:21 name:"row21" id:"21"
            ├── LEAF id:22 name:"row22" id:"22"
            ├── LEAF id:23 name:"row23" id:"23"
            ├── LEAF id:24 name:"row24" id:"24"
            ├── LEAF id:25 name:"row25" id:"25"
            ├── LEAF id:26 name:"row26" id:"26"
            ├── LEAF id:27 name:"row27" id:"27"
            ├── LEAF id:28 name:"row28" id:"28"
            ├── LEAF id:29 name:"row29" id:"29"
            ├── LEAF id:30 name:"row30" id:"30"
            ├── LEAF id:31 name:"row31" id:"31"
            ├── LEAF id:32 name:"row32" id:"32"
            ├── LEAF id:33 name:"row33" id:"33"
            ├── LEAF id:34 name:"row34" id:"34"
            ├── LEAF id:35 name:"row35" id:"35"
            ├── LEAF id:36 name:"row36" id:"36"
            ├── LEAF id:37 name:"row37" id:"37"
            ├── LEAF id:38 name:"row38" id:"38"
            ├── LEAF id:39 name:"row39" id:"39"
            ├── LEAF id:40 name:"row40" id:"40"
            ├── LEAF id:41 name:"row41" id:"41"
            ├── LEAF id:42 name:"row42" id:"42"
            ├── LEAF id:43 name:"row43" id:"43"
            └── LEAF id:44 name:"row44" id:"44"
        `);

        api.paginationGoToPage(1);

        const rows = api.getRenderedNodes();
        expect(rows.length).toBe(20);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('24');
        await dispatcher.move('28');
        await dispatcher.finish();

        const lastMoveEvent = rowDragMoveEvents[rowDragMoveEvents.length - 1];
        expect(lastMoveEvent).toBeTruthy();

        expect(lastMoveEvent.node?.id).toBe('24');
        expect(lastMoveEvent.nodes.length).toBe(1);
        expect(lastMoveEvent.nodes[0].id).toBe('24');

        expect(lastMoveEvent.overNode?.id).toBe('28');
        expect(lastMoveEvent.overIndex).toBe(28);
        await new GridRows(api, `correct overNode and overIndex in page 2 final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"row0" id:"0"
            ├── LEAF id:1 name:"row1" id:"1"
            ├── LEAF id:2 name:"row2" id:"2"
            ├── LEAF id:3 name:"row3" id:"3"
            ├── LEAF id:4 name:"row4" id:"4"
            ├── LEAF id:5 name:"row5" id:"5"
            ├── LEAF id:6 name:"row6" id:"6"
            ├── LEAF id:7 name:"row7" id:"7"
            ├── LEAF id:8 name:"row8" id:"8"
            ├── LEAF id:9 name:"row9" id:"9"
            ├── LEAF id:10 name:"row10" id:"10"
            ├── LEAF id:11 name:"row11" id:"11"
            ├── LEAF id:12 name:"row12" id:"12"
            ├── LEAF id:13 name:"row13" id:"13"
            ├── LEAF id:14 name:"row14" id:"14"
            ├── LEAF id:15 name:"row15" id:"15"
            ├── LEAF id:16 name:"row16" id:"16"
            ├── LEAF id:17 name:"row17" id:"17"
            ├── LEAF id:18 name:"row18" id:"18"
            ├── LEAF id:19 name:"row19" id:"19"
            ├── LEAF id:20 name:"row20" id:"20"
            ├── LEAF id:21 name:"row21" id:"21"
            ├── LEAF id:22 name:"row22" id:"22"
            ├── LEAF id:23 name:"row23" id:"23"
            ├── LEAF id:24 name:"row24" id:"24"
            ├── LEAF id:25 name:"row25" id:"25"
            ├── LEAF id:26 name:"row26" id:"26"
            ├── LEAF id:27 name:"row27" id:"27"
            ├── LEAF id:28 name:"row28" id:"28"
            ├── LEAF id:29 name:"row29" id:"29"
            ├── LEAF id:30 name:"row30" id:"30"
            ├── LEAF id:31 name:"row31" id:"31"
            ├── LEAF id:32 name:"row32" id:"32"
            ├── LEAF id:33 name:"row33" id:"33"
            ├── LEAF id:34 name:"row34" id:"34"
            ├── LEAF id:35 name:"row35" id:"35"
            ├── LEAF id:36 name:"row36" id:"36"
            ├── LEAF id:37 name:"row37" id:"37"
            ├── LEAF id:38 name:"row38" id:"38"
            ├── LEAF id:39 name:"row39" id:"39"
            ├── LEAF id:40 name:"row40" id:"40"
            ├── LEAF id:41 name:"row41" id:"41"
            ├── LEAF id:42 name:"row42" id:"42"
            ├── LEAF id:43 name:"row43" id:"43"
            └── LEAF id:44 name:"row44" id:"44"
        `);
    });
});
