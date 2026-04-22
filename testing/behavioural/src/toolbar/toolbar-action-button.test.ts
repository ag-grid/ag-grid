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

    test('renders a button with icon, label and tooltip', async () => {
        const api = gridMgr.createGrid('action-button-render', {
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
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button');
        expect(button).not.toBeNull();
        expect(button!.getAttribute('title')).toBe('Auto Size All');
        expect(button!.getAttribute('aria-label')).toBe('Auto Size All');
        expect(button!.querySelector('.ag-icon')).not.toBeNull();
        const label = button!.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(false);
        expect(label.textContent).toBe('Auto Size All');
    });

    test('hides label when not provided', async () => {
        const api = gridMgr.createGrid('action-button-no-label', {
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
        const label = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
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
