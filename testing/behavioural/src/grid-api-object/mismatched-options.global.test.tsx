import { cleanup, render } from '@testing-library/react';
import React from 'react';
import type { MockInstance } from 'vitest';
import { beforeEach } from 'vitest';

import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

describe('Mismatched rowModelType error global register', () => {
    let consoleErrorSpy: MockInstance | undefined;

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeEach(() => {
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        resetGrids();
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
    });

    describe('react module registration strategies', () => {
        beforeEach(() => {
            cleanup();
        });

        test('global register', async () => {
            ModuleRegistry.registerModules([ServerSideRowModelModule]);
            render(<AgGridReact serverSideDatasource={{ getRows: () => {} }} />);
            // The grid now falls back to the bundled client-side row model and instantiates, so
            // further runtime errors may be logged. Scan all calls for the mismatch error.
            const errorLogged = consoleErrorSpy!.mock.calls.some((call) =>
                call.some(
                    (arg) =>
                        typeof arg === 'string' &&
                        arg.includes(
                            `To use the serverSideDatasource grid option you must register the ServerSideRowModelModule and set the grid option "rowModelType='serverSide'".`
                        )
                )
            );
            expect(errorLogged).toBe(true);
        });
    });
});
