import { cleanup, render } from '@testing-library/react';
import React from 'react';
import type { MockInstance } from 'vitest';
import { beforeEach } from 'vitest';

import type { GridOptions, Params } from 'ag-grid-community';
import { ClientSideRowModelModule, InfiniteRowModelModule, RowDragModule, createGrid } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

describe('Mismatched rowModelType error', () => {
    let consoleWarnSpy: MockInstance | undefined;
    let consoleErrorSpy: MockInstance | undefined;

    function createMyGrid(gridOptions: GridOptions = {}, extraParams: Params = {}) {
        return createGrid(document.getElementById('myGrid')!, gridOptions, extraParams);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        resetGrids();
    });
    afterEach(() => {
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    // The grid now always instantiates (falling back to the client-side row model), so additional
    // runtime errors may be logged afterwards. Scan all calls for the expected configuration error.
    function errorLogged(substr: string): boolean {
        return consoleErrorSpy!.mock.calls.some((call) =>
            call.some((arg) => typeof arg === 'string' && arg.includes(substr))
        );
    }

    test('Datasource provided without matching rowModelType warns', () => {
        // Providing a serverSideDatasource signals the user intended the server-side row model.
        createMyGrid({ serverSideDatasource: { getRows: () => {} } }, { modules: [ServerSideRowModelModule] });

        expect(
            errorLogged(
                `To use the serverSideDatasource grid option you must register the ServerSideRowModelModule and set the grid option "rowModelType='serverSide'".`
            )
        ).toBe(true);
    });

    test('No options and no model modules provided uses the bundled client-side row model', () => {
        // The client-side row model is bundled in core, so the default rowModelType always
        // resolves without an error even when the user registers no row model module.
        const api = createMyGrid({}, { modules: [RowDragModule] });

        expect(api).toBeDefined();
        expect(api.isDestroyed()).toBe(false);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('If rowModelType is specified, treat that as higher priority', () => {
        createMyGrid({ rowModelType: 'infinite' }, { modules: [ServerSideRowModelModule] });

        expect(errorLogged('Missing module InfiniteRowModelModule for rowModelType infinite.')).toBe(true);
    });

    test('row model modules registered without a datasource do not warn', () => {
        // Module presence is not a reliable intent signal (e.g. AllEnterpriseModule registers every
        // row model). Without a datasource the grid must not guess a rowModelType or warn.
        createMyGrid({}, { modules: [ServerSideRowModelModule, InfiniteRowModelModule] });
        expect(errorLogged('you must register the')).toBe(false);
    });

    describe('react module registration strategies', () => {
        beforeEach(() => {
            cleanup();
        });

        test('pass as props', async () => {
            render(<AgGridReact modules={[ServerSideRowModelModule]} serverSideDatasource={{ getRows: () => {} }} />);
            expect(
                errorLogged(
                    `To use the serverSideDatasource grid option you must register the ServerSideRowModelModule and set the grid option "rowModelType='serverSide'".`
                )
            ).toBe(true);
        });
    });
});
