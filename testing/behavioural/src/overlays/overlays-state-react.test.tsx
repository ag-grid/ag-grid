import { cleanup, render } from '@testing-library/react';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('ag-grid overlays state (react)', () => {
    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        cleanup();
    });

    test('react render of loading and no-rows', () => {
        const { rerender } = render(<AgGridReact columnDefs={columnDefs} rowData={[]} loading />);
        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} loading={false} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} loading />);
        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} loading={false} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} suppressNoRowsOverlay />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('react custom no rows overlay via overlayNoRowsTemplate', () => {
        const noRowsOverlayTemplate = '<span>No Rows Span</span>';
        const { getByText, rerender } = render(
            <AgGridReact columnDefs={columnDefs} rowData={[]} overlayNoRowsTemplate={noRowsOverlayTemplate} />
        );
        expect(getByText('No Rows Span')).toBeTruthy();

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} overlayNoRowsTemplate={noRowsOverlayTemplate} />);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('react custom no rows overlay via overlayNoRowsTemplate - simple string', () => {
        const noRowsOverlayTemplate = 'No Rows String';
        const { getByText, rerender } = render(
            <AgGridReact columnDefs={columnDefs} rowData={[]} overlayNoRowsTemplate={noRowsOverlayTemplate} />
        );
        expect(getByText('No Rows String')).toBeTruthy();

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} overlayNoRowsTemplate={noRowsOverlayTemplate} />);
        expect(hasNoRowsOverlay()).toBe(false);
    });
});
