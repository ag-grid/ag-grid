import { cleanup, render } from '@testing-library/react';
import React from 'react';
import type { MockInstance } from 'vitest';
import { beforeEach } from 'vitest';

import type { GridOptions, Params } from 'ag-grid-community';
import { RowDragModule } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';
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

    test('No options provided', () => {
        createMyGrid({}, { modules: [ServerSideRowModelModule] });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy!.mock.calls[0][1]).toContain(
            `To use the ServerSideRowModelModule you must set the gridOption "rowModelType='serverSide'"`
        );
    });

    test('No options and no model modules provided should skip the check', () => {
        createMyGrid({}, { modules: [RowDragModule] });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy!.mock.calls[0][1]).toContain(
            'Missing module ClientSideRowModelModule for rowModelType clientSide.'
        );
    });

    test('If rowModelType is specified, treat that as higher priority', () => {
        createMyGrid({ rowModelType: 'infinite' }, { modules: [ServerSideRowModelModule] });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy!.mock.calls[0][1]).toContain(
            'Missing module InfiniteRowModelModule for rowModelType infinite.'
        );
    });

    test("shouldn't issue the error message if more than 1 model module is registered", () => {
        createMyGrid({}, { modules: [ServerSideRowModelModule, ClientSideRowModelModule] });
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('Module ServerSideRowModel expects rowModelType')
        );
    });

    describe('react module registration strategies', () => {
        beforeEach(() => {
            cleanup();
        });

        test('pass as props', async () => {
            render(<AgGridReact modules={[ServerSideRowModelModule]} />);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy!.mock.calls[0][1]).toContain(
                `To use the ServerSideRowModelModule you must set the gridOption "rowModelType='serverSide'"`
            );
        });
    });
});
