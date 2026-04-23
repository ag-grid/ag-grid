import { ClientSideRowModelModule, PaginationModule, PinnedRowModule } from 'ag-grid-community';
import type { GridApi, RowNode, RowPinnedType } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

function assertPinnedRows(api: GridApi, floating: NonNullable<RowPinnedType>, ids: any[]): void {
    const pinnedNodes: RowNode[] = [];
    api.forEachPinnedRow(floating, (node) => {
        pinnedNodes.push(node as RowNode);
    });

    expect(pinnedNodes).toHaveLength(ids.length);
    expect(pinnedNodes.map((p) => p.id)).toEqual(ids);
}

describe('ag-grid tree data pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [PinnedRowModule, ClientSideRowModelModule, TreeDataModule, PaginationModule],
    });

    const columnDefs = [{ field: 'name' }, { field: 'amount', aggFunc: 'sum' }];

    const rowData = [
        { id: 'europe', path: ['Europe'], name: 'Europe', amount: null },
        { id: 'france', path: ['Europe', 'France'], name: 'France', amount: null },
        { id: 'paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 100 },
        { id: 'lyon', path: ['Europe', 'France', 'Lyon'], name: 'Lyon', amount: 200 },
        { id: 'germany', path: ['Europe', 'Germany'], name: 'Germany', amount: null },
        { id: 'berlin', path: ['Europe', 'Germany', 'Berlin'], name: 'Berlin', amount: 150 },
        { id: 'asia', path: ['Asia'], name: 'Asia', amount: null },
        { id: 'japan', path: ['Asia', 'Japan'], name: 'Japan', amount: null },
        { id: 'tokyo', path: ['Asia', 'Japan', 'Tokyo'], name: 'Tokyo', amount: 300 },
    ];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pinned tree node is unpinned when source node is destroyed via transaction remove', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - France is pinned
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:300 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');

        // Get reference to the source node
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();

        // Remove France and all its children
        api.applyTransaction({
            remove: [{ id: 'france' }, { id: 'paris' }, { id: 'lyon' }],
        });
        await asyncSetTimeout(10);

        // France node should be destroyed, and pinned row should be removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:150
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getRowNode('france')).toBeUndefined();
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceNode!.destroyed).toBe(true);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── name "Name" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
    });

    test('pinned tree node survives when some children are removed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:300 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();
        expect(franceNode!.destroyed).toBe(false);

        // Remove only Paris (one child)
        api.applyTransaction({
            remove: [{ id: 'paris' }],
        });
        await asyncSetTimeout(10);

        await new GridRows(api, 'after remove paris').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:200 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:350
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:200
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedFrance = api.getPinnedTopRow(0);
        expect(pinnedFrance?.key).toBe('France');
        expect(franceNode!.destroyed).toBe(false);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── name "Name" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
    });

    test('multiple pinned tree nodes are unpinned when their source nodes are destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => {
                if (node.key === 'France') {
                    return 'top';
                }
                if (node.key === 'Japan') {
                    return 'bottom';
                }
                return null;
            },
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:300 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            PINNED_BOTTOM id:b-bottom-japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300 path:["Asia","Japan"]
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        // Remove France and Japan with all their children
        api.applyTransaction({
            remove: [{ id: 'france' }, { id: 'paris' }, { id: 'lyon' }, { id: 'japan' }, { id: 'tokyo' }],
        });
        await asyncSetTimeout(10);

        // Both pinned rows should be removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:150
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └── Asia LEAF id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:null
        `);

        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRowCount()).toBe(0);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── name "Name" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
    });

    test('pinned tree node is unpinned when source node is destroyed via setRowData', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:300 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const franceNode = api.getRowNode('france');
        expect(franceNode).toBeDefined();

        // Replace row data without France (and its children)
        api.setGridOption(
            'rowData',
            rowData.filter((r) => !r.path.includes('France'))
        );
        await asyncSetTimeout(10);

        // France node should be destroyed and pinned row removed
        await new GridRows(api, 'after setRowData').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:150
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(franceNode!.destroyed).toBe(true);
    });

    test('pinned leaf node in tree is unpinned when destroyed', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'Paris' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify initial state - Paris (a leaf node) is pinned
        await new GridRows(api, 'initial').check(`
            PINNED_TOP id:t-top-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100 path:["Europe","France","Paris"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        const pinnedParis = api.getPinnedTopRow(0);
        expect(pinnedParis?.key).toBe('Paris');

        // Get reference to the source node
        const parisNode = api.getRowNode('paris');
        expect(parisNode).toBeDefined();

        // Remove Paris
        api.applyTransaction({
            remove: [{ id: 'paris' }],
        });
        await asyncSetTimeout(10);

        // Paris should be destroyed and pinned row removed
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:350
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:200
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(parisNode!.destroyed).toBe(true);
    });

    test('pinnedSibling references are correctly set up for tree nodes', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            enableRowPinning: true,
            isRowPinned: (node) => (node.key === 'France' ? 'top' : null),
            getRowId: (params) => params.data.id,
        });

        // Verify grid state
        await new GridRows(api, 'state').check(`
            PINNED_TOP id:t-top-france ag-Grid-AutoColumn:"France" name:"France" amount:300 path:["Europe","France"]
            ROOT id:ROOT_NODE_ID
            ├─┬ Europe GROUP id:europe ag-Grid-AutoColumn:"Europe" name:"Europe" amount:450
            │ ├─┬ France GROUP id:france ag-Grid-AutoColumn:"France" name:"France" amount:300
            │ │ ├── Paris LEAF id:paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
            │ │ └── Lyon LEAF id:lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
            │ └─┬ Germany GROUP id:germany ag-Grid-AutoColumn:"Germany" name:"Germany" amount:150
            │ · └── Berlin LEAF id:berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            └─┬ Asia GROUP id:asia ag-Grid-AutoColumn:"Asia" name:"Asia" amount:300
            · └─┬ Japan GROUP id:japan ag-Grid-AutoColumn:"Japan" name:"Japan" amount:300
            · · └── Tokyo LEAF id:tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
        `);

        assertPinnedRows(api, 'top', ['t-top-france']);

        const pinnedFrance = api.getPinnedTopRow(0);
        const franceNode = api.getRowNode('france');

        // Verify both nodes exist
        expect(pinnedFrance).toBeDefined();
        expect(franceNode).toBeDefined();

        // Verify row properties
        expect(pinnedFrance?.rowPinned).toBe('top');
        expect(franceNode?.rowPinned).toBeFalsy();
    });
});
