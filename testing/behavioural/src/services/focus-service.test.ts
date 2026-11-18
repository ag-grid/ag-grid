import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import { onTestFinished } from 'vitest';

import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

describe('getFocusedCell', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('returns null before any cell has been focused and after the focus is cleared', async () => {
        const api = await gridMgr.createGridAndWait('focusedCellNull', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Ann' }],
        });
        expect(api.getFocusedCell()).toBeNull();

        await userEvent.click(getGridElement(api)!.querySelector<HTMLElement>('.ag-cell[col-id="athlete"]')!);
        expect(api.getFocusedCell()?.column.getColId()).toBe('athlete');

        api.clearFocusedCell();
        expect(api.getFocusedCell()).toBeNull();
    });

    test('focuses a cell and shows the loading overlay while the grid is still held in a document fragment', async () => {
        const gridDiv = document.createDocumentFragment().appendChild(document.createElement('div'));
        const api = gridMgr.createGrid(gridDiv, {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Ann' }],
        });
        await asyncSetTimeout(0);

        api.setFocusedCell(0, 'athlete');
        api.setGridOption('loading', true);

        expect(api.getFocusedCell()?.column.getColId()).toBe('athlete');
        expect(gridDiv.querySelector('.ag-overlay-loading-center')).not.toBeNull();
    });
});

describe('focus in a grid inside a shadow root, read as in the light DOM', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ContextMenuModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const MOVES = [
        { moved: 'to a button outside the grid', expected: 'button' },
        { moved: 'away, leaving nothing focused', expected: 'cell' },
        { moved: 'to a focus-trap container around the grid', expected: 'cell' },
    ] as const;
    test.each(
        (['light', 'open', 'closed', 'nested'] as const).flatMap((mode) => MOVES.map((move) => ({ mode, ...move })))
    )(
        'in a $mode grid, closing the context menu with focus moved $moved leaves it on the $expected',
        async ({ mode, moved, expected }) => {
            const trap = document.body.appendChild(document.createElement('div'));
            trap.tabIndex = -1;
            onTestFinished(() => trap.remove());
            const outer =
                mode === 'nested'
                    ? trap.appendChild(document.createElement('div')).attachShadow({ mode: 'open' })
                    : null;
            const gridRoot: Document | ShadowRoot =
                mode === 'light'
                    ? document
                    : (outer ?? trap).appendChild(document.createElement('div')).attachShadow({
                          mode: mode === 'closed' ? 'closed' : 'open',
                      });
            const gridDiv = (mode === 'light' ? trap : gridRoot).appendChild(document.createElement('div'));
            const button = (outer ?? document.body).appendChild(document.createElement('button'));
            onTestFinished(() => button.remove());
            const api = gridMgr.createGrid(gridDiv, {
                columnDefs: [{ field: 'athlete' }],
                rowData: [{ athlete: 'Ann' }],
                getContextMenuItems: () => [{ name: 'Item' }],
            });
            await asyncSetTimeout(0);
            const cell = gridDiv.querySelector<HTMLElement>('.ag-cell[col-id="athlete"]')!;
            api.setFocusedCell(0, 'athlete');
            cell.focus();
            const shown = waitForEvent('contextMenuVisibleChanged', api);
            api.showContextMenu({
                rowNode: api.getDisplayedRowAtIndex(0),
                column: api.getColumn('athlete')!,
                value: 'Ann',
                source: 'api',
            });
            await shown;

            if (moved === 'to a button outside the grid') {
                button.focus();
            } else if (moved === 'to a focus-trap container around the grid') {
                trap.focus();
            } else {
                (gridRoot.activeElement as HTMLElement).blur();
            }
            api.hidePopupMenu();
            await asyncSetTimeout(0);

            if (expected === 'button') {
                expect((outer ?? document).activeElement).toBe(button);
            } else {
                expect(gridRoot.activeElement).toBe(cell);
            }
        }
    );
});
