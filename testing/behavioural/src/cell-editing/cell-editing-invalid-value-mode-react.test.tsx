import { getByTestId } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import {
    ClientSideRowModelModule,
    NumberEditorModule,
    RowApiModule,
    ValidationModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import {
    asyncSetTimeout,
    ignoreConsoleLicenseKeyError,
    initPointerEventPolyfill,
    mockGridLayout,
    waitForInput,
    waitForPopup,
} from '../test-utils';

const overHundredEditorParams = {
    getValidationErrors: ({ value }: { value: number | null }) =>
        value != null && value > 100 ? ['Must be 100 or less'] : null,
};

async function renderGrid(): Promise<{ api: GridApi; gridDiv: HTMLElement; user: ReturnType<typeof userEvent.setup> }> {
    let readyResolve!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        readyResolve = resolve;
    });

    render(
        <div style={{ width: 800, height: 400 }}>
            <AgGridReact
                rowData={[{ id: '0', number: 10 }]}
                columnDefs={[
                    {
                        field: 'number',
                        editable: true,
                        cellEditor: 'agNumberCellEditor',
                        cellEditorPopup: true,
                        cellEditorParams: overHundredEditorParams,
                    },
                ]}
                getRowId={(params) => params.data.id}
                modules={[ValidationModule, ClientSideRowModelModule, NumberEditorModule, RowApiModule]}
                invalidEditValueMode="block"
                stopEditingWhenCellsLoseFocus={true}
                onGridReady={(params: GridReadyEvent) => readyResolve(params.api)}
            />
        </div>
    );

    const api = await readyPromise;
    const gridDiv = getGridElement(api)! as HTMLElement;
    const user = userEvent.setup({ skipHover: true });
    await asyncSetTimeout(0);

    return { api, gridDiv, user };
}

describe('Cell Editing invalidEditValueMode (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ignoreConsoleLicenseKeyError();
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test('block mode: popup editor stays open with invalid value after click outside grid', async () => {
        const { api, gridDiv, user } = await renderGrid();
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await user.dblClick(cell);
        const input = await waitForInput(gridDiv, cell, { popup: true });
        await user.clear(input);
        await user.type(input, '999');
        await asyncSetTimeout(1);
        expect(api.validateEdit()).not.toEqual([]);

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        await user.click(outside);
        await asyncSetTimeout(1);

        // block takes priority: the popup stays open with the invalid value preserved
        const popup = await waitForPopup(gridDiv);
        const invalidInput = popup.querySelector<HTMLInputElement>('input')!;
        expect(invalidInput).toBeTruthy();
        expect(invalidInput.value).toBe('999');
        expect(api.getEditingCells().length).toBeGreaterThan(0);

        // the grid is not wedged: correct the value in place and commit
        await user.clear(invalidInput);
        await user.type(invalidInput, '50');
        await asyncSetTimeout(1);
        await user.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(api.validateEdit()).toEqual([]);
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.number).toBe(50);

        outside.remove();
    });
});
