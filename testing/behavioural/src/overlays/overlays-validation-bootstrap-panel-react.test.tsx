import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// React creates the grid via GridCoreCreator.create directly, passing its own React-rendered container
// as the grid root (unlike Angular/Vue, which go through the top-level createGrid). This verifies the
// bootstrap panel still renders into that container when creation aborts (serverSide module not loaded).
describe('dev validation bootstrap panel (React)', () => {
    afterEach(() => {
        vitest.restoreAllMocks();
        cleanup();
    });

    test('renders the standalone panel when grid creation aborts', () => {
        vitest.spyOn(console, 'error').mockImplementation(() => {});

        const { container } = render(
            <AgGridReact rowModelType="serverSide" columnDefs={[{ field: 'a' }]} modules={[ValidationModule]} />
        );

        const panel = container.querySelector('.ag-overlay-error-bootstrap-panel');
        expect(panel).not.toBeNull();
        expect(panel!.textContent).toContain('AG Grid failed to initialise');
        expect(panel!.querySelector<HTMLAnchorElement>('a.ag-overlay-error-link')?.href).toContain('/errors/200');
    });

    test('renders a single panel under StrictMode (no double render)', () => {
        vitest.spyOn(console, 'error').mockImplementation(() => {});

        const { container } = render(
            <React.StrictMode>
                <AgGridReact rowModelType="serverSide" columnDefs={[{ field: 'a' }]} modules={[ValidationModule]} />
            </React.StrictMode>
        );

        // StrictMode double-invokes creation; the panel must not stack or accumulate duplicate entries.
        expect(container.querySelectorAll('.ag-overlay-error-bootstrap-panel')).toHaveLength(1);
        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(1);
    });
});
