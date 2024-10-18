import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowNode } from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

const mutationObserver = global.MutationObserver;

describe('Mutation Observers Disconnected', () => {
    const gridsManager = new TestGridsManager({modules: [ClientSideRowModelModule]});

    // const allMocks: any = [];
    // const mutationObserverMock = vitest.fn<(MutationCallback) => MutationObserver>().mockImplementation(() => {
    //     const mock = {
    //         observe: vitest.fn(),
    //         disconnect: vitest.fn(),
    //         takeRecords: vitest.fn(),
    //     };
    //     allMocks.push(mock);
    //     return mock;
    // });
    //
    // beforeEach(() => {
    //     global.MutationObserver = mutationObserverMock;
    //     gridsManager.reset();
    // });
    //
    // afterEach(() => {
    //     gridsManager.reset();
    //     global.MutationObserver = mutationObserver;
    // });

    test('fake test', async () => {
    })
    // test('observer always disconnected after destroy', async () => {
    //     const rowData1 = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];
    //
    //     const gridOptions: GridOptions = {
    //         columnDefs: [{ field: 'x' }],
    //         animateRows: false,
    //         rowData: rowData1,
    //     };
    //
    //     const api = gridsManager.createGrid('myGrid', gridOptions);
    //
    //     const gridRows = new GridRows(api);
    //     expect(gridRows.rootRowNode).toBeInstanceOf(RowNode);
    //
    //     await asyncSetTimeout(5); // Just to make sure all async operations are done
    //
    //     api.destroy();
    //
    //     expect(allMocks.length).toBeGreaterThan(0);
    //     for (const mock of allMocks) {
    //         expect(mock.observe).toHaveBeenCalled();
    //         expect(mock.disconnect).toHaveBeenCalled();
    //     }
    // });
});
