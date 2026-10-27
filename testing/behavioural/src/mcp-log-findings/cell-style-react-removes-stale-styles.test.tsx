import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';

import { CellStyleModule, ClientSideRowModelModule, ModuleRegistry, RowApiModule } from 'ag-grid-community';
import type { CellStyle, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: the React wrapper removes inline cell styles that a refreshed `cellStyle` no longer returns,
 * whereas the documented (and vanilla JavaScript) behaviour is that the grid never removes styles.
 *
 * Setup: a column with `cellStyle: (p) => p.value > 80 ? { color: 'red', fontWeight: 'bold' } : { color: 'red' }`.
 * The cell starts at value 90 (bold), then the data is changed to 10 and the cell refreshed.
 *
 * Expected: the cell-styles docs ("Style Refresh") say: "If a new style is not present, the old style is
 * left (the grid will NOT remove styles)". So `font-weight: bold` should remain on the cell after the
 * refresh, as it does in vanilla JavaScript.
 *
 * Actual: in React the user styles are held in `useState` and rendered as `style={userStyles}`, so the
 * new style object replaces the old one and React removes `font-weight`. The two frameworks differ.
 *
 * Reported on: AG Grid React 34.3 to 36.0 and Vue 35.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * Seven searches between March and September 2026 (React 34.3.1, 35.1.0, 35.2.1, 36.0.0 and Vue 35.0.0)
 * were about cellStyle styles not being removed or being left stale after a refresh, for example
 * "cellStyle function returning different style keys stale styles not removed".
 */
describe('cellStyle refresh keeps previously applied styles (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, CellStyleModule, RowApiModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('font-weight from an earlier cellStyle result remains after the cell is refreshed', async () => {
        let api: GridApi | undefined;

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[
                        {
                            field: 'score',
                            cellStyle: (p): CellStyle =>
                                p.value > 80 ? { color: 'red', fontWeight: 'bold' } : { color: 'red' },
                        },
                    ]}
                    rowData={[{ id: 'r1', score: 90 }]}
                    getRowId={(p) => p.data.id}
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </div>
        );

        const getCell = () => rendered.container.querySelector<HTMLElement>('[row-id="r1"] [col-id="score"]');

        await waitFor(() => expect(getCell()?.style.fontWeight).toBe('bold'));

        await act(async () => {
            api!.getRowNode('r1')!.setDataValue('score', 10);
        });

        await waitFor(() => expect(getCell()?.textContent).toBe('10'));
        expect(getCell()!.style.fontWeight).toBe('bold');
    });
});
