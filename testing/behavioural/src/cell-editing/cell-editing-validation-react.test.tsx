import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GridRows } from 'ag-test-utils';
import React from 'react';
import { vi } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    RowApiModule,
    TextEditorModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface PersonRow {
    athlete: string;
    age: number;
}

const columnDefs: ColDef<PersonRow>[] = [
    { field: 'athlete', cellEditor: 'agTextCellEditor', cellEditorParams: { maxLength: 10 } },
    { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
];

function makeRowData(): PersonRow[] {
    return [
        { athlete: 'Alice', age: 23 },
        { athlete: 'Bob', age: 40 },
    ];
}

// React re-implements the cell/row view layer (reactUi) with async editor mounting, so the
// validation fix — which lives in the shared edit service — must be verified under React too.
describe('Cell editing validation modes (React)', () => {
    beforeAll(() => {
        // GridRows reads the grid through the API: the row model, and each cell's value.
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            NumberEditorModule,
            TextEditorModule,
            RowApiModule,
            CellApiModule,
            ColumnApiModule,
        ]);
        setupAgTestIds();
    });
    afterEach(() => cleanup());

    const renderGrid = (
        rowData: PersonRow[],
        editType: 'singleCell' | 'fullRow',
        invalidEditValueMode: 'revert' | 'block'
    ): { gridDiv: HTMLElement; getApi: () => GridApi } => {
        let api: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<PersonRow>
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={{ editable: true }}
                    editType={editType}
                    invalidEditValueMode={invalidEditValueMode}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );
        return { gridDiv: rendered.container, getApi: () => api! };
    };

    const ageInputOf = (gridDiv: HTMLElement): Promise<HTMLInputElement> =>
        waitFor(() => {
            const input = gridDiv.querySelector<HTMLInputElement>('[col-id="age"] input');
            if (!input) {
                throw new Error('age editor input not found');
            }
            return input;
        });

    const ageCellOf = (gridDiv: HTMLElement): HTMLElement =>
        gridDiv.querySelector<HTMLElement>('[row-index="0"] [col-id="age"]')!;

    test.each(['singleCell', 'fullRow'] as const)(
        'block (%s): invalid value + api.stopEditing keeps editor(s) open and does not commit',
        async (editType) => {
            const rowData = makeRowData();
            const { gridDiv, getApi } = renderGrid(rowData, editType, 'block');
            await waitFor(() => expect(getApi()).toBeTruthy());

            const user = userEvent.setup();
            await user.dblClick(ageCellOf(gridDiv));
            const input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '999');

            act(() => {
                getApi().stopEditing();
            });

            expect(getApi().getCellEditorInstances().length).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);
        }
    );

    test.each(['singleCell', 'fullRow'] as const)(
        'block (%s): invalid value + Enter keeps editor(s) open and does not commit',
        async (editType) => {
            const rowData = makeRowData();
            const { gridDiv, getApi } = renderGrid(rowData, editType, 'block');
            await waitFor(() => expect(getApi()).toBeTruthy());

            const user = userEvent.setup();
            await user.dblClick(ageCellOf(gridDiv));
            const input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '999');
            await user.keyboard('{Enter}');

            expect(getApi().getCellEditorInstances().length).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);
        }
    );

    test.each(['singleCell', 'fullRow'] as const)(
        'revert (%s): invalid value + Enter closes editor(s) and reverts',
        async (editType) => {
            const rowData = makeRowData();
            const { gridDiv, getApi } = renderGrid(rowData, editType, 'revert');
            await waitFor(() => expect(getApi()).toBeTruthy());

            const user = userEvent.setup();
            await user.dblClick(ageCellOf(gridDiv));
            const input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '999');
            await user.keyboard('{Enter}');

            await waitFor(() => expect(getApi().getCellEditorInstances().length).toBe(0));
            expect(rowData[0].age).toBe(23);
        }
    );

    test.each(['singleCell', 'fullRow'] as const)(
        'block (%s): a blocked value corrected in place commits',
        async (editType) => {
            const rowData = makeRowData();
            const onCellValueChanged = vi.fn();
            let api: GridApi | undefined;
            const rendered = render(
                <div style={{ height: 400, width: 600 }}>
                    <AgGridReact<PersonRow>
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={{ editable: true }}
                        editType={editType}
                        invalidEditValueMode="block"
                        onCellValueChanged={onCellValueChanged}
                        onGridReady={(params) => {
                            api = params.api;
                        }}
                    />
                </div>
            );
            const gridDiv = rendered.container;
            await waitFor(() => expect(api).toBeTruthy());

            const user = userEvent.setup();
            await user.dblClick(ageCellOf(gridDiv));
            let input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '999');
            await user.keyboard('{Enter}'); // blocked

            expect(api!.getCellEditorInstances().length).toBeGreaterThan(0);
            expect(onCellValueChanged).not.toHaveBeenCalled();

            input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '55');
            await user.keyboard('{Enter}'); // corrected, commits

            await waitFor(() => expect(api!.getCellEditorInstances().length).toBe(0));
            expect(rowData[0].age).toBe(55);
            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
        }
    );

    test.each(['singleCell', 'fullRow'] as const)(
        'block (%s): Tab off the last invalid cell does not leak focus to the next row',
        async (editType) => {
            const rowData = makeRowData();
            const { gridDiv, getApi } = renderGrid(rowData, editType, 'block');
            await waitFor(() => expect(getApi()).toBeTruthy());

            const user = userEvent.setup();
            // age is the last column; open it, make it invalid, then Tab forward.
            await user.dblClick(ageCellOf(gridDiv));
            const input = await ageInputOf(gridDiv);
            await user.clear(input);
            await user.type(input, '999');
            await user.keyboard('{Tab}');

            const row0 = gridDiv.querySelector<HTMLElement>('[row-index="0"]')!;
            expect(getApi().getCellEditorInstances().length).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);
            expect(gridDiv.querySelector('[row-index="1"] [col-id="athlete"] input')).toBeFalsy();
            expect(row0.contains(document.activeElement)).toBe(true);
        }
    );

    // React drives onPopupEditorClosed through its own popupEditorComp, so the shared CellCtrl fix has
    // to be verified here too: a blocked popup close must revert its own cell, not end the row edit.
    test('block (fullRow): a popup closing on an invalid value leaves the row editing', async () => {
        const rowData = makeRowData();
        let api: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<PersonRow>
                    columnDefs={[
                        { field: 'athlete', cellEditor: 'agTextCellEditor' },
                        {
                            field: 'age',
                            cellEditor: 'agNumberCellEditor',
                            cellEditorPopup: true,
                            cellEditorParams: { min: 0, max: 100 },
                        },
                    ]}
                    rowData={rowData}
                    defaultColDef={{ editable: true }}
                    editType="fullRow"
                    invalidEditValueMode="block"
                    stopEditingWhenCellsLoseFocus
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );
        const gridDiv = rendered.container;
        await waitFor(() => expect(api).toBeTruthy());

        const user = userEvent.setup();
        await user.dblClick(ageCellOf(gridDiv));
        // The popup editor mounts outside the cell, so it is not found by the in-cell lookup.
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-popup input');
            if (!el) {
                throw new Error('popup editor input not found');
            }
            return el;
        });
        await user.clear(input);
        await user.type(input, '999'); // above max: the row is held invalid

        // Focus a sibling: the popup closes, which must not end the row edit.
        const athleteInput = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>('[col-id="athlete"] input');
            if (!el) {
                throw new Error('athlete editor input not found');
            }
            return el;
        });
        await user.click(athleteInput);
        await act(async () => {
            await Promise.resolve();
        });

        expect(rowData[0].age).toBe(23); // nothing invalid written
        expect(api!.getEditingCells().length).toBeGreaterThan(0); // row edit survived the popup close

        await new GridRows(api!, 'react popup: invalid value reverted, row still editing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    // The other half of the same React path: a valid popup value must be staged as the popup closes, so
    // the row stop still commits it.
    test('block (fullRow): a valid popup value survives the popup close and commits with the row', async () => {
        const rowData = makeRowData();
        let api: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<PersonRow>
                    columnDefs={[
                        { field: 'athlete', cellEditor: 'agTextCellEditor' },
                        {
                            field: 'age',
                            cellEditor: 'agNumberCellEditor',
                            cellEditorPopup: true,
                            cellEditorParams: { min: 0, max: 100 },
                        },
                    ]}
                    rowData={rowData}
                    defaultColDef={{ editable: true }}
                    editType="fullRow"
                    invalidEditValueMode="block"
                    stopEditingWhenCellsLoseFocus
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );
        const gridDiv = rendered.container;
        await waitFor(() => expect(api).toBeTruthy());

        const user = userEvent.setup();
        await user.dblClick(ageCellOf(gridDiv));
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-popup input');
            if (!el) {
                throw new Error('popup editor input not found');
            }
            return el;
        });
        await user.clear(input);
        await user.type(input, '42'); // valid

        const athleteInput = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>('[col-id="athlete"] input');
            if (!el) {
                throw new Error('athlete editor input not found');
            }
            return el;
        });
        await user.click(athleteInput); // closes the popup, staging its value
        await act(async () => {
            await Promise.resolve();
        });

        expect(rowData[0].age).toBe(23); // full-row commits on the row stop, not on the popup close

        await new GridRows(api!, 'react popup: valid value staged by the popup close').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ⏳ id:0 athlete:"Alice" age:🖍️42 23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        await user.type(athleteInput, '{Enter}');
        await act(async () => {
            await Promise.resolve();
        });

        expect(rowData[0].age).toBe(42);

        await new GridRows(api!, 'react popup: staged value committed by the row stop').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:42
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });
});
