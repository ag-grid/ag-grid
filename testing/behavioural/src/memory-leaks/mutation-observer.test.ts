import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';

import { TestGridsManager, asyncSetTimeout, getAllRowData } from '../test-utils';

const mutationObserver = global.MutationObserver;

describe('Mutation Observers Disconnected', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

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

    beforeEach(() => {
        global.MutationObserver = mutationObserverMock;
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        global.MutationObserver = mutationObserver;
    });

    test('observer always disconnected after destroy', async () => {
        const rowData1 = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const allRowData = getAllRowData(api);
        expect(allRowData).toBeDefined();

        await asyncSetTimeout(15); // Just to make sure all async operations are done

        api.destroy();

        expect(allMocks.length).toBeGreaterThan(0);
        for (const mock of allMocks) {
            expect(mock.observe).toHaveBeenCalled();
            expect(mock.disconnect).toHaveBeenCalled();
        }
    });
});
