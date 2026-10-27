/*
 * Issue: a modal popup (such as the column menu) does not close when the user presses the mouse on
 * the <html> element itself, which is what a click on empty page space below a short <body> targets.
 *
 * Setup: a grid with the column menu open, then a mousedown whose target is document.documentElement.
 *
 * Expected: modal popups close on a mousedown outside the popup. Only events inside the popup or inside
 * an ag-custom-component-popup element are ignored (popup and menu documentation).
 *
 * Actual: the popup's "is this inside a custom popup" check walks up from the event target until it
 * reaches document.body. Starting from <html> it never meets body, hits an element with no parent and
 * reports the click as inside a custom popup, so the menu stays open.
 *
 * Reported on: AG Grid react 35.1.0 and react 34.3.1.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents using React 35.1.0 (May 2026)
 * searched "popupParent popup not closing outside click modal overlay panel", and React 34.3.1 (April
 * 2026) searched "context menu close when clicking outside popupParent column menu".
 */
import { getByRole, queryByRole, waitFor } from '@testing-library/dom';
import { TestGridsManager, polyfillOffsetParent } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

describe('modal popup closes on mousedown on the html element', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnMenuModule] });
    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    // positive control: the same setup closes the menu when the body is pressed, so a failure below is
    // specific to the html element as the event target
    test('column menu closes when the body element is pressed', async () => {
        const api = await gridMgr.createGridAndWait('bodyClick', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
            columnMenu: 'new',
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('a');
        await waitFor(() => expect(getByRole(document.body, 'menu')).toBeTruthy());

        // retried because the popup attaches its document listeners on a zero-delay timeout
        await waitFor(() => {
            document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
            expect(queryByRole(document.body, 'menu')).toBeNull();
        });
    });

    test('column menu closes when the html element is pressed', async () => {
        const api = await gridMgr.createGridAndWait('htmlClick', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
            columnMenu: 'new',
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('a');
        await waitFor(() => expect(getByRole(document.body, 'menu')).toBeTruthy());

        // retried because the popup attaches its document listeners on a zero-delay timeout
        await waitFor(() => {
            document.documentElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
            expect(queryByRole(document.body, 'menu')).toBeNull();
        });
    });
});
