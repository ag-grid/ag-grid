import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry, RowApiModule, RowStyleModule } from 'ag-grid-community';
import type { GridApi, RowStyle } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: React removes row styles (inconsistent with vanilla). The React wrapper removes inline row styles that a
 * refreshed `getRowStyle` no longer returns, whereas the documented (and vanilla JavaScript) behaviour is that
 * previously applied styles persist.
 *
 * Note: the docs say row styles aren't removed, but React's behaviour is arguably the right one, since a user
 * expects the row to show what `getRowStyle` currently returns. So either React-specific docs should be added,
 * or vanilla brought in line with React. This test asserts the documented behaviour until that is decided.
 *
 * Setup: `getRowStyle: (p) => p.data.score > 80 ? { color: 'red', fontWeight: 'bold' } : { color: 'red' }`.
 * The row starts at score 90 (bold), then the score is changed to 10, which re-applies the row styles.
 *
 * Expected: the row-styles docs ("Refresh of Styles") say: "rowStyle: All new styles are applied. Style
 * properties not present in the new result are not removed - previously applied style properties will
 * persist on the row element." So `font-weight: bold` should remain on the row after the change,
 * as it does in vanilla JavaScript.
 *
 * Actual: in React the user row styles are held in `useState` and rendered as `style={rowStyles}`, so the
 * new style object replaces the old one and React removes `font-weight`. The two frameworks differ.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of "Cell and row styling refresh: React vs vanilla" for AG-18665.
 * It is the row-level twin of the cellStyle finding.
 */
describe('getRowStyle refresh keeps previously applied styles (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowStyleModule, RowApiModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('font-weight from an earlier getRowStyle result remains after the row data changes', async () => {
        let api: GridApi | undefined;

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'score' }]}
                    rowData={[{ id: 'r1', score: 90 }]}
                    getRowId={(p) => p.data.id}
                    getRowStyle={(p): RowStyle =>
                        p.data!.score > 80 ? { color: 'red', fontWeight: 'bold' } : { color: 'red' }
                    }
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </div>
        );

        const getRow = () => rendered.container.querySelector<HTMLElement>('[row-id="r1"]');
        const getCell = () => getRow()?.querySelector<HTMLElement>('[col-id="score"]');

        await waitFor(() => expect(getRow()?.style.fontWeight).toBe('bold'));

        await act(async () => {
            api!.getRowNode('r1')!.setDataValue('score', 10);
        });

        await waitFor(() => expect(getCell()?.textContent).toBe('10'));
        expect(getRow()!.style.fontWeight).toBe('bold');
    });
});
