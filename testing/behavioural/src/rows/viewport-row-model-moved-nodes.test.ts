import type { GridApi, IViewportDatasourceParams } from 'ag-grid-community';
import { ViewportRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('viewport row model moved nodes', () => {
    const gridsManager = new TestGridsManager({ modules: [ViewportRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    function rowDataFromIds(idsByIndex: Record<number, string>) {
        const rowData: Record<number, { id: string; name: string }> = {};
        for (const [index, id] of Object.entries(idsByIndex)) {
            rowData[Number(index)] = { id, name: `name-${id}` };
        }
        return rowData;
    }

    test('a node moved to a new index is removed from its previous index when setRowData omits rows', async () => {
        let datasourceParams: IViewportDatasourceParams | undefined;

        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'viewport',
            getRowId: (params) => params.data.id,
            viewportDatasource: {
                init: (params) => {
                    datasourceParams = params;
                },
                setViewportRange: () => {},
            },
        });

        await asyncSetTimeout(0);

        datasourceParams!.setRowCount(5);
        datasourceParams!.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
        await asyncSetTimeout(0);

        // 'e' moves to the top while index 4 is omitted from the update, mimicking a partial
        // response from a server-side sorted feed. Without cleanup the node for 'e' would remain
        // at index 4 as well as index 0, and the row renderer would then produce two row ctrls
        // for one row id, silently dropping (and leaking) one of them on the next recycle.
        datasourceParams!.setRowData(rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' }));
        await asyncSetTimeout(0);

        const visitedIds: string[] = [];
        api.forEachNode((node) => {
            visitedIds.push(node.id!);
        });

        expect(visitedIds.filter((id) => id === 'e')).toHaveLength(1);
        expect(new Set(visitedIds).size).toBe(visitedIds.length);
    });
});
