import { cleanup, render } from '@testing-library/react';
import React from 'react';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowSelectionModule,
    TestingModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('Test Ids', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowSelectionModule, TestingModule, ValidationModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    const rowData = [{ item: 'foo' }];

    test('Should find components via data-test-id', async () => {
        const rendered = render(
            <AgGridReact
                rowData={rowData}
                getRowId={(params) => params.data.item}
                columnDefs={[{ field: 'item' }]}
                rowSelection={{ mode: 'multiRow' }}
            />
        );

        expect(await rendered.findByText('foo')).toBeVisible();

        expect(await rendered.findByTestId('ag-cell:row-id=foo;col-id=item')).toBeVisible();
        expect(await rendered.findByTestId('ag-cell:row-id=foo;col-id=ag-Grid-SelectionColumn')).toBeVisible();
        expect(await rendered.findByTestId('ag-header-cell:row-index=0;col-id=item'));
    });
});
