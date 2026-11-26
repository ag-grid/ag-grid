import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

describe('mockGridLayout', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('an HTML element reports its mocked position through offsetTop and offsetLeft', async () => {
        const api = await gridsManager.createGridAndWait('offsets', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
            ],
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-row[row-index="1"] [col-id="b"]')!;
        const rect = cell.getBoundingClientRect();

        expect(rect.top).toBeGreaterThan(0);
        expect({ offsetTop: cell.offsetTop, offsetLeft: cell.offsetLeft }).toEqual({
            offsetTop: rect.top,
            offsetLeft: rect.left,
        });
    });
});
