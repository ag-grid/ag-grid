import { cleanup, render } from '@testing-library/react';
import React from 'react';
import type { MockInstance } from 'vitest';
import { vitest } from 'vitest';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowSelectionModule,
    TestingModule,
    ValidationModule,
    agTestIdFor,
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
                groupDefaultExpanded={-1}
                sideBar="columns"
                cellSelection
                pagination
            />
        );

        expect(await rendered.findByText('United States')).toBeVisible();

        expect(await rendered.findByTestId(agTestIdFor.headerCell('year'))).toBeVisible();
        expect(await rendered.findByTestId(agTestIdFor.headerCheckbox('ag-Grid-SelectionColumn'))).toBeVisible();
        expect(await rendered.findByTestId(agTestIdFor.headerCellMenuButton('sport'))).toBeVisible();
        expect(
            await rendered.findByTestId(agTestIdFor.cell('row-group-country-United States', 'ag-Grid-AutoColumn'))
        ).toBeVisible();
        expect(await rendered.findByTestId(agTestIdFor.cell('0', 'athlete'))).toBeVisible();
    });
});
