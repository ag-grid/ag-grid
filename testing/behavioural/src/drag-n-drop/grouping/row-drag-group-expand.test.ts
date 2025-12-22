import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';
import type { GridOptions, RowNode } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, getRowHtmlElement } from '../../test-utils';

const gridsManager = new TestGridsManager({
    modules: [ClientSideRowModelModule, RowDragModule, RowGroupingModule],
});

describe('row drag nudger group expansion', () => {
    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const waitForGroupHover = async (
        api: any,
        targetRowId: string,
        rowDragDispatcher: RowDragDispatcher
    ): Promise<boolean> => {
        for (let i = 0; i < 12; ++i) {
            const targetElement = getRowHtmlElement(api, targetRowId);
            if (!targetElement) {
                throw new Error(`row element ${targetRowId} not found while waiting for hover`);
            }
            const rect = targetElement.getBoundingClientRect();
            const clientX = rect.left + rect.width / 2;
            const clientY = rect.top + rect.height / 2;
            await asyncSetTimeout(25);
            await rowDragDispatcher.move(targetRowId, { clientX, clientY });
        }

        let expanded = false;
        api.forEachNode((node: RowNode) => {
            if (node.group && node.key === 'B') {
                expanded = !!node.expanded;
            }
        });
        return expanded;
    };

    test('managed row data expands collapsed groups after the insert delay', async () => {
        const gridOptions: GridOptions = {
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
            rowDragInsertDelay: 30,
            groupDefaultExpanded: 0,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('nudger-managed-expand', gridOptions);

        api.forEachNode((node) => {
            if (node.group && node.key === 'A') {
                node.setExpanded(true, undefined, true);
            }
        });

        const initialRows = new GridRows(api, 'initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP collapsed id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF hidden id:3 group:"B" value:"B1"
        `);

        const sourceRowId = '2';
        const targetRowId = 'row-group-group-B';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        let expandedBeforeDrop = false;

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        expandedBeforeDrop = await waitForGroupHover(api, targetRowId, dispatcher);
        await dispatcher.finish();

        expect(expandedBeforeDrop).toBe(true);

        let expandedAfterDrop = false;
        api.forEachNode((node) => {
            if (node.group && node.key === 'B') {
                expandedAfterDrop = !!node.expanded;
            }
        });
        expect(expandedAfterDrop).toBe(true);
        expect(api.getRowNode('2')?.data.group).toBe('B');

        const afterRows = new GridRows(api, 'after');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:2 group:"B" value:"A2"
            · └── LEAF id:3 group:"B" value:"B1"
        `);
    });

    test('unmanaged row data still auto-expands collapsed groups after the insert delay', async () => {
        const gridOptions: GridOptions = {
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
            rowDragInsertDelay: 30,
            groupDefaultExpanded: 0,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('nudger-unmanaged-expand', gridOptions);

        api.forEachNode((node) => {
            if (node.group && node.key === 'A') {
                node.setExpanded(true, undefined, true);
            }
        });

        const initialRows = new GridRows(api, 'initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP collapsed id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF hidden id:3 group:"B" value:"B1"
        `);

        const sourceRowId = '2';
        const targetRowId = 'row-group-group-B';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        let expandedBeforeDrop = false;

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        expandedBeforeDrop = await waitForGroupHover(api, targetRowId, dispatcher);
        await dispatcher.finish();

        expect(expandedBeforeDrop).toBe(true);

        let expandedAfterDrop = false;
        api.forEachNode((node) => {
            if (node.group && node.key === 'B') {
                expandedAfterDrop = !!node.expanded;
            }
        });
        expect(expandedAfterDrop).toBe(true);
        expect(api.getRowNode('2')?.data.group).toBe('A');

        const afterRows = new GridRows(api, 'after');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);
    });
});
