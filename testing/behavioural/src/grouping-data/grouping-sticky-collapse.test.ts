import { ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid grouping sticky collapse', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ScrollApiModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Regression: a custom group cell renderer that collapses a group by calling
    // rowNode.setExpanded(false) used to skip the sticky->non-sticky scroll
    // compensation that only lived inside agGroupCellRenderer. The user lost
    // visual context of the group they just collapsed. The compensation now
    // lives inside BaseExpansionService.setExpanded so every caller benefits.
    test('collapsing a group via setExpanded leaves the group row visible', async () => {
        const CHILDREN_PER_GROUP = 40;
        const rowData: { id: string; group: string; value: number }[] = [];
        for (const group of ['A', 'B', 'C']) {
            for (let i = 0; i < CHILDREN_PER_GROUP; i++) {
                rowData.push({ id: `${group}-${i}`, group, value: i });
            }
        }

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            rowData,
            suppressRowVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await new GridColumns(api, `collapsing a group via setExpanded leaves the group row visible setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `collapsing a group via setExpanded leaves the group row visible setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:A-0 group:"A" value:0
            │ ├── LEAF id:A-1 group:"A" value:1
            │ ├── LEAF id:A-2 group:"A" value:2
            │ ├── LEAF id:A-3 group:"A" value:3
            │ ├── LEAF id:A-4 group:"A" value:4
            │ ├── LEAF id:A-5 group:"A" value:5
            │ ├── LEAF id:A-6 group:"A" value:6
            │ ├── LEAF id:A-7 group:"A" value:7
            │ ├── LEAF id:A-8 group:"A" value:8
            │ ├── LEAF id:A-9 group:"A" value:9
            │ ├── LEAF id:A-10 group:"A" value:10
            │ ├── LEAF id:A-11 group:"A" value:11
            │ ├── LEAF id:A-12 group:"A" value:12
            │ ├── LEAF id:A-13 group:"A" value:13
            │ ├── LEAF id:A-14 group:"A" value:14
            │ ├── LEAF id:A-15 group:"A" value:15
            │ ├── LEAF id:A-16 group:"A" value:16
            │ ├── LEAF id:A-17 group:"A" value:17
            │ ├── LEAF id:A-18 group:"A" value:18
            │ ├── LEAF id:A-19 group:"A" value:19
            │ ├── LEAF id:A-20 group:"A" value:20
            │ ├── LEAF id:A-21 group:"A" value:21
            │ ├── LEAF id:A-22 group:"A" value:22
            │ ├── LEAF id:A-23 group:"A" value:23
            │ ├── LEAF id:A-24 group:"A" value:24
            │ ├── LEAF id:A-25 group:"A" value:25
            │ ├── LEAF id:A-26 group:"A" value:26
            │ ├── LEAF id:A-27 group:"A" value:27
            │ ├── LEAF id:A-28 group:"A" value:28
            │ ├── LEAF id:A-29 group:"A" value:29
            │ ├── LEAF id:A-30 group:"A" value:30
            │ ├── LEAF id:A-31 group:"A" value:31
            │ ├── LEAF id:A-32 group:"A" value:32
            │ ├── LEAF id:A-33 group:"A" value:33
            │ ├── LEAF id:A-34 group:"A" value:34
            │ ├── LEAF id:A-35 group:"A" value:35
            │ ├── LEAF id:A-36 group:"A" value:36
            │ ├── LEAF id:A-37 group:"A" value:37
            │ ├── LEAF id:A-38 group:"A" value:38
            │ └── LEAF id:A-39 group:"A" value:39
            ├─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:B-0 group:"B" value:0
            │ ├── LEAF id:B-1 group:"B" value:1
            │ ├── LEAF id:B-2 group:"B" value:2
            │ ├── LEAF id:B-3 group:"B" value:3
            │ ├── LEAF id:B-4 group:"B" value:4
            │ ├── LEAF id:B-5 group:"B" value:5
            │ ├── LEAF id:B-6 group:"B" value:6
            │ ├── LEAF id:B-7 group:"B" value:7
            │ ├── LEAF id:B-8 group:"B" value:8
            │ ├── LEAF id:B-9 group:"B" value:9
            │ ├── LEAF id:B-10 group:"B" value:10
            │ ├── LEAF id:B-11 group:"B" value:11
            │ ├── LEAF id:B-12 group:"B" value:12
            │ ├── LEAF id:B-13 group:"B" value:13
            │ ├── LEAF id:B-14 group:"B" value:14
            │ ├── LEAF id:B-15 group:"B" value:15
            │ ├── LEAF id:B-16 group:"B" value:16
            │ ├── LEAF id:B-17 group:"B" value:17
            │ ├── LEAF id:B-18 group:"B" value:18
            │ ├── LEAF id:B-19 group:"B" value:19
            │ ├── LEAF id:B-20 group:"B" value:20
            │ ├── LEAF id:B-21 group:"B" value:21
            │ ├── LEAF id:B-22 group:"B" value:22
            │ ├── LEAF id:B-23 group:"B" value:23
            │ ├── LEAF id:B-24 group:"B" value:24
            │ ├── LEAF id:B-25 group:"B" value:25
            │ ├── LEAF id:B-26 group:"B" value:26
            │ ├── LEAF id:B-27 group:"B" value:27
            │ ├── LEAF id:B-28 group:"B" value:28
            │ ├── LEAF id:B-29 group:"B" value:29
            │ ├── LEAF id:B-30 group:"B" value:30
            │ ├── LEAF id:B-31 group:"B" value:31
            │ ├── LEAF id:B-32 group:"B" value:32
            │ ├── LEAF id:B-33 group:"B" value:33
            │ ├── LEAF id:B-34 group:"B" value:34
            │ ├── LEAF id:B-35 group:"B" value:35
            │ ├── LEAF id:B-36 group:"B" value:36
            │ ├── LEAF id:B-37 group:"B" value:37
            │ ├── LEAF id:B-38 group:"B" value:38
            │ └── LEAF id:B-39 group:"B" value:39
            └─┬ LEAF_GROUP id:row-group-group-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:C-0 group:"C" value:0
            · ├── LEAF id:C-1 group:"C" value:1
            · ├── LEAF id:C-2 group:"C" value:2
            · ├── LEAF id:C-3 group:"C" value:3
            · ├── LEAF id:C-4 group:"C" value:4
            · ├── LEAF id:C-5 group:"C" value:5
            · ├── LEAF id:C-6 group:"C" value:6
            · ├── LEAF id:C-7 group:"C" value:7
            · ├── LEAF id:C-8 group:"C" value:8
            · ├── LEAF id:C-9 group:"C" value:9
            · ├── LEAF id:C-10 group:"C" value:10
            · ├── LEAF id:C-11 group:"C" value:11
            · ├── LEAF id:C-12 group:"C" value:12
            · ├── LEAF id:C-13 group:"C" value:13
            · ├── LEAF id:C-14 group:"C" value:14
            · ├── LEAF id:C-15 group:"C" value:15
            · ├── LEAF id:C-16 group:"C" value:16
            · ├── LEAF id:C-17 group:"C" value:17
            · ├── LEAF id:C-18 group:"C" value:18
            · ├── LEAF id:C-19 group:"C" value:19
            · ├── LEAF id:C-20 group:"C" value:20
            · ├── LEAF id:C-21 group:"C" value:21
            · ├── LEAF id:C-22 group:"C" value:22
            · ├── LEAF id:C-23 group:"C" value:23
            · ├── LEAF id:C-24 group:"C" value:24
            · ├── LEAF id:C-25 group:"C" value:25
            · ├── LEAF id:C-26 group:"C" value:26
            · ├── LEAF id:C-27 group:"C" value:27
            · ├── LEAF id:C-28 group:"C" value:28
            · ├── LEAF id:C-29 group:"C" value:29
            · ├── LEAF id:C-30 group:"C" value:30
            · ├── LEAF id:C-31 group:"C" value:31
            · ├── LEAF id:C-32 group:"C" value:32
            · ├── LEAF id:C-33 group:"C" value:33
            · ├── LEAF id:C-34 group:"C" value:34
            · ├── LEAF id:C-35 group:"C" value:35
            · ├── LEAF id:C-36 group:"C" value:36
            · ├── LEAF id:C-37 group:"C" value:37
            · ├── LEAF id:C-38 group:"C" value:38
            · └── LEAF id:C-39 group:"C" value:39
        `);

        await asyncSetTimeout(0);

        const groupNode = api.getRowNode('row-group-group-A')!;
        expect(groupNode).toBeDefined();
        expect(groupNode.expanded).toBe(true);

        // Scroll deep into group A's children so group A's row falls off the top
        // of the rendered range — this is the setup where the bug manifests.
        api.ensureIndexVisible(30, 'top');
        await asyncSetTimeout(0);

        // Pre-condition: group A's row is now above the rendered window, so
        // without a scroll fix-up the user would not see it after collapse.
        expect(groupNode.rowIndex).toBeLessThan(api.getFirstDisplayedRowIndex());

        // Mimic a custom group cell renderer collapsing the group — no
        // originating event, no renderer-level scroll fix-up. The fix in
        // BaseExpansionService.setExpanded must keep the collapsed group in the
        // rendered range regardless of caller.
        groupNode.setExpanded(false);
        await asyncSetTimeout(0);

        expect(groupNode.expanded).toBe(false);
        expect(groupNode.rowIndex).toBeGreaterThanOrEqual(api.getFirstDisplayedRowIndex());
        expect(groupNode.rowIndex).toBeLessThanOrEqual(api.getLastDisplayedRowIndex());
        await new GridRows(api, `collapsing a group via setExpanded leaves the group row visible final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-group-A ag-Grid-AutoColumn:"A"
                │ ├── LEAF hidden id:A-0 group:"A" value:0
                │ ├── LEAF hidden id:A-1 group:"A" value:1
                │ ├── LEAF hidden id:A-2 group:"A" value:2
                │ ├── LEAF hidden id:A-3 group:"A" value:3
                │ ├── LEAF hidden id:A-4 group:"A" value:4
                │ ├── LEAF hidden id:A-5 group:"A" value:5
                │ ├── LEAF hidden id:A-6 group:"A" value:6
                │ ├── LEAF hidden id:A-7 group:"A" value:7
                │ ├── LEAF hidden id:A-8 group:"A" value:8
                │ ├── LEAF hidden id:A-9 group:"A" value:9
                │ ├── LEAF hidden id:A-10 group:"A" value:10
                │ ├── LEAF hidden id:A-11 group:"A" value:11
                │ ├── LEAF hidden id:A-12 group:"A" value:12
                │ ├── LEAF hidden id:A-13 group:"A" value:13
                │ ├── LEAF hidden id:A-14 group:"A" value:14
                │ ├── LEAF hidden id:A-15 group:"A" value:15
                │ ├── LEAF hidden id:A-16 group:"A" value:16
                │ ├── LEAF hidden id:A-17 group:"A" value:17
                │ ├── LEAF hidden id:A-18 group:"A" value:18
                │ ├── LEAF hidden id:A-19 group:"A" value:19
                │ ├── LEAF hidden id:A-20 group:"A" value:20
                │ ├── LEAF hidden id:A-21 group:"A" value:21
                │ ├── LEAF hidden id:A-22 group:"A" value:22
                │ ├── LEAF hidden id:A-23 group:"A" value:23
                │ ├── LEAF hidden id:A-24 group:"A" value:24
                │ ├── LEAF hidden id:A-25 group:"A" value:25
                │ ├── LEAF hidden id:A-26 group:"A" value:26
                │ ├── LEAF hidden id:A-27 group:"A" value:27
                │ ├── LEAF hidden id:A-28 group:"A" value:28
                │ ├── LEAF hidden id:A-29 group:"A" value:29
                │ ├── LEAF hidden id:A-30 group:"A" value:30
                │ ├── LEAF hidden id:A-31 group:"A" value:31
                │ ├── LEAF hidden id:A-32 group:"A" value:32
                │ ├── LEAF hidden id:A-33 group:"A" value:33
                │ ├── LEAF hidden id:A-34 group:"A" value:34
                │ ├── LEAF hidden id:A-35 group:"A" value:35
                │ ├── LEAF hidden id:A-36 group:"A" value:36
                │ ├── LEAF hidden id:A-37 group:"A" value:37
                │ ├── LEAF hidden id:A-38 group:"A" value:38
                │ └── LEAF hidden id:A-39 group:"A" value:39
                ├─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
                │ ├── LEAF id:B-0 group:"B" value:0
                │ ├── LEAF id:B-1 group:"B" value:1
                │ ├── LEAF id:B-2 group:"B" value:2
                │ ├── LEAF id:B-3 group:"B" value:3
                │ ├── LEAF id:B-4 group:"B" value:4
                │ ├── LEAF id:B-5 group:"B" value:5
                │ ├── LEAF id:B-6 group:"B" value:6
                │ ├── LEAF id:B-7 group:"B" value:7
                │ ├── LEAF id:B-8 group:"B" value:8
                │ ├── LEAF id:B-9 group:"B" value:9
                │ ├── LEAF id:B-10 group:"B" value:10
                │ ├── LEAF id:B-11 group:"B" value:11
                │ ├── LEAF id:B-12 group:"B" value:12
                │ ├── LEAF id:B-13 group:"B" value:13
                │ ├── LEAF id:B-14 group:"B" value:14
                │ ├── LEAF id:B-15 group:"B" value:15
                │ ├── LEAF id:B-16 group:"B" value:16
                │ ├── LEAF id:B-17 group:"B" value:17
                │ ├── LEAF id:B-18 group:"B" value:18
                │ ├── LEAF id:B-19 group:"B" value:19
                │ ├── LEAF id:B-20 group:"B" value:20
                │ ├── LEAF id:B-21 group:"B" value:21
                │ ├── LEAF id:B-22 group:"B" value:22
                │ ├── LEAF id:B-23 group:"B" value:23
                │ ├── LEAF id:B-24 group:"B" value:24
                │ ├── LEAF id:B-25 group:"B" value:25
                │ ├── LEAF id:B-26 group:"B" value:26
                │ ├── LEAF id:B-27 group:"B" value:27
                │ ├── LEAF id:B-28 group:"B" value:28
                │ ├── LEAF id:B-29 group:"B" value:29
                │ ├── LEAF id:B-30 group:"B" value:30
                │ ├── LEAF id:B-31 group:"B" value:31
                │ ├── LEAF id:B-32 group:"B" value:32
                │ ├── LEAF id:B-33 group:"B" value:33
                │ ├── LEAF id:B-34 group:"B" value:34
                │ ├── LEAF id:B-35 group:"B" value:35
                │ ├── LEAF id:B-36 group:"B" value:36
                │ ├── LEAF id:B-37 group:"B" value:37
                │ ├── LEAF id:B-38 group:"B" value:38
                │ └── LEAF id:B-39 group:"B" value:39
                └─┬ LEAF_GROUP id:row-group-group-C ag-Grid-AutoColumn:"C"
                · ├── LEAF id:C-0 group:"C" value:0
                · ├── LEAF id:C-1 group:"C" value:1
                · ├── LEAF id:C-2 group:"C" value:2
                · ├── LEAF id:C-3 group:"C" value:3
                · ├── LEAF id:C-4 group:"C" value:4
                · ├── LEAF id:C-5 group:"C" value:5
                · ├── LEAF id:C-6 group:"C" value:6
                · ├── LEAF id:C-7 group:"C" value:7
                · ├── LEAF id:C-8 group:"C" value:8
                · ├── LEAF id:C-9 group:"C" value:9
                · ├── LEAF id:C-10 group:"C" value:10
                · ├── LEAF id:C-11 group:"C" value:11
                · ├── LEAF id:C-12 group:"C" value:12
                · ├── LEAF id:C-13 group:"C" value:13
                · ├── LEAF id:C-14 group:"C" value:14
                · ├── LEAF id:C-15 group:"C" value:15
                · ├── LEAF id:C-16 group:"C" value:16
                · ├── LEAF id:C-17 group:"C" value:17
                · ├── LEAF id:C-18 group:"C" value:18
                · ├── LEAF id:C-19 group:"C" value:19
                · ├── LEAF id:C-20 group:"C" value:20
                · ├── LEAF id:C-21 group:"C" value:21
                · ├── LEAF id:C-22 group:"C" value:22
                · ├── LEAF id:C-23 group:"C" value:23
                · ├── LEAF id:C-24 group:"C" value:24
                · ├── LEAF id:C-25 group:"C" value:25
                · ├── LEAF id:C-26 group:"C" value:26
                · ├── LEAF id:C-27 group:"C" value:27
                · ├── LEAF id:C-28 group:"C" value:28
                · ├── LEAF id:C-29 group:"C" value:29
                · ├── LEAF id:C-30 group:"C" value:30
                · ├── LEAF id:C-31 group:"C" value:31
                · ├── LEAF id:C-32 group:"C" value:32
                · ├── LEAF id:C-33 group:"C" value:33
                · ├── LEAF id:C-34 group:"C" value:34
                · ├── LEAF id:C-35 group:"C" value:35
                · ├── LEAF id:C-36 group:"C" value:36
                · ├── LEAF id:C-37 group:"C" value:37
                · ├── LEAF id:C-38 group:"C" value:38
                · └── LEAF id:C-39 group:"C" value:39
            `
        );
    });

    test('collapsing a group that is already on-screen does not move the viewport', async () => {
        const rowData = [
            { id: '1', group: 'A', value: 1 },
            { id: '2', group: 'A', value: 2 },
            { id: '3', group: 'B', value: 3 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            rowData,
            suppressRowVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await new GridColumns(api, `collapsing a group that is already on-screen does not move the viewport setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `collapsing a group that is already on-screen does not move the viewport setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
                │ ├── LEAF id:1 group:"A" value:1
                │ └── LEAF id:2 group:"A" value:2
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
                · └── LEAF id:3 group:"B" value:3
            `
        );

        await asyncSetTimeout(0);

        const groupNode = api.getRowNode('row-group-group-A')!;
        const scrollBefore = api.getVerticalPixelRange().top;

        groupNode.setExpanded(false);
        await asyncSetTimeout(0);

        expect(groupNode.expanded).toBe(false);
        expect(api.getVerticalPixelRange().top).toBe(scrollBefore);
        await new GridRows(api, `collapsing a group that is already on-screen does not move the viewport final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-group-A ag-Grid-AutoColumn:"A"
                │ ├── LEAF hidden id:1 group:"A" value:1
                │ └── LEAF hidden id:2 group:"A" value:2
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
                · └── LEAF id:3 group:"B" value:3
            `);
    });
});
