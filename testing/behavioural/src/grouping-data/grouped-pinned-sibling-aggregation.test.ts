import type { GridApi, GridOptions, IRowNode, RowNode, RowPinnedType } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, PinnedRowModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

interface RowData {
    id: string;
    country: string;
    amount: number;
}

/**
 * Tests for pinned sibling aggregation in row grouping.
 * Ensures that when group rows are pinned via `isRowPinned`, their aggregation data
 * stays in sync with the source group rows across various data operations.
 */
describe('ag-grid grouping pinned sibling aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, RowGroupingModule, PinnedRowModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createRowData = (): RowData[] =>
        cachedJSONObjects.array([
            { id: 'fr-paris', country: 'France', amount: 100 },
            { id: 'fr-lyon', country: 'France', amount: 200 },
            { id: 'de-berlin', country: 'Germany', amount: 150 },
            { id: 'de-hamburg', country: 'Germany', amount: 250 },
            { id: 'it-rome', country: 'Italy', amount: 300 },
        ]);

    const createGridOptions = (
        pinCondition: (country: string | null | undefined) => RowPinnedType
    ): GridOptions<RowData> => ({
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'amount', aggFunc: 'sum' },
        ],
        groupDefaultExpanded: -1,
        enableRowPinning: true,
        isRowPinned: (node) => {
            if (node.group) {
                return pinCondition(node.key);
            }
            return null;
        },
    });

    /** Helper to find a group node by key. Uses IRowNode since aggData is on the public interface. */
    const findGroupByKey = (api: GridApi, key: string): IRowNode<RowData> | undefined => {
        let found: IRowNode<RowData> | undefined;
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
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            // Cast to RowNode only when accessing pinnedSibling (internal property)
            const pinnedFrance = api.getPinnedTopRow(0) as RowNode;

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.pinnedSibling).toBe(franceGroup);

            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
        });

        test('transaction add updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            // Add a new row to France
            applyTransactionChecked(api, {
                add: [{ id: 'fr-nice', country: 'France', amount: 150 }],
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(450);
            expect(pinnedFrance?.aggData?.amount).toBe(450);

            await new GridRows(api, 'after add').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:450
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:450
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ ├── LEAF id:fr-lyon country:"France" amount:200
                │ └── LEAF id:fr-nice country:"France" amount:150
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
        });

        test('transaction update updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            // Update a France row
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', country: 'France', amount: 500 }],
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(700);
            expect(pinnedFrance?.aggData?.amount).toBe(700);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                │ ├── LEAF id:fr-paris country:"France" amount:500
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });

        test('transaction remove updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            // Remove a France row
            applyTransactionChecked(api, {
                remove: [{ id: 'fr-paris' }],
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(200);
            expect(pinnedFrance?.aggData?.amount).toBe(200);

            await new GridRows(api, 'after remove').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });

        test('setRowData updates pinned sibling aggregation', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            // Set new row data
            api.setGridOption(
                'rowData',
                cachedJSONObjects.array([
                    { id: 'fr-paris', country: 'France', amount: 1000 },
                    { id: 'fr-lyon', country: 'France', amount: 500 },
                ])
            );

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(1500);
            expect(pinnedFrance?.aggData?.amount).toBe(1500);

            await new GridRows(api, 'after setRowData').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:1500
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:1500
                · ├── LEAF id:fr-paris country:"France" amount:1000
                · └── LEAF id:fr-lyon country:"France" amount:500
            `);
        });

        test('multiple pinned groups maintain separate aggregations', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) =>
                    country === 'France' ? 'top' : country === 'Germany' ? 'bottom' : null
                ),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFranceTop = api.getPinnedTopRow(0);
            const germanyGroup = api.getRowNode('row-group-country-Germany');
            const pinnedGermanyBottom = api.getPinnedBottomRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFranceTop?.aggData?.amount).toBe(300);
            expect(germanyGroup?.aggData?.amount).toBe(400);
            expect(pinnedGermanyBottom?.aggData?.amount).toBe(400);

            // Update a France row
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', country: 'France', amount: 500 }],
            });

            expect(franceGroup?.aggData?.amount).toBe(700);
            expect(pinnedFranceTop?.aggData?.amount).toBe(700);
            expect(germanyGroup?.aggData?.amount).toBe(400); // unchanged
            expect(pinnedGermanyBottom?.aggData?.amount).toBe(400); // unchanged

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                │ ├── LEAF id:fr-paris country:"France" amount:500
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
            `);
        });
    });

    describe('without getRowId', () => {
        test('initial aggregation is synced to pinned sibling', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
            });

            // Cast to RowNode only when accessing pinnedSibling (internal property)
            const pinnedFrance = api.getPinnedTopRow(0) as RowNode;
            expect(pinnedFrance?.aggData?.amount).toBe(300);

            // Find the source France group using helper (returns IRowNode)
            const franceGroup = findGroupByKey(api, 'France');

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.pinnedSibling).toBe(franceGroup);

            await new GridRows(api, 'initial').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:0 country:"France" amount:100
                │ └── LEAF id:1 country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:2 country:"Germany" amount:150
                │ └── LEAF id:3 country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:4 country:"Italy" amount:300
            `);
        });

        test('setRowData replaces data and pinned row loses sibling connection without getRowId', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
            });

            const pinnedFranceBefore = api.getPinnedTopRow(0);
            expect(pinnedFranceBefore?.aggData?.amount).toBe(300);

            // Set new row data - without getRowId this creates new nodes
            // and the pinned sibling relationship cannot be maintained
            api.setGridOption(
                'rowData',
                cachedJSONObjects.array([
                    { id: 'fr-1', country: 'France', amount: 1000 },
                    { id: 'fr-2', country: 'France', amount: 500 },
                    { id: 'de-1', country: 'Germany', amount: 200 },
                ])
            );

            // After setRowData without getRowId, the pinned row is disconnected from the new group
            // This is expected behavior - use getRowId to maintain the relationship
            const pinnedFranceAfter = api.getPinnedTopRow(0);
            expect(pinnedFranceAfter?.aggData?.amount).toBeUndefined();

            await new GridRows(api, 'after setRowData without getRowId').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:1500
                │ ├── LEAF id:0 country:"France" amount:1000
                │ └── LEAF id:1 country:"France" amount:500
                └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:200
                · └── LEAF id:2 country:"Germany" amount:200
            `);
        });
    });

    describe('with group total row (footer)', () => {
        test('pinned group with footer maintains aggregation sync', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                groupTotalRow: 'bottom',
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);

            // The footer sibling should also have the same aggData
            expect(franceGroup?.sibling?.aggData?.amount).toBe(300);

            // Update a France row
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', country: 'France', amount: 500 }],
            });

            expect(franceGroup?.aggData?.amount).toBe(700);
            expect(pinnedFrance?.aggData?.amount).toBe(700);
            expect(franceGroup?.sibling?.aggData?.amount).toBe(700);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France"
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                │ ├── LEAF id:fr-paris country:"France" amount:500
                │ ├── LEAF id:fr-lyon country:"France" amount:200
                │ └─ footer id:rowGroupFooter_row-group-country-France ag-Grid-AutoColumn:"Total France" amount:700
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ ├── LEAF id:de-hamburg country:"Germany" amount:250
                │ └─ footer id:rowGroupFooter_row-group-country-Germany ag-Grid-AutoColumn:"Total Germany" amount:400
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                · ├── LEAF id:it-rome country:"Italy" amount:300
                · └─ footer id:rowGroupFooter_row-group-country-Italy ag-Grid-AutoColumn:"Total Italy" amount:300
            `);
        });
    });

    describe('with grand total row', () => {
        test('pinned grand total row maintains aggregation sync', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });

            const pinnedGrandTotal = api.getPinnedBottomRow(0);
            expect(pinnedGrandTotal?.aggData?.amount).toBe(1000); // 100+200+150+250+300

            // Update a row
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', country: 'France', amount: 500 }],
            });

            expect(pinnedGrandTotal?.aggData?.amount).toBe(1400); // 500+200+150+250+300

            await new GridRows(api, 'after update').check(`
                ROOT id:ROOT_NODE_ID amount:1400
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                │ ├── LEAF id:fr-paris country:"France" amount:500
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1400
            `);
        });

        test('combined pinned group and pinned grand total row', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);
            const pinnedGrandTotal = api.getPinnedBottomRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);
            expect(pinnedGrandTotal?.aggData?.amount).toBe(1000);

            // Update a France row
            applyTransactionChecked(api, {
                update: [{ id: 'fr-paris', country: 'France', amount: 500 }],
            });

            expect(franceGroup?.aggData?.amount).toBe(700);
            expect(pinnedFrance?.aggData?.amount).toBe(700);
            expect(pinnedGrandTotal?.aggData?.amount).toBe(1400);

            await new GridRows(api, 'after update').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                ROOT id:ROOT_NODE_ID amount:1400
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:700
                │ ├── LEAF id:fr-paris country:"France" amount:500
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1400
            `);
        });

        test('CSRM pinned grand total stays as a single row after filter change', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `CSRM pinned grand total stays as a single row after filter change setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after filter change setup`).check(
                `
                    ROOT id:ROOT_NODE_ID amount:1000
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                    │ ├── LEAF id:de-berlin country:"Germany" amount:150
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                `
            );

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            await api.setColumnFilterModel('amount', { filterType: 'number', type: 'greaterThanOrEqual', filter: 200 });
            api.onFilterChanged();

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(750);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after filter change final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID amount:750
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:250
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:750
                `); // lyon 200 + hamburg 250 + rome 300
        });

        test('CSRM pinned grand total stays as a single row after cycling position', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `CSRM pinned grand total stays as a single row after cycling position setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after cycling position setup`).check(
                `
                    ROOT id:ROOT_NODE_ID amount:1000
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                    │ ├── LEAF id:de-berlin country:"Germany" amount:150
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                `
            );

            expect(api.getPinnedBottomRowCount()).toBe(1);
            const firstPinned = api.getPinnedBottomRow(0)!;

            api.setGridOption('grandTotalRow', 'pinnedTop');
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow`
            ).check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
            expect(api.getPinnedBottomRowCount()).toBe(0);
            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(firstPinned.destroyed).toBe(true);
            const topPinned = api.getPinnedTopRow(0)!;

            api.setGridOption('grandTotalRow', undefined);
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #2`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
            expect(api.getPinnedBottomRowCount()).toBe(0);
            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(topPinned.destroyed).toBe(true);

            api.setGridOption('grandTotalRow', 'pinnedBottom');
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #3`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #3`
            ).check(`
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
            `);
            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.destroyed).toBe(false);
        });

        test('grouped CSRM pinnedBottom grand total repopulates after clearing rowData and adding via transaction', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            // Clear all rows via setGridOption, then repopulate via transaction
            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: createRowData() });

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            await new GridRows(api, 'after clear+add').check(`
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
            `);
        });

        test('grouped CSRM pinnedTop grand total repopulates after clearing rowData and adding via transaction', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedTop',
                groupDefaultExpanded: -1,
            });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(1000);

            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: createRowData() });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(1000);

            await new GridRows(api, 'after clear+add').check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });

        test('flat CSRM pinnedBottom grand total repopulates after clearing rowData and adding via transaction', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'amount', aggFunc: 'sum' }],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
            });

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: createRowData() });

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            await new GridRows(api, 'after clear+add').check(`
                ROOT id:ROOT_NODE_ID amount:1000
                ├── LEAF id:fr-paris amount:100
                ├── LEAF id:fr-lyon amount:200
                ├── LEAF id:de-berlin amount:150
                ├── LEAF id:de-hamburg amount:250
                └── LEAF id:it-rome amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID amount:1000
            `);
        });

        test('flat CSRM pinnedTop grand total repopulates after clearing rowData and adding via transaction', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'amount', aggFunc: 'sum' }],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedTop',
            });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(1000);

            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: createRowData() });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(1000);

            await new GridRows(api, 'after clear+add').check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID amount:1000
                ROOT id:ROOT_NODE_ID amount:1000
                ├── LEAF id:fr-paris amount:100
                ├── LEAF id:fr-lyon amount:200
                ├── LEAF id:de-berlin amount:150
                ├── LEAF id:de-hamburg amount:250
                └── LEAF id:it-rome amount:300
            `);
        });

        test('grouped CSRM pinnedTop grand total switches between views via setGridOption([]) + applyTransaction', async () => {
            const VIEW_A: RowData[] = cachedJSONObjects.array([
                { id: '1', country: 'Electronics', amount: 1000 },
                { id: '2', country: 'Electronics', amount: 2000 },
                { id: '3', country: 'Food', amount: 300 },
                { id: '4', country: 'Food', amount: 200 },
            ]);
            const VIEW_B: RowData[] = cachedJSONObjects.array([
                { id: '5', country: 'Clothing', amount: 500 },
                { id: '6', country: 'Clothing', amount: 700 },
                { id: '7', country: 'Books', amount: 150 },
                { id: '8', country: 'Books', amount: 400 },
            ]);

            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: VIEW_A,
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedTop',
                groupDefaultExpanded: -1,
            });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(3500);

            // Switch to VIEW_B using the pattern from the bug report
            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: VIEW_B });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(1750);

            await new GridRows(api, 'after switch to VIEW_B').check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1750
                ROOT id:ROOT_NODE_ID amount:1750
                ├─┬ LEAF_GROUP id:row-group-country-Clothing ag-Grid-AutoColumn:"Clothing" amount:1200
                │ ├── LEAF id:5 country:"Clothing" amount:500
                │ └── LEAF id:6 country:"Clothing" amount:700
                └─┬ LEAF_GROUP id:row-group-country-Books ag-Grid-AutoColumn:"Books" amount:550
                · ├── LEAF id:7 country:"Books" amount:150
                · └── LEAF id:8 country:"Books" amount:400
            `);

            // Switch back to VIEW_A
            api.setGridOption('rowData', []);
            applyTransactionChecked(api, { add: VIEW_A });

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(api.getPinnedTopRow(0)?.aggData?.amount).toBe(3500);

            await new GridRows(api, 'after switch back to VIEW_A').check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:3500
                ROOT id:ROOT_NODE_ID amount:3500
                ├─┬ LEAF_GROUP id:row-group-country-Electronics ag-Grid-AutoColumn:"Electronics" amount:3000
                │ ├── LEAF id:1 country:"Electronics" amount:1000
                │ └── LEAF id:2 country:"Electronics" amount:2000
                └─┬ LEAF_GROUP id:row-group-country-Food ag-Grid-AutoColumn:"Food" amount:500
                · ├── LEAF id:3 country:"Food" amount:300
                · └── LEAF id:4 country:"Food" amount:200
            `);
        });

        test('CSRM pinned grand total stays as a single row after filter change', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `CSRM pinned grand total stays as a single row after filter change setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after filter change setup`).check(
                `
                    ROOT id:ROOT_NODE_ID amount:1000
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                    │ ├── LEAF id:de-berlin country:"Germany" amount:150
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                `
            );

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(1000);

            await api.setColumnFilterModel('amount', { filterType: 'number', type: 'greaterThanOrEqual', filter: 200 });
            api.onFilterChanged();

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(api.getPinnedBottomRow(0)?.aggData?.amount).toBe(750);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after filter change final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID amount:750
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:250
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:750
                `); // lyon 200 + hamburg 250 + rome 300
        });

        test('CSRM pinned grand total stays as a single row after cycling position', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
                grandTotalRow: 'pinnedBottom',
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `CSRM pinned grand total stays as a single row after cycling position setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `);
            await new GridRows(api, `CSRM pinned grand total stays as a single row after cycling position setup`).check(
                `
                    ROOT id:ROOT_NODE_ID amount:1000
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                    │ ├── LEAF id:de-berlin country:"Germany" amount:150
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                    PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                `
            );

            expect(api.getPinnedBottomRowCount()).toBe(1);
            const firstPinned = api.getPinnedBottomRow(0)!;

            api.setGridOption('grandTotalRow', 'pinnedTop');
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow`
            ).check(`
                PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
            expect(api.getPinnedBottomRowCount()).toBe(0);
            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(firstPinned.destroyed).toBe(true);
            const topPinned = api.getPinnedTopRow(0)!;

            api.setGridOption('grandTotalRow', undefined);
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #2`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
            expect(api.getPinnedBottomRowCount()).toBe(0);
            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(topPinned.destroyed).toBe(true);

            api.setGridOption('grandTotalRow', 'pinnedBottom');
            await new GridColumns(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #3`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `CSRM pinned grand total stays as a single row after cycling position after setGridOption grandTotalRow #3`
            ).check(`
                ROOT id:ROOT_NODE_ID amount:1000
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
                PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:1000
            `);
            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.destroyed).toBe(false);
        });
    });

    describe('getAggregatedChildren on pinned siblings', () => {
        test('getAggregatedChildren on pinned group returns same children as source group', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(
                api,
                `getAggregatedChildren on pinned group returns same children as source group setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
            await new GridRows(api, `getAggregatedChildren on pinned group returns same children as source group setup`)
                .check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                    │ ├── LEAF id:de-berlin country:"Germany" amount:150
                    │ └── LEAF id:de-hamburg country:"Germany" amount:250
                    └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                    · └── LEAF id:it-rome country:"Italy" amount:300
                `);

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup).toBeDefined();
            expect(pinnedFrance).toBeDefined();

            // Both should return the same children
            const sourceChildren = franceGroup!.getAggregatedChildren('amount');
            const pinnedChildren = pinnedFrance!.getAggregatedChildren('amount');

            expect(sourceChildren.length).toBe(2);
            expect(pinnedChildren.length).toBe(2);
            expect(sourceChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-paris']);
            expect(pinnedChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-paris']);
            await new GridRows(
                api,
                `getAggregatedChildren on pinned group returns same children as source group final state`
            ).check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });

        test('getAggregatedChildren on pinned group reflects filtering', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            // Before filter - both should have 2 children
            let sourceChildren = franceGroup!.getAggregatedChildren('amount');
            let pinnedChildren = pinnedFrance!.getAggregatedChildren('amount');
            expect(sourceChildren.length).toBe(2);
            expect(pinnedChildren.length).toBe(2);

            await new GridRows(api, 'before filter').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);

            // Apply filter to show only amount >= 150
            await api.setColumnFilterModel('amount', { filterType: 'number', type: 'greaterThanOrEqual', filter: 150 });
            api.onFilterChanged();

            // After filter - both should have 1 child (fr-lyon with amount 200)
            sourceChildren = franceGroup!.getAggregatedChildren('amount');
            pinnedChildren = pinnedFrance!.getAggregatedChildren('amount');
            expect(sourceChildren.length).toBe(1);
            expect(pinnedChildren.length).toBe(1);
            expect(sourceChildren[0].id).toBe('fr-lyon');
            expect(pinnedChildren[0].id).toBe('fr-lyon');

            await new GridRows(api, 'after filter amount >= 150').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                │ └── LEAF id:fr-lyon country:"France" amount:200
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });

        test('getAggregatedChildren on pinned group after transaction add', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            const pinnedFrance = api.getPinnedTopRow(0);

            // Before add - 2 children
            let pinnedChildren = pinnedFrance!.getAggregatedChildren('amount');
            expect(pinnedChildren.length).toBe(2);

            // Add a new France row
            applyTransactionChecked(api, {
                add: [{ id: 'fr-nice', country: 'France', amount: 150 }],
            });

            // After add - 3 children
            pinnedChildren = pinnedFrance!.getAggregatedChildren('amount');
            expect(pinnedChildren.length).toBe(3);
            expect(pinnedChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-nice', 'fr-paris']);

            await new GridRows(api, 'after transaction add').check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:450
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:450
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ ├── LEAF id:fr-lyon country:"France" amount:200
                │ └── LEAF id:fr-nice country:"France" amount:150
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });
    });

    describe('aggregation cleared scenarios', () => {
        test('removing all children from pinned group removes pinned row', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                ...createGridOptions((country) => (country === 'France' ? 'top' : null)),
                rowData: createRowData(),
                getRowId: (params) => params.data.id,
            });

            const franceGroup = api.getRowNode('row-group-country-France');
            const pinnedFrance = api.getPinnedTopRow(0);

            expect(franceGroup?.aggData?.amount).toBe(300);
            expect(pinnedFrance?.aggData?.amount).toBe(300);

            // Remove all France rows
            applyTransactionChecked(api, {
                remove: [{ id: 'fr-paris' }, { id: 'fr-lyon' }],
            });

            // Group should be removed, and pinned row should also be removed
            expect(api.getRowNode('row-group-country-France')).toBeUndefined();
            expect(api.getPinnedTopRowCount()).toBe(0);

            await new GridRows(api, 'after remove all').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:400
                │ ├── LEAF id:de-berlin country:"Germany" amount:150
                │ └── LEAF id:de-hamburg country:"Germany" amount:250
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" amount:300
                · └── LEAF id:it-rome country:"Italy" amount:300
            `);
        });
    });
});
