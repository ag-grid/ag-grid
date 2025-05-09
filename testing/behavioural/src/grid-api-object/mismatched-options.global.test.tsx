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
            render(<AgGridReact />);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy!.mock.calls[0][1]).toContain(
                `To use the ServerSideRowModelModule you must set the gridOption "rowModelType='serverSide'"`
            );
        });
    });
});
