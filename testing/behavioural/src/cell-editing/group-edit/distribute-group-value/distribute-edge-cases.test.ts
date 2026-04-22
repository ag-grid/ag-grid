import type { GroupRowValueSetterParams } from 'ag-grid-community';

import { GridColumns } from '../../../test-utils';
import {
    GridRows,
    asyncSetTimeout,
    createGrid,
    createSimpleGrid,
    distributeGroupValue,
    editCell,
    gridsManager,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe('distributeGroupValue edge cases', () => {
    test('returns false for empty aggregatedChildren', () => {
        const result = distributeGroupValue({
            aggregatedChildren: [],
            column: {} as GroupRowValueSetterParams['column'],
            colDef: { aggFunc: 'sum' } as GroupRowValueSetterParams['colDef'],
            newValue: 100,
            oldValue: 0,
            data: undefined,
            eventSource: undefined,
            valueChanged: true,
            node: {} as GroupRowValueSetterParams['node'],
            api: {} as GroupRowValueSetterParams['api'],
            context: undefined,
        });
        expect(result).toBe(false);
    });

    test('non-numeric value with first aggFunc is suppressed by default', async () => {
        const api = await gridsManager.createGridAndWait('distribute-non-numeric', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'label',
                    field: 'label',
                    aggFunc: 'first',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', label: 'alpha' },
                { id: 'a2', region: 'R', country: 'C', label: 'beta' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('label', 'gamma', 'ui');
        await asyncSetTimeout(0);

        // first is non-distributable by default — children unchanged
        expect(api.getRowNode('a1')?.data?.label).toBe('alpha');
        expect(api.getRowNode('a2')?.data?.label).toBe('beta');

        await new GridRows(api, 'after suppressed non-numeric edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R label:"alpha"
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C label:"alpha"
            · · ├── LEAF id:a1 region:"R" country:"C" label:"alpha"
            · · └── LEAF id:a2 region:"R" country:"C" label:"beta"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── label "Label" width:200 aggFunc:first editable
        `);
    });

    test('editing leaf node does NOT trigger distributeGroupValue', async () => {
        const api = await createGrid('distribute-leaf-no-cascade');
        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        const parisNode = api.getRowNode('fr-paris')!;
        parisNode.setDataValue('amount', 999, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(999);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);

        await new GridRows(api, 'after leaf edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:1149
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:1029
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:999
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('setting group value to 0 distributes zeros', async () => {
        const api = await createGrid('distribute-zero');
        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 0, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(0);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(0);
        expect(franceNode.aggData?.amount).toBe(0);

        await new GridRows(api, 'after zero edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:120
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:0
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:0
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:0
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});

describe('distributeGroupValue single child and negative values', () => {
    test('single child group distributes entire value to the one child', async () => {
        const api = await gridsManager.createGridAndWait('distribute-single-child', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [{ id: 'a1', region: 'R', country: 'C', amount: 10 }],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 99);
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(99);
        expect(groupNode.aggData?.amount).toBe(99);

        await new GridRows(api, 'after single child edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:99
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:99
            · · └── LEAF id:a1 region:"R" country:"C" amount:99
        `);
    });

    test('setting group value to negative distributes negative values', async () => {
        const api = await createGrid('distribute-negative');

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', -60);
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(-30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(-30);
        expect(franceNode.aggData?.amount).toBe(-60);

        await new GridRows(api, 'after negative edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:60
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:-60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:-30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:-30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('increment mode with negative delta reduces child values', async () => {
        const api = await createGrid('distribute-negative-increment', {
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
        });

        // France has [30, 30] = 60, set to 40 → delta -20, each gets -10 → [20, 20]
        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 40);
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(20);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(20);
        expect(franceNode.aggData?.amount).toBe(40);

        await new GridRows(api, 'after negative increment edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:160
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:40
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:20
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:20
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});

describe('UI editing during-edit snapshots', () => {
    test('editCell shows editing indicator and completes correctly', async () => {
        const api = await createGrid('ui-edit-snapshots');
        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        const europeNode = api.getRowNode('row-group-region-Europe')!;

        api.setFocusedCell(europeNode.rowIndex!, 'amount');
        api.startEditingCell({ rowIndex: europeNode.rowIndex!, colKey: 'amount' });
        await asyncSetTimeout(0);

        await new GridRows(api, 'during edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler 🖍️ id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        api.stopEditing(true);
        await asyncSetTimeout(0);

        await editCell(api, europeNode, 'amount', '300');

        await new GridRows(api, 'after editCell').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:300
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:100
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:100
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:50
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:50
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:100
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:50
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:50
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('undo/redo restores state correctly', async () => {
        const api = await createGrid('ui-undo-redo');
        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;

        api.startEditingCell({ rowIndex: franceNode.rowIndex!, colKey: 'amount' });
        await asyncSetTimeout(0);
        api.stopEditing(true);
        await asyncSetTimeout(0);

        await editCell(api, franceNode, 'amount', '200');

        const afterEditSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:320
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:200
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:100
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:100
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;
        await new GridRows(api, 'after edit').check(afterEditSnapshot);

        api.undoCellEditing();
        await asyncSetTimeout(0);
        await new GridRows(api, 'after undo').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        api.redoCellEditing();
        await asyncSetTimeout(0);
        await new GridRows(api, 'after redo').check(afterEditSnapshot);
    });
});

describe('special number values', () => {
    test('Infinity, -Infinity, NaN, undefined, and zero distribute correctly', async () => {
        const api = await createSimpleGrid(
            'special-values',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;

        // Infinity / 2 = Infinity for each child; aggSum(Infinity, Infinity) = Infinity
        group.setDataValue('amount', Infinity, 'ui');
        await asyncSetTimeout(0);
        expect(api.getRowNode('a1')?.data?.amount).toBe(Infinity);
        expect(api.getRowNode('a2')?.data?.amount).toBe(Infinity);
        expect(group.aggData?.amount).toBe(Infinity);
        await new GridRows(api, 'after Infinity').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:Infinity
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:Infinity
            · · ├── LEAF id:a1 region:"R" country:"C" amount:Infinity
            · · └── LEAF id:a2 region:"R" country:"C" amount:Infinity
        `);

        // -Infinity / 2 = -Infinity; aggSum(-Infinity, -Infinity) = -Infinity
        group.setDataValue('amount', -Infinity, 'ui');
        await asyncSetTimeout(0);
        expect(api.getRowNode('a1')?.data?.amount).toBe(-Infinity);
        expect(api.getRowNode('a2')?.data?.amount).toBe(-Infinity);
        expect(group.aggData?.amount).toBe(-Infinity);
        await new GridRows(api, 'after -Infinity').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:-Infinity
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:-Infinity
            · · ├── LEAF id:a1 region:"R" country:"C" amount:-Infinity
            · · └── LEAF id:a2 region:"R" country:"C" amount:-Infinity
        `);

        // NaN / 2 = NaN; aggSum(NaN, NaN) = NaN. The number value formatter displays NaN as "Invalid Number".
        group.setDataValue('amount', NaN, 'ui');
        await asyncSetTimeout(0);
        expect(api.getRowNode('a1')?.data?.amount).toBeNaN();
        expect(api.getRowNode('a2')?.data?.amount).toBeNaN();
        expect(group.aggData?.amount).toBeNaN();
        await new GridRows(api, 'after NaN').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:"Invalid Number"
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:"Invalid Number"
            · · ├── LEAF id:a1 region:"R" country:"C" amount:"Invalid Number"
            · · └── LEAF id:a2 region:"R" country:"C" amount:"Invalid Number"
        `);

        // undefined is non-numeric → passthrough writes raw value; aggSum skips non-numeric → null
        group.setDataValue('amount', undefined, 'ui');
        await asyncSetTimeout(0);
        expect(api.getRowNode('a1')?.data?.amount).toBeUndefined();
        expect(api.getRowNode('a2')?.data?.amount).toBeUndefined();
        expect(group.aggData?.amount).toBeNull();

        // 0 is a valid number → distributes as 0/2 = 0 per child
        group.setDataValue('amount', 0, 'ui');
        await asyncSetTimeout(0);
        await new GridRows(api, 'after zero').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:0
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:0
            · · ├── LEAF id:a1 region:"R" country:"C" amount:0
            · · └── LEAF id:a2 region:"R" country:"C" amount:0
        `);
    });

    test('increment with zero delta makes no changes', async () => {
        const api = await createSimpleGrid(
            'special-zero-delta',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }) }
        );

        // Set to same value as current sum (30) → delta = 0
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 30, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after zero delta').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:30
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);
    });

    test('percentage with very large numbers uses overflow-safe path', async () => {
        const api = await createSimpleGrid(
            'special-very-large-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 1e200 },
                { id: 'a2', region: 'R', country: 'C', amount: 3e200 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 8e200, 'ui');
        await asyncSetTimeout(0);

        // [1e200, 3e200] total=4e200, target=8e200, scale=2 → [2e200, 6e200]
        expect(api.getRowNode('a1')?.data?.amount).toBeCloseTo(2e200, -185);
        expect(api.getRowNode('a2')?.data?.amount).toBeCloseTo(6e200, -185);
    });
});
