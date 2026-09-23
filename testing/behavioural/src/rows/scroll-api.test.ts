import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowAutoHeightModule, ScrollApiModule } from 'ag-grid-community';

describe('scroll API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ScrollApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const getViewport = (api: GridApi) =>
        TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;

    describe('ensureIndexVisible', () => {
        // Only a row still loading or still to be measured is worth scrolling to again; here neither can happen,
        // so a later change moving the rows leaves the scroll where it is.
        test('without auto-height rows, a scroll to a row is not repeated when the rows move afterwards', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: Array.from({ length: 200 }, (_, i) => ({ a: i })),
            });
            const viewport = getViewport(api);
            api.ensureIndexVisible(100, 'top');
            const top = viewport.scrollTop;
            expect(top).toBe(api.getDisplayedRowAtIndex(100)!.rowTop);
            await asyncSetTimeout(0);

            api.setGridOption('rowHeight', 80);
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowAtIndex(100)!.rowTop).toBeGreaterThan(top);
            expect(viewport.scrollTop).toBe(top);
        });

        test('with auto-height rows still unmeasured, a scroll to a row follows the row when it moves', async () => {
            const api = gridsManager.createGrid(
                'myGrid',
                {
                    columnDefs: [{ field: 'a', autoHeight: true }],
                    rowData: Array.from({ length: 200 }, (_, i) => ({ a: i })),
                },
                { modules: [RowAutoHeightModule] }
            );
            const viewport = getViewport(api);
            api.ensureIndexVisible(100, 'top');
            const top = viewport.scrollTop;
            expect(top).toBe(api.getDisplayedRowAtIndex(100)!.rowTop);
            await asyncSetTimeout(0);

            api.setGridOption('rowHeight', 80);
            await asyncSetTimeout(0);

            const movedTop = api.getDisplayedRowAtIndex(100)!.rowTop!;
            expect(movedTop).toBeGreaterThan(top);
            expect(viewport.scrollTop).toBe(movedTop);
        });
    });
});
