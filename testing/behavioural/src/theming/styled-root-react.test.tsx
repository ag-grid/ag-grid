import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('styled root themes (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('does not re-apply a legacy theme class to the internal styled root', async () => {
        const rendered = render(
            <AgGridReact
                className="ag-theme-sas"
                theme="legacy"
                rowData={[{ make: 'Tesla' }]}
                columnDefs={[{ field: 'make' }]}
            />
        );

        await rendered.findByText('Tesla');

        expect(rendered.container.querySelectorAll('.ag-theme-sas')).toHaveLength(1);
        expect(rendered.container.firstElementChild).toHaveClass('ag-theme-sas');
        expect(rendered.container.querySelector('.ag-styled-root.ag-theme-sas')).toBeNull();
    });

    test('continues to apply Theming API classes to the internal styled root', async () => {
        const rendered = render(
            <AgGridReact
                className="customer-grid"
                theme={themeQuartz}
                rowData={[{ make: 'Tesla' }]}
                columnDefs={[{ field: 'make' }]}
            />
        );

        await rendered.findByText('Tesla');

        expect(rendered.container.querySelector('.ag-styled-root[class*="ag-theme-"]')).not.toBeNull();
    });
});
