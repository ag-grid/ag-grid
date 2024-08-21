import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { getAllRowData } from '../test-utils';

const mutationObserver = global.MutationObserver;
describe('Mutation Observers Disconnected', () => {
    const allMocks: any = [];
    const mutationObserverMock = jest.fn<MutationObserver, [MutationCallback]>().mockImplementation(() => {
        const mock = {
            observe: jest.fn(),
            disconnect: jest.fn(),
            takeRecords: jest.fn(),
        };
        allMocks.push(mock);
        return mock;
    });

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    beforeEach(() => {
        global.MutationObserver = mutationObserverMock;
        resetGrids();
    });

    afterEach(() => {
        global.MutationObserver = mutationObserver;
    });

    test('observer always disconnected after destroy', async () => {
        const rowData1 = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
        };

        const api = createMyGrid(gridOptions);

        const allRowData = getAllRowData(api);
        expect(allRowData).toBeDefined();

        api.destroy();

        expect(allMocks.length).toBeGreaterThan(0);
        for (const mock of allMocks) {
            expect(mock.observe).toHaveBeenCalled();
            expect(mock.disconnect).toHaveBeenCalled();
        }
    });
});
