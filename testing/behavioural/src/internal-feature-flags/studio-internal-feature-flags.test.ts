import { TestGridsManager, assertSelectedRowsByIndex } from 'ag-test-utils';

import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule, _createInternalFeatureFlagsModule } from 'ag-grid-community';

import { GridActions, pressSpaceKey } from '../selection/utils';

// Stands in for the `studio` bean AG Studio adds to every grid. It also skips licence validation.
class StudioStub {
    public readonly beanName = 'studio' as const;
}

const StudioStubModule: Module = {
    moduleName: 'Studio' as Module['moduleName'],
    version: ClientSideRowModelModule.version,
    beans: [StudioStub],
};

describe('Internal feature flags AG Studio enables', () => {
    const columnDefs = [{ field: 'sport' }];
    const rowData = [{ sport: 'football' }, { sport: 'rugby' }, { sport: 'tennis' }, { sport: 'cricket' }];

    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, RowSelectionModule] });

    function createStudioGrid(gridOptions: GridOptions, extraModules: Module[] = []): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions, { modules: [StudioStubModule, ...extraModules] });
        return [api, new GridActions(api, '#myGrid')];
    }

    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('clickToggleSelection: clicking the only selected row deselects it', () => {
        const [api, actions] = createStudioGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'singleRow', enableClickSelection: true, checkboxes: false },
        });

        actions.clickRowByIndex(2);
        assertSelectedRowsByIndex([2], api);

        actions.clickRowByIndex(2);
        assertSelectedRowsByIndex([], api);
    });

    test('spaceKeyFollowsClickSelection: Space on a row does not select when click selection is disabled', () => {
        const [api, actions] = createStudioGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow', enableClickSelection: false },
        });

        pressSpaceKey(actions.getCellByPosition(2, 'sport')!);
        assertSelectedRowsByIndex([], api);
    });

    test('an explicitly disabled flag overrides the Studio default', () => {
        const [api, actions] = createStudioGrid(
            {
                columnDefs,
                rowData,
                rowSelection: { mode: 'singleRow', enableClickSelection: true, checkboxes: false },
            },
            [_createInternalFeatureFlagsModule({ clickToggleSelection: false })]
        );

        actions.clickRowByIndex(2);
        actions.clickRowByIndex(2);
        assertSelectedRowsByIndex([2], api);
    });
});
