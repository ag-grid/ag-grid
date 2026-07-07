import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    RowSelectionModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

// The invalid-property warning id emitted by colDef validation (validationService #307).
const INVALID_PROPERTY_ID = 307;

describe('dev validation diagnostic attribution', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, RowSelectionModule, ValidationModule],
    });
    const columnDefs = [{ field: 'athlete' }];
    const rowData = [{ athlete: 'Michael Phelps' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const beansOf = (api: GridApi): any => (api.getAllGridColumns()?.[0] as any)?.beans;
    const capturedIds = (api: GridApi): number[] =>
        beansOf(api)
            .errorOverlay.getDiagnostics()
            .map((diagnostic: any) => diagnostic.id);

    test('attributes a colDef diagnostic to its own grid when validation runs outside the creation scope', () => {
        enableDevValidations({ overlay: 'warning' });
        const apiClean = gridsManager.createGrid('cleanGrid', { columnDefs, rowData } as GridOptions);
        const apiInvalid = gridsManager.createGrid('invalidGrid', { columnDefs, rowData } as GridOptions);

        // colDef validation is dispatched via the grid's async event queue, so it runs after createGrid's
        // synchronous _runWithActiveGrid scope has closed. Calling it directly here reproduces that
        // out-of-scope timing (activeGridId is undefined) without depending on the async event flush.
        beansOf(apiInvalid).validation.validateColDef({ field: 'x', notARealColDefProperty: true });

        // The offending grid captures it; the other grid must not — an unattributed diagnostic would
        // broadcast to every grid's overlay (the master/detail bug this guards against).
        expect(capturedIds(apiInvalid)).toContain(INVALID_PROPERTY_ID);
        expect(capturedIds(apiClean)).not.toContain(INVALID_PROPERTY_ID);
    });

    test('attributes a non-colDef validation diagnostic to its own grid', () => {
        enableDevValidations({ overlay: 'warning' });
        const apiClean = gridsManager.createGrid('cleanGrid', { columnDefs, rowData } as GridOptions);
        const apiDeprecated = gridsManager.createGrid('deprecatedGrid', { columnDefs, rowData } as GridOptions);

        // validateIcon fires from deferred header/cell rendering, outside the creation scope — a different
        // emit method than colDef validation, so this guards the whole validation-service attribution.
        const DEPRECATED_ICON_ID = 43;
        beansOf(apiDeprecated).validation.validateIcon('colorPicker');

        expect(capturedIds(apiDeprecated)).toContain(DEPRECATED_ICON_ID);
        expect(capturedIds(apiClean)).not.toContain(DEPRECATED_ICON_ID);
    });

    test('attributes an async-transaction row-data diagnostic to its own grid', () => {
        enableDevValidations({ overlay: 'warning' });
        const DUPLICATE_ID_WARNING = 2;
        const txnRowData = [{ id: 'r1', athlete: 'Michael Phelps' }];
        const options = {
            columnDefs,
            rowData: txnRowData,
            getRowId: (params: any) => params.data.id,
        } as unknown as GridOptions;
        const apiClean = gridsManager.createGrid('cleanGrid', options);
        const apiTxn = gridsManager.createGrid('txnGrid', options);

        // Queue an async add whose id collides with an existing row, then flush the batch directly on the
        // row model (not via the API) so it runs outside the API's active-grid scope — the setTimeout path.
        apiTxn.applyTransactionAsync({ add: [{ id: 'r1', athlete: 'Ian Thorpe' }] });
        beansOf(apiTxn).rowModel.flushAsyncTransactions();

        expect(capturedIds(apiTxn)).toContain(DUPLICATE_ID_WARNING);
        expect(capturedIds(apiClean)).not.toContain(DUPLICATE_ID_WARNING);
    });

    test('attributes a column-build diagnostic to its own grid', () => {
        enableDevValidations({ overlay: 'warning' });
        const COLID_COLLISION_WARNING = 273;
        const apiClean = gridsManager.createGrid('cleanGrid', { columnDefs, rowData } as GridOptions);
        const apiCollision = gridsManager.createGrid('collisionGrid', { columnDefs, rowData } as GridOptions);

        // Rebuild columns with a duplicate colId directly on the column model (not via the API), so the
        // build runs outside the API's active-grid scope — the deferred column-build path.
        beansOf(apiCollision).colModel.setColumnDefs(
            [
                { colId: 'dup', field: 'a' },
                { colId: 'dup', field: 'b' },
            ],
            'api'
        );

        expect(capturedIds(apiCollision)).toContain(COLID_COLLISION_WARNING);
        expect(capturedIds(apiClean)).not.toContain(COLID_COLLISION_WARNING);
    });

    test('attributes a malformed-initialState diagnostic to its own grid', () => {
        enableDevValidations({ overlay: 'warning' });
        const SELECTION_STATE_ERROR = 103;
        // No rowData, so rowCountReady does not fire during creation and the state-restore listener stays
        // armed. A non-array selection state is rejected by setSelectionState during the restore.
        const badStateOptions = {
            columnDefs,
            initialState: { rowSelection: 'not-an-array' },
        } as unknown as GridOptions;
        const apiClean = gridsManager.createGrid('cleanGrid', { columnDefs } as GridOptions);
        const apiBadState = gridsManager.createGrid('badStateGrid', badStateOptions);

        // Fire rowCountReady directly (outside the creation scope) to run the deferred state restore.
        beansOf(apiBadState).eventSvc.dispatchEvent({ type: 'rowCountReady' });

        expect(capturedIds(apiBadState)).toContain(SELECTION_STATE_ERROR);
        expect(capturedIds(apiClean)).not.toContain(SELECTION_STATE_ERROR);
    });
});
