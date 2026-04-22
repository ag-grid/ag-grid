import { ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

        await asyncSetTimeout(0);

        const groupNode = api.getRowNode('row-group-group-A')!;
        const scrollBefore = api.getVerticalPixelRange().top;

        groupNode.setExpanded(false);
        await asyncSetTimeout(0);

        expect(groupNode.expanded).toBe(false);
        expect(api.getVerticalPixelRange().top).toBe(scrollBefore);
    });
});
