import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

// Characterisation guardrail for AG-14611: records the ordering of grid lifecycle events and every
// value-getter invocation (column + the data shape it evaluated against) during a combined
// columnDefs + rowData update. Uses null-safe getters so nothing throws today; the point is to make
// the CURRENT sequence observable so a later fix can be shown to preserve it (bar the one render we move).

const TRACKED_EVENTS = [
    'columnEverythingChanged',
    'newColumnsLoaded',
    'gridColumnsChanged',
    'displayedColumnsChanged',
    'virtualColumnsChanged',
    'modelUpdated',
    'rowDataUpdated',
] as const;

describe('combined columnDefs + rowData update ordering (AG-14611)', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('records event + value-getter sequence for a combined update', async () => {
        const log: string[] = [];
        const getterCalls: string[] = [];

        // getter records the colId and which of {a,b} the row data currently carries
        const makeGetter = (colId: string) => (params: any) => {
            const data = params.data ?? {};
            const shape = ['a', 'b'].filter((k) => data[k] !== undefined).join('+') || 'empty';
            getterCalls.push(`${colId}[${shape}]`);
            return data[colId]?.value ?? null;
        };

        const gridOptions: GridOptions = {
            columnDefs: [{ colId: 'a', valueGetter: makeGetter('a') }],
            rowData: [{ a: { value: 1 } }, { a: { value: 2 } }],
            animateRows: false,
        };

        const api: GridApi = gridsManager.createGrid('myGrid', gridOptions);

        for (const evt of TRACKED_EVENTS) {
            api.addEventListener(evt, () => log.push(evt));
        }
        getterCalls.length = 0; // ignore initial render, focus on the combined update

        api.updateGridOptions({
            columnDefs: [
                { colId: 'a', valueGetter: makeGetter('a') },
                { colId: 'b', valueGetter: makeGetter('b') },
            ],
            rowData: [
                { a: { value: 10 }, b: { value: 100 } },
                { a: { value: 20 }, b: { value: 200 } },
            ],
        });

        await asyncSetTimeout(50);

        // A combined update performs a SINGLE model refresh (one modelUpdated), with the column events
        // preserved in their usual order.
        expect(log).toEqual([
            'gridColumnsChanged',
            'virtualColumnsChanged',
            'displayedColumnsChanged',
            'columnEverythingChanged',
            'newColumnsLoaded',
            'rowDataUpdated',
            'modelUpdated',
        ]);

        // Every getter call sees the new columns AND the new data together: 4 calls (2 rows x 2 cols),
        // all `[a+b]`. No getter may ever observe the mixed state (new column x old data shape).
        expect(getterCalls).toEqual(['a[a+b]', 'b[a+b]', 'a[a+b]', 'b[a+b]']);
    });
});
