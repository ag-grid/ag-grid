import { cleanup, render } from '@testing-library/react';
import React from 'react';
import type { MockInstance } from 'vitest';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowSelectionModule,
    TestingModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    PaginationModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
    StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ROW_DATA } from './data';

describe('Test Ids', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    beforeAll(() => {
        ModuleRegistry.registerModules([
            ColumnsToolPanelModule,
            RowSelectionModule,
            ClientSideRowModelModule,
            CellSelectionModule,
            StatusBarModule,
            TestingModule,
            ColumnMenuModule,
            PaginationModule,
            SideBarModule,
            RowGroupingModule,
            PivotModule,
            ValidationModule,
        ]);
    });

    beforeEach(() => {
        cleanup();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('Should find components via data-test-id', async () => {
        type ArrayType<T> = T extends Array<infer U> ? U : never;

        const rendered = render(
            <AgGridReact<ArrayType<typeof ROW_DATA>>
                rowData={ROW_DATA}
                columnDefs={[
                    { field: 'athlete' },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year' },
                    { field: 'sport' },
                    { field: 'total' },
                ]}
                rowSelection={{ mode: 'multiRow' }}
                statusBar={{
                    statusPanels: [
                        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
                        { statusPanel: 'agTotalRowCountComponent' },
                        { statusPanel: 'agFilteredRowCountComponent' },
                        { statusPanel: 'agSelectedRowCountComponent' },
                        { statusPanel: 'agAggregationComponent' },
                    ],
                }}
                sideBar="columns"
                cellSelection
                pagination
            />
        );

        expect(await rendered.findByText('China')).toBeVisible();

        expect(
            await rendered.findByTestId('ag-cell:row-id=row-group-country-United States;col-id=ag-Grid-AutoColumn')
        ).toBeVisible();
        // expect(await rendered.findByTestId('ag-cell:row-id=foo;col-id=ag-Grid-SelectionColumn')).toBeVisible();
        // expect(await rendered.findByTestId('ag-header-cell:row-index=0;col-id=item'));
    });
});
