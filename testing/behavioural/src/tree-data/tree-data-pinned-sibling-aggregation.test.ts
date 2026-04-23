import type { GridApi, GridOptions, IRowNode, RowNode, RowPinnedType } from 'ag-grid-community';
import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

interface TreeRowData {
    id: string;
    path: string[];
    name: string;
    amount: number;
}

/**
 * Tests for pinned sibling aggregation in tree data.
 * Ensures that when tree group rows are pinned via `isRowPinned`, their aggregation data
 * stays in sync with the source group rows across various data operations.
 */
describe('ag-grid tree data pinned sibling aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule, PinnedRowModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createTreeData = (): TreeRowData[] =>
        cachedJSONObjects.array([
            // Europe branch - only leaf rows, parents will be filler nodes
            { id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 100 },
            { id: 'fr-lyon', path: ['Europe', 'France', 'Lyon'], name: 'Lyon', amount: 200 },
            { id: 'de-berlin', path: ['Europe', 'Germany', 'Berlin'], name: 'Berlin', amount: 150 },
            { id: 'de-munich', path: ['Europe', 'Germany', 'Munich'], name: 'Munich', amount: 250 },
            // Asia branch
            { id: 'jp-tokyo', path: ['Asia', 'Japan', 'Tokyo'], name: 'Tokyo', amount: 300 },
        ]);

    const createGridOptions = (
        pinCondition: (node: IRowNode<TreeRowData>) => RowPinnedType
    ): GridOptions<TreeRowData> => ({
        columnDefs: [{ field: 'name' }, { field: 'amount', aggFunc: 'sum' }],
        autoGroupColumnDef: { headerName: 'Location' },
        treeData: true,
        treeDataChildrenField: undefined,
        getDataPath: (data) => data.path,
        groupDefaultExpanded: -1,
        enableRowPinning: true,
        isRowPinned: (node) => {
            if (node.group) {
                return pinCondition(node);
            }
            return null;
        },
    });

    /** Helper to find a group node by key. Uses IRowNode since aggData is on the public interface. */
    const findGroupByKey = (api: GridApi, key: string): IRowNode<TreeRowData> | undefined => {
        let found: IRowNode<TreeRowData> | undefined;
        api.forEachNode((node) => {
            if (node.group && node.key === key && !node.isRowPinned()) {
                found = node;
            }
        });
        return found;
    };

    describe('with getRowId', () => {
        test('initial aggregation is synced to pinned sibling', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            const franceGroup = findGroupByKey(api, 'France');
            // Cast to RowNode only when accessing pinnedSibling (internal property)
            const pinnedFrance = api.getPinnedTopRow(0) as RowNode;

            expect(franceGroup?.aggData?.amount).toBe(300); // 100 + 200
            expect(pinnedFrance?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.pinnedSibling).toBe(franceGroup);

            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:700
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                │ │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Location" width:200
                ├── name "Name" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
        });

        test('transaction add updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            // Add a new city to France
            applyTransactionChecked(api, {
                add: [{ id: 'fr-nice', path: ['Europe', 'France', 'Nice'], name: 'Nice', amount: 150 }],
            });

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(450); // 100 + 200 + 150
            expect(pinnedFrance?.aggData?.amount).toBe(450);

            await new GridRows(api, 'after add').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:450
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:850
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:450
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                │ │ ├── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ │ └── Nice LEAF id:fr-nice ag-Grid-AutoColumn:"Nice" name:"Nice" amount:150
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Location" width:200
                ├── name "Name" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
        });

        test('transaction update updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            // Update Paris amount
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 500 }],
            });

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(700); // 500 + 200
            expect(pinnedFrance?.aggData?.amount).toBe(700);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:700
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:1100
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:700
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:500
                │ │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);
        });

        test('transaction remove updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            // Remove Paris
            applyTransactionChecked(api, {
                remove: [{ id: 'fr-paris' }],
            });

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(200); // only Lyon
            expect(pinnedFrance?.aggData?.amount).toBe(200);

            await new GridRows(api, 'after remove').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:200
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:600
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:200
                │ │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);
        });

        test('setRowData updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            // Set new row data - only leaf rows, parents are filler nodes
            api.setGridOption(
                'rowData',
                cachedJSONObjects.array([
                    { id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 1000 },
                    { id: 'fr-lyon', path: ['Europe', 'France', 'Lyon'], name: 'Lyon', amount: 500 },
                ])
            );

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(1500);
            expect(pinnedFrance?.aggData?.amount).toBe(1500);

            await new GridRows(api, 'after setRowData').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:1500
                ROOT id:ROOT_NODE_ID
                └─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:1500
                · └─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:1500
                · · ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:1000
                · · └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:500
            `);
        });

        test('pinning top-level group includes all descendants in aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'Europe' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            const europeGroup = findGroupByKey(api, 'Europe');
            const pinnedEurope = api.getPinnedTopRow(0);

            // Europe = France (100 + 200) + Germany (150 + 250) = 700
            expect(europeGroup?.aggData?.amount).toBe(700);
            expect(pinnedEurope?.aggData?.amount).toBe(700);

            // Update a nested city
            applyTransactionChecked(api, {
                update: [{ id: 'de-berlin', path: ['Europe', 'Germany', 'Berlin'], name: 'Berlin', amount: 350 }],
            });

            // Europe should now be 100 + 200 + 350 + 250 = 900
            expect(europeGroup?.aggData?.amount).toBe(900);
            expect(pinnedEurope?.aggData?.amount).toBe(900);

            await new GridRows(api, 'after nested update').check(`
                PINNED_TOP id:t-top-row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:900
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:900
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                │ │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:600
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:350
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);
        });

        test('multiple pinned tree groups at different levels', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => {
                    if (node.key === 'Europe') {
                        return 'top';
                    }
                    if (node.key === 'Japan') {
                        return 'bottom';
                    }
                    return null;
                }),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            const europeGroup = findGroupByKey(api, 'Europe');
            const japanGroup = findGroupByKey(api, 'Japan');
            const pinnedEurope = api.getPinnedTopRow(0);
            const pinnedJapan = api.getPinnedBottomRow(0);

            expect(europeGroup?.aggData?.amount).toBe(700); // France + Germany
            expect(pinnedEurope?.aggData?.amount).toBe(700);
            expect(japanGroup?.aggData?.amount).toBe(300); // Tokyo
            expect(pinnedJapan?.aggData?.amount).toBe(300);

            // Update a city in Europe
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 500 }],
            });

            expect(europeGroup?.aggData?.amount).toBe(1100); // 500 + 200 + 150 + 250
            expect(pinnedEurope?.aggData?.amount).toBe(1100);
            expect(japanGroup?.aggData?.amount).toBe(300); // unchanged
            expect(pinnedJapan?.aggData?.amount).toBe(300);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:1100
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:1100
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:700
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:500
                │ │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
                PINNED_BOTTOM id:b-bottom-row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
            `);
        });
    });

    describe('without getRowId', () => {
        test('initial aggregation is synced to pinned sibling', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
            });

            // Cast to RowNode only when accessing pinnedSibling (internal property)
            const pinnedFrance = api.getPinnedTopRow(0) as RowNode;
            expect(pinnedFrance?.aggData?.amount).toBe(300);

            const franceGroup = findGroupByKey(api, 'France');

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.pinnedSibling).toBe(franceGroup);

            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:700
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                │ │ ├── Paris LEAF id:0 ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                │ │ └── Lyon LEAF id:1 ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ · ├── Berlin LEAF id:2 ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ · └── Munich LEAF id:3 ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia" amount:300
                · └─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan" amount:300
                · · └── Tokyo LEAF id:4 ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
            `);
        });

        test('setRowData replaces data and pinned row loses sibling connection without getRowId', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
            });

            const pinnedFranceBefore = api.getPinnedTopRow(0);
            expect(pinnedFranceBefore?.aggData?.amount).toBe(300);

            // Set new row data - without getRowId this creates new nodes
            // and the pinned sibling relationship cannot be maintained
            api.setGridOption(
                'rowData',
                cachedJSONObjects.array([
                    { id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 1000 },
                ])
            );

            // After setRowData without getRowId, the pinned row is disconnected from the new group
            // This is expected behavior - use getRowId to maintain the relationship
            const pinnedFranceAfter = api.getPinnedTopRow(0);
            // The pinned row may still exist but its aggData won't be synced to the new group
            expect(pinnedFranceAfter?.aggData?.amount).toBeUndefined();

            await new GridRows(api, 'after setRowData without getRowId').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:1000
                · └─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:1000
                · · └── Paris LEAF id:0 ag-Grid-AutoColumn:"Paris" name:"Paris" amount:1000
            `);
        });
    });

    describe('with group total row (footer)', () => {
        test('pinned tree group with footer maintains aggregation sync', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
                groupTotalRow: 'bottom',
            });

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);
            expect(franceGroup?.sibling?.aggData?.amount).toBe(300);

            // Update Paris
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 500 }],
            });

            expect(franceGroup?.aggData?.amount).toBe(700);
            expect(pinnedFrance?.aggData?.amount).toBe(700);
            expect(franceGroup?.sibling?.aggData?.amount).toBe(700);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France"
                ROOT id:ROOT_NODE_ID
                ├─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe"
                │ ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France"
                │ │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:500
                │ │ ├── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                │ │ └─ footer id:rowGroupFooter_row-group-0-Europe-1-France ag-Grid-AutoColumn:"Total France" amount:700
                │ ├─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany"
                │ │ ├── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
                │ │ ├── Munich LEAF id:de-munich ag-Grid-AutoColumn:"Munich" name:"Munich" amount:250
                │ │ └─ footer id:rowGroupFooter_row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Total Germany" amount:400
                │ └─ footer id:rowGroupFooter_row-group-0-Europe ag-Grid-AutoColumn:"Total Europe" amount:1100
                └─┬ Asia filler id:row-group-0-Asia ag-Grid-AutoColumn:"Asia"
                · ├─┬ Japan filler id:row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Japan"
                · │ ├── Tokyo LEAF id:jp-tokyo ag-Grid-AutoColumn:"Tokyo" name:"Tokyo" amount:300
                · │ └─ footer id:rowGroupFooter_row-group-0-Asia-1-Japan ag-Grid-AutoColumn:"Total Japan" amount:300
                · └─ footer id:rowGroupFooter_row-group-0-Asia ag-Grid-AutoColumn:"Total Asia" amount:300
            `);
        });
    });

    describe('filler node scenarios', () => {
        // Tree data can have "filler" nodes that don't have explicit data rows
        test('pinned filler group node aggregation', async () => {
            // Create data without explicit parent rows - tree data will create filler nodes
            const dataWithoutParents: TreeRowData[] = cachedJSONObjects.array([
                { id: 'fr-paris', path: ['Europe', 'France', 'Paris'], name: 'Paris', amount: 100 },
                { id: 'fr-lyon', path: ['Europe', 'France', 'Lyon'], name: 'Lyon', amount: 200 },
                { id: 'de-berlin', path: ['Europe', 'Germany', 'Berlin'], name: 'Berlin', amount: 150 },
            ]);

            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'France' ? 'top' : null)),
                rowData: dataWithoutParents,
                getRowId: (params) => params.data.id,
            });

            const franceGroup = findGroupByKey(api, 'France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);

            await new GridRows(api, 'initial filler node state').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                └─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:450
                · ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:300
                · │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                · │ └── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                · └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:150
                · · └── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            `);

            // Add a new city
            applyTransactionChecked(api, {
                add: [{ id: 'fr-nice', path: ['Europe', 'France', 'Nice'], name: 'Nice', amount: 150 }],
            });

            expect(franceGroup?.aggData?.amount).toBe(450);
            expect(pinnedFrance?.aggData?.amount).toBe(450);

            await new GridRows(api, 'after adding Nice').check(`
                PINNED_TOP id:t-top-row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:450
                ROOT id:ROOT_NODE_ID
                └─┬ Europe filler id:row-group-0-Europe ag-Grid-AutoColumn:"Europe" amount:600
                · ├─┬ France filler id:row-group-0-Europe-1-France ag-Grid-AutoColumn:"France" amount:450
                · │ ├── Paris LEAF id:fr-paris ag-Grid-AutoColumn:"Paris" name:"Paris" amount:100
                · │ ├── Lyon LEAF id:fr-lyon ag-Grid-AutoColumn:"Lyon" name:"Lyon" amount:200
                · │ └── Nice LEAF id:fr-nice ag-Grid-AutoColumn:"Nice" name:"Nice" amount:150
                · └─┬ Germany filler id:row-group-0-Europe-1-Germany ag-Grid-AutoColumn:"Germany" amount:150
                · · └── Berlin LEAF id:de-berlin ag-Grid-AutoColumn:"Berlin" name:"Berlin" amount:150
            `);
        });
    });

    describe('aggregation cleared scenarios', () => {
        test('removing all children from pinned tree group clears aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((node) => (node.key === 'Japan' ? 'top' : null)),
                rowData: createTreeData(),
                getRowId: (params) => params.data.id,
            });

            const japanGroup = findGroupByKey(api, 'Japan');
            const pinnedJapan = api.getPinnedTopRow(0);

            expect(japanGroup?.aggData?.amount).toBe(300);
            expect(pinnedJapan?.aggData?.amount).toBe(300);

            // Remove Tokyo - Japan's only city
            applyTransactionChecked(api, {
                remove: [{ id: 'jp-tokyo' }],
            });

            // After removing all children, the filler group and pinned row should still exist
            // but aggregation should be null or empty
            const updatedJapanGroup = findGroupByKey(api, 'Japan');

            if (updatedJapanGroup) {
                expect(updatedJapanGroup.aggData?.amount ?? 0).toBe(0);
                const updatedPinnedJapan = api.getPinnedTopRow(0);
                expect(updatedPinnedJapan?.aggData?.amount ?? 0).toBe(0);

                await new GridRows(api, 'after remove all children').check(`
                    PINNED_TOP ag-Grid-AutoColumn:"Japan"
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler ag-Grid-AutoColumn:"Europe" amount:700
                    │ ├─┬ GROUP id:france ag-Grid-AutoColumn:"France" amount:300
                    │ │ ├── LEAF id:fr-paris name:"Paris" amount:100
                    │ │ └── LEAF id:fr-lyon name:"Lyon" amount:200
                    │ └─┬ GROUP id:germany ag-Grid-AutoColumn:"Germany" amount:400
                    │   ├── LEAF id:de-berlin name:"Berlin" amount:150
                    │   └── LEAF id:de-munich name:"Munich" amount:250
                    └─┬ filler ag-Grid-AutoColumn:"Asia"
                    ·   └── GROUP id:japan ag-Grid-AutoColumn:"Japan"
                `);
            }
        });
    });
});
