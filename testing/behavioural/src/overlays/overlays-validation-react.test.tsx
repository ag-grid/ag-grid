import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { isAgHtmlElementVisible } from '../test-utils';

// The dev validation overlay is a standard grid overlay (OverlayService + an internal component), so it
// renders the same way under React as the built-in loading/no-rows overlays. Registering ValidationModule
// enables capture and the default 'all' overlay mode (via its onRegister hook).
describe('dev validation overlay (react)', () => {
    // An unknown grid option triggers an "invalid property" warning (#307) once the grid is alive.
    const withUnknownOption = () => ({ notARealOption: true }) as any;

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);
    });

    beforeEach(() => {
        vitest.spyOn(console, 'warn').mockImplementation(() => {});
        vitest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vitest.restoreAllMocks();
    });

    test('shows the error overlay when a diagnostic is captured', async () => {
        render(<AgGridReact columnDefs={[{ field: 'a' }]} rowData={[]} {...withUnknownOption()} />);

        await waitFor(() => expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true));
        expect(document.querySelector('.ag-overlay-error-panel')).not.toBeNull();
    });

    test('does not show the overlay for a clean configuration', async () => {
        render(<AgGridReact<{ a: string }> columnDefs={[{ field: 'a' }]} rowData={[]} />);

        // Let the grid settle, then confirm no overlay appeared.
        await waitFor(() => expect(document.querySelector('.ag-root-wrapper')).not.toBeNull());
        expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(false);
    });

    test('can be dismissed', async () => {
        render(<AgGridReact columnDefs={[{ field: 'a' }]} rowData={[]} {...withUnknownOption()} />);
        await waitFor(() => expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true));

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-dismiss')!.click();

        await waitFor(() => expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(false));
    });

    test('shows the error overlay in StrictMode', async () => {
        render(
            <React.StrictMode>
                <AgGridReact columnDefs={[{ field: 'a' }]} rowData={[]} {...withUnknownOption()} />
            </React.StrictMode>
        );

        await waitFor(() => expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true));
    });
});
