import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';
import { ssrmExpandAndLoadAll } from '../test-utils/ssrm-test-utils';

/**
 * Black-box coverage for the SSRM generated-id scheme: when getRowId is NOT supplied the grid
 * builds each block row's id by prefixing it with the parent group keys (root excluded), joined
 * with hyphens. Empty-string group keys are rendered with the `ag-Grid-MissingKey` sentinel.
 *
 * The test observes node.id via api.forEachNode after expanding and loading the whole tree, so it
 * fails only if the public id scheme changes — not if internal field/method names change.
 */
describe('SSRM generated node id prefix', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    // Two-level grouping: country -> city -> leaves. Ireland has a normal city (Dublin) and a
    // city with an empty key (to exercise the missing-key sentinel).
    const tree: Record<string, Record<string, { athlete: string }[]>> = {
        Ireland: {
            Dublin: [{ athlete: 'Aoife' }, { athlete: 'Cian' }],
            '': [{ athlete: 'Niamh' }],
        },
    };

    function createGridOptions(): GridOptions {
        return {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = params.request.groupKeys ?? [];
                    if (groupKeys.length === 0) {
                        const countries = Object.keys(tree).map((country) => ({ country }));
                        params.success({ rowData: countries, rowCount: countries.length });
                        return;
                    }
                    if (groupKeys.length === 1) {
                        const country = groupKeys[0];
                        const cities = Object.keys(tree[country]).map((city) => ({ country, city }));
                        params.success({ rowData: cities, rowCount: cities.length });
                        return;
                    }
                    const [country, city] = groupKeys;
                    const leaves = (tree[country][city] ?? []).map((leaf) => ({ ...leaf, country, city }));
                    params.success({ rowData: leaves, rowCount: leaves.length });
                },
            },
        };
    }

    test('leaf ids carry the hyphen-joined parent group-key prefix, with the missing-key sentinel for empty keys', async () => {
        const api = gridsManager.createGrid('myGrid', createGridOptions());
        await ssrmExpandAndLoadAll(api);

        const leafIds: string[] = [];
        api.forEachNode((node) => {
            if (!node.group && node.data?.athlete != null) {
                leafIds.push(node.id!);
            }
        });

        // Ireland/Dublin leaves get the "Ireland-Dublin-" prefix; the empty-key city renders its
        // segment as the ag-Grid-MissingKey sentinel.
        expect(leafIds.sort()).toEqual(['Ireland-Dublin-0', 'Ireland-Dublin-1', 'Ireland-ag-Grid-MissingKey-0']);
    });
});
