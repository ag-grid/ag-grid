// Shared setup for the server-side row-selection suites: the grid manager, the flat fixture every one of
// them drives, and the hooks. Siblings rather than one file because vitest parallelises across files but not
// within one, so ~100 grid-building tests in a single file serialise in one worker.
import { ALL_SEVERITIES, StudioStubModule, TestGridsManager, waitForEvent } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions, Params } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    RowSelectionModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridActions } from './utils';

const gridMgr = new TestGridsManager({
    modules: [
        RowSelectionModule,
        ClientSideRowModelModule,
        RowGroupingModule,
        ServerSideRowModelModule,
        ServerSideRowModelApiModule,
        PaginationModule,
        TextFilterModule,
    ],
});

export const columnDefs = [{ field: 'sport' }];

export const rowData = [
    { sport: 'football' },
    { sport: 'rugby' },
    { sport: 'tennis' },
    { sport: 'cricket' },
    { sport: 'golf' },
    { sport: 'swimming' },
    { sport: 'rowing' },
];

function createGrid(gridOptions: GridOptions, params?: Params): [GridApi, GridActions] {
    const api = gridMgr.createGrid('myGrid', gridOptions, params);
    const actions = new GridActions(api, '#myGrid');
    return [api, actions];
}

export async function createGridAndWait(gridOptions: GridOptions, params?: Params): Promise<[GridApi, GridActions]> {
    const [api, actions] = createGrid(gridOptions, params);

    await waitForEvent('firstDataRendered', api);

    return [api, actions];
}

/** Creates a grid that behaves as if it were running inside AG Studio, waiting for the first render. */
export function createStudioGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
    return createGridAndWait(gridOptions, { modules: [StudioStubModule] });
}

/** The one advisory these suites run into by design: server-side selection with no `getRowId`. */
const GET_ROW_ID_ADVISORY = 'warning #188';

let warnSpy: MockInstance;

/** What `console.warn` received during the current test. */
export const capturedWarnings = (): string[] => warnSpy.mock.calls.map((call) => String(call[0]));

/** Registers the hooks every sibling suite needs. */
export function setupServerSideRowSelectionSuite(): void {
    beforeEach(() => {
        // These tests exercise SSRM selection with the row model's default identity, so #188 (the
        // getRowId-recommended advisory) is reviewed and accepted here; every other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [188] });

        gridMgr.reset();
        // Suppressing an id keeps it out of the overlay but still logs it, so the console needs the same
        // allowlist. `server-side-row-selection-single.test.ts` asserts the advisory does still fire.
        warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        const unexpected = capturedWarnings().filter((message) => !message.includes(GET_ROW_ID_ADVISORY));
        warnSpy.mockRestore();
        expect(unexpected).toEqual([]);
    });
}
