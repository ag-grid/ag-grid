import { getByTestId, waitFor, within } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { asyncSetTimeout, mockGridLayout, waitForPopup } from 'ag-test-utils';
import React from 'react';

import {
    ClientSideRowModelModule,
    LargeTextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('Popup cell editor accessible name in React', () => {
    beforeAll(() => {
        mockGridLayout.init();
        setupAgTestIds();
    });

    afterEach(() => cleanup());

    test('names the large text editor dialog after the column being edited', async () => {
        let readyResolve!: (api: GridApi) => void;
        const readyPromise = new Promise<GridApi>((resolve) => (readyResolve = resolve));

        render(
            <div style={{ width: 800, height: 400 }}>
                <AgGridReact
                    rowData={[{ id: '0', notes: 'Qualified for the final' }]}
                    columnDefs={[
                        { field: 'notes', editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true },
                    ]}
                    getRowId={(params) => params.data.id}
                    modules={[ClientSideRowModelModule, LargeTextEditorModule]}
                    onGridReady={(params) => readyResolve(params.api)}
                />
            </div>
        );

        const gridDiv = getGridElement(await readyPromise)! as HTMLElement;
        await asyncSetTimeout(0);

        await userEvent.dblClick(getByTestId(gridDiv, agTestIdFor.cell('0', 'notes')));
        const popup = await waitForPopup(gridDiv);

        await waitFor(() => expect(within(popup).getByRole('dialog', { name: 'Notes' })).toBeTruthy());
    });
});
