import { waitFor } from '@testing-library/dom';

import { ColumnMenuModule } from 'ag-grid-enterprise';

import { TestGridsManager, polyfillOffsetParent } from '../test-utils';

describe('styled root legacy theme classes on popups', () => {
    const gridMgr = new TestGridsManager({ modules: [ColumnMenuModule] });
    let eGridDiv: HTMLElement;
    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        eGridDiv = document.createElement('div');
        eGridDiv.className = 'ag-theme-sas';
        document.body.appendChild(eGridDiv);
    });

    afterEach(() => {
        gridMgr.reset();
        eGridDiv.remove();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    test('copies the theme class to a popup styled root but not the grid root styled root', async () => {
        const api = await gridMgr.createGridAndWait(eGridDiv, {
            theme: 'legacy',
            columnDefs: [{ field: 'make' }],
            rowData: [{ make: 'Tesla' }],
        });

        // the grid's own styled root inherits the theme from eGridDiv, so must not re-apply it
        expect(document.querySelector('.ag-styled-root.ag-theme-sas')).toBeNull();

        // popups can be mounted outside the themed element, so their styled root copies the class
        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('make');
        const menu = await waitFor(() => {
            const el = document.querySelector('.ag-menu');
            if (!el) {
                throw new Error('Column menu not shown');
            }
            return el;
        });
        expect(menu.closest('.ag-styled-root.ag-theme-sas')).not.toBeNull();
    });
});
