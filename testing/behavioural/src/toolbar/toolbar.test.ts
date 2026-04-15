import { ClientSideRowModelModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders toolbar element when toolbar option is provided', async () => {
        const api = gridMgr.createGrid('toolbar-renders', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar).not.toBeNull();
    });

    test('hides toolbar when toolbar option is not provided', async () => {
        const api = gridMgr.createGrid('toolbar-hidden', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
    });

    test('renders left and right containers', async () => {
        const api = gridMgr.createGrid('toolbar-containers', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar).not.toBeNull();
    });

    test('toolbar is positioned above header drop zones', async () => {
        const api = gridMgr.createGrid('toolbar-position', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const rootWrapper = gridDiv.querySelector('.ag-root-wrapper');
        const children = Array.from(rootWrapper?.children ?? []);
        const toolbarIndex = children.findIndex((el) => el.classList.contains('ag-toolbar'));
        const bodyIndex = children.findIndex((el) => el.classList.contains('ag-root-wrapper-body'));

        expect(toolbarIndex).toBeGreaterThanOrEqual(0);
        expect(toolbarIndex).toBeLessThan(bodyIndex);
    });
});
