import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('sourceRowIndex in isRowSelectable', () => {
    const columnDefs = [{ field: 'sport' }];
    const rowData = [{ sport: 'football' }, { sport: 'rugby' }, { sport: 'tennis' }];

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule],
    });

    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('sourceRowIndex should be populated in isRowSelectable', () => {
        const nodeLog: { id: string | undefined; sourceRowIndex: number; rowIndex: number | null }[] = [];

        const gridOptions: GridOptions = {
            columnDefs,
            rowData,
            rowSelection: {
                mode: 'multiRow',
                isRowSelectable: (node) => {
                    nodeLog.push({
                        id: node.id,
                        sourceRowIndex: node.sourceRowIndex,
                        rowIndex: node.rowIndex,
                    });
                    return true;
                },
            },
        };

        gridMgr.createGrid('myGrid', gridOptions);

        // For 3 rows, we expect isRowSelectable to be called at least 3 times during initial load (once for each node)
        // Then it should be called again when rowIndex is set.
        expect(nodeLog.length).toBeGreaterThanOrEqual(3);

        // Group by node ID (or reference if we had it, but ID is fine here as it's set before updateRowSelectable)
        const nodeMap: Record<string, typeof nodeLog> = {};
        nodeLog.forEach((log) => {
            const id = log.id!;
            if (!nodeMap[id]) {
                nodeMap[id] = [];
            }
            nodeMap[id].push(log);
        });

        const ids = Object.keys(nodeMap);
        expect(ids.length).toBe(3);

        ids.forEach((id) => {
            const logs = nodeMap[id];

            // All calls for this node should have a valid sourceRowIndex (not -1)
            logs.forEach((log) => {
                expect(log.sourceRowIndex).toBeGreaterThanOrEqual(0);
                expect(log.sourceRowIndex).toBeLessThan(3);
            });
        });
    });
});
