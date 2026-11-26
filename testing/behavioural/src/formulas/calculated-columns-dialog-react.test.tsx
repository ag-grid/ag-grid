import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout, clickMenuOption, mockGridLayout } from 'ag-test-utils';
import React from 'react';
import { expect } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { clickDialogButton, getCalculatedColumnDialog, setExpression } from './calculatedColumnDialog';

describe('calculated columns - the dialog in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            CalculatedColumnsModule,
            ColumnMenuModule,
            ContextMenuModule,
        ]);
        mockGridLayout.init();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('in React, a calculated column added from the dialog takes the focus on its header', async () => {
        let api!: GridApi;
        render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={[{ id: 'r1', a: 10, b: 3 }]}
                    columnDefs={[{ field: 'a' }, { field: 'b' }]}
                    getRowId={(params) => params.data.id}
                    calculatedColumns={{ applyMode: 'deferred' }}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(api).not.toBeUndefined());
        const before = new Set(api.getAllGridColumns().map((col) => col.getColId()));

        await act(async () => {
            api.showColumnMenu('a');
        });
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        setExpression('[a] - [b]');
        await act(async () => {
            clickDialogButton('Apply');
        });

        const added = await waitFor(() => {
            const ids = api
                .getAllGridColumns()
                .map((col) => col.getColId())
                .filter((id) => !before.has(id));
            expect(ids).toHaveLength(1);
            return ids[0];
        });
        const describeActive = () => {
            const active = document.activeElement;
            return `${active?.tagName}.${active?.className} col-id=${active?.getAttribute('col-id')}`;
        };
        await waitFor(() => {
            const header = document.querySelector(`.ag-header-cell[col-id="${added}"]`);
            expect({
                header: added,
                focused: header?.contains(document.activeElement) ?? null,
                active: describeActive(),
            }).toEqual({
                header: added,
                focused: true,
                active: expect.any(String),
            });
        });
    });
});
