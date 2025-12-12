import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, setRowDataChecked } from '../../test-utils';

describe('ag-grid parentId tree expanded state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
        gridsManager.reset();
    });

    // Test for AG-12591
    test('When removing a group expanded state is retained', async () => {
        const originalRowData = getOrgHierarchyData();
        let yooCounter = 0;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'jobTitle' }, { field: 'employmentType' }],
            autoGroupColumnDef: {
                headerName: 'Name',
                valueGetter: (params) => params.data?.name ?? 'unknown',
            },
            treeData: true,
            treeDataParentIdField: 'parentId',
            animateRows: false,
            rowData: originalRowData,
            getRowId: ({ data }) => data.id,
            onRowGroupOpened: ({ data }) => {
                if (!data) {
                    return;
                }
                const yoo = `yoo-${++yooCounter}`;

                const oldRowData = api.getGridOption('rowData')!;

                oldRowData.push({ ...data, id: yoo, parentId: data.id });

                //data.children = [...data.children, { ...data, id: yoo, children: [] }];

                setRowDataChecked(api, oldRowData);
            },
        });

        await asyncSetTimeout(1);

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"unknown"
            └─┬ 0 GROUP collapsed id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · └─┬ 1 GROUP collapsed hidden id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · · ├─┬ 2 GROUP collapsed hidden id:2 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · · │ └─┬ 3 GROUP collapsed hidden id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · · │ · ├── 4 LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · · │ · └── 5 LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · · ├── 6 LEAF hidden id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · · └─┬ 7 GROUP collapsed hidden id:7 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · · · ├── 8 LEAF hidden id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · · · ├── 9 LEAF hidden id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · ├── 10 LEAF hidden id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · └── 11 LEAF hidden id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
        `);

        api.getRowNode('0')!.setExpanded(true, undefined, true);
        api.getRowNode('1')!.setExpanded(true, undefined, true);

        await asyncSetTimeout(1);

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"unknown"
            └─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ 2 GROUP collapsed id:2 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ └─┬ 3 GROUP collapsed hidden id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ · ├── 4 LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ · └── 5 LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ ├── 6 LEAF id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ ├─┬ 7 GROUP collapsed id:7 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ │ ├── 8 LEAF hidden id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ │ ├── 9 LEAF hidden id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── 10 LEAF hidden id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ └── 11 LEAF hidden id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ └── yoo-2 LEAF id:yoo-2 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── yoo-1 LEAF id:yoo-1 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
        `);

        api.getRowNode('7')!.setExpanded(true, undefined, true);
        api.getRowNode('2')!.setExpanded(true, undefined, true);

        await asyncSetTimeout(1);

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"unknown"
            └─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ ├─┬ 3 GROUP collapsed id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ │ ├── 4 LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ │ └── 5 LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ │ └── yoo-4 LEAF id:yoo-4 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ ├── 6 LEAF id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ ├─┬ 7 GROUP id:7 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ │ ├── 8 LEAF id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ │ ├── 9 LEAF id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── 10 LEAF id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── 11 LEAF id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ │ └── yoo-3 LEAF id:yoo-3 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ └── yoo-2 LEAF id:yoo-2 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── yoo-1 LEAF id:yoo-1 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
        `);
    });

    test('groupDefaultExpanded = 1', async () => {
        const rowData = [
            { x: 'A', parentId: null },
            { x: 'B', parentId: 'A' },
            { x: 'C', parentId: undefined },
            { x: 'D', parentId: 'C' },
            { x: 'E' },
            { x: 'F', parentId: 'E' },
            { x: 'G', parentId: 'F' },
            { x: 'H', parentId: 'G' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            autoGroupColumnDef: { headerName: 'tree' },
            animateRows: false,
            groupDefaultExpanded: 1,
            rowData,
            getRowId: (params) => params.data.x,
        });

        const gridRows = new GridRows(api, 'default expanded 1');

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" x:"A"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B" x:"B"
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C" x:"C"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D" x:"D"
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" x:"E"
            · └─┬ F GROUP collapsed id:F ag-Grid-AutoColumn:"F" x:"F"
            · · └─┬ G GROUP collapsed hidden id:G ag-Grid-AutoColumn:"G" x:"G"
            · · · └── H LEAF hidden id:H ag-Grid-AutoColumn:"H" x:"H"
        `);
    });

    test('groupDefaultExpanded callback', async () => {
        const rowData = [
            { x: 'A', parentId: null },
            { x: 'B', parentId: 'A' },
            { x: 'C', parentId: 'B' },
            { x: 'D', parentId: 'C' },
            { x: 'E' },
            { x: 'F', parentId: 'E' },
            { x: 'G', parentId: 'F' },
            { x: 'H', parentId: 'G' },
        ];

        const calls: { key: string; level: number }[] = [];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            autoGroupColumnDef: { headerName: 'tree' },
            animateRows: false,
            isGroupOpenByDefault: (params) => {
                calls.push({ key: params.key, level: params.level });
                return params.level < 2;
            },
            rowData,
            getRowId: (params) => params.data.x,
        });

        const gridRows = new GridRows(api, 'default expanded 1');

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" x:"A"
            │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" x:"B"
            │ · └─┬ C GROUP collapsed id:C ag-Grid-AutoColumn:"C" x:"C"
            │ · · └── D LEAF hidden id:D ag-Grid-AutoColumn:"D" x:"D"
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" x:"E"
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" x:"F"
            · · └─┬ G GROUP collapsed id:G ag-Grid-AutoColumn:"G" x:"G"
            · · · └── H LEAF hidden id:H ag-Grid-AutoColumn:"H" x:"H"
        `);

        calls.sort((a, b) => a.key.localeCompare(b.key));

        const callsObj = Object.fromEntries(calls.map((call) => [call.key, call.level]));

        expect(callsObj).toEqual({
            A: 0,
            B: 1,
            C: 2,
            E: 0,
            F: 1,
            G: 2,
        });
    });
});

function getOrgHierarchyData() {
    return [
        {
            id: '1',
            name: 'Malcolm Barrett',
            jobTitle: 'Exec. Vice President',
            employmentType: 'Permanent',
            parentId: '0',
        },
        {
            id: '2',
            name: 'Esther Baker',
            jobTitle: 'Director of Operations',
            employmentType: 'Permanent',
            parentId: '1',
        },
        {
            id: '3',
            name: 'Brittany Hanson',
            jobTitle: 'Fleet Coordinator',
            employmentType: 'Permanent',
            parentId: '2',
        },
        {
            id: '4',
            name: 'Leah Flowers',
            jobTitle: 'Parts Technician',
            employmentType: 'Contract',
            parentId: '3',
        },
        {
            id: '0',
            name: 'Erica Rogers',
            jobTitle: 'CEO',
            employmentType: 'Permanent',
        },
        {
            id: '5',
            name: 'Tammy Sutton',
            jobTitle: 'Service Technician',
            employmentType: 'Contract',
            parentId: '3',
        },
        {
            id: '6',
            name: 'Derek Paul',
            jobTitle: 'Inventory Control',
            employmentType: 'Permanent',
            parentId: '1',
        },
        {
            id: '7',
            name: 'Francis Strickland',
            jobTitle: 'VP Sales',
            employmentType: 'Permanent',
            parentId: '1',
        },
        {
            id: '8',
            name: 'Morris Hanson',
            jobTitle: 'Sales Manager',
            employmentType: 'Permanent',
            parentId: '7',
        },
        {
            id: '9',
            name: 'Todd Tyler',
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
            parentId: '7',
        },
        {
            id: '10',
            name: 'Bennie Wise',
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
            parentId: '7',
        },
        {
            id: '11',
            name: 'Joel Cooper',
            jobTitle: 'Sales Executive',
            employmentType: 'Permanent',
            parentId: '7',
        },
    ];
}
