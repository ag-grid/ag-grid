import { ClientSideRowModelModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar action button item', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('label-only: renders visible label, title and aria-label fall back to label', async () => {
        const api = gridMgr.createGrid('action-button-label-only', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size All',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Auto Size All');
        expect(button.getAttribute('aria-label')).toBe('Auto Size All');
        expect(button.querySelector('.ag-icon')).not.toBeNull();
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(false);
        expect(label.textContent).toBe('Auto Size All');
    });

    test('tooltip-only: renders icon-only button with tooltip and aria-label from tooltip', async () => {
        const api = gridMgr.createGrid('action-button-tooltip-only', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'resetColumns',
                        tooltip: 'Reset Columns',
                        icon: 'minimize',
                        action: () => {},
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Reset Columns');
        expect(button.getAttribute('aria-label')).toBe('Reset Columns');
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(true);
    });

    test('label and tooltip: tooltip wins for title and aria-label; label is still shown', async () => {
        const api = gridMgr.createGrid('action-button-label-and-tooltip', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size',
                        tooltip: 'Auto-size all columns',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Auto-size all columns');
        expect(button.getAttribute('aria-label')).toBe('Auto-size all columns');
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(false);
        expect(label.textContent).toBe('Auto Size');
    });

    test('neither label nor tooltip: icon-only with no title or aria-label', async () => {
        const api = gridMgr.createGrid('action-button-no-text', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.hasAttribute('title')).toBe(false);
        expect(button.hasAttribute('aria-label')).toBe(false);
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(true);
    });

    test('invokes action with grid api, context and key on click', async () => {
        const action = vitest.fn();
        const api = gridMgr.createGrid('action-button-click', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            context: { userContext: 'hello' },
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size All',
                        icon: 'maximize',
                        action,
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();

        expect(action).toHaveBeenCalledTimes(1);
        const [params] = action.mock.calls[0];
        expect(params.api).toBe(api);
        expect(params.context).toEqual({ userContext: 'hello' });
        expect(params.key).toBe('autoSizeAll');
    });
});
