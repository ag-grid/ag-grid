import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, FindModule, QuickFilterModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders toolbar element when toolbar option is provided', async () => {
        const api = gridMgr.createGrid('toolbar-renders', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [{ label: 'Test', action: () => {} }],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar).not.toBeNull();
        expect(toolbar?.classList.contains('ag-hidden')).toBe(false);
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

    test('hides toolbar when items array is empty', async () => {
        const api = gridMgr.createGrid('toolbar-empty-items', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
    });

    test('toolbar is positioned above header drop zones', async () => {
        const api = gridMgr.createGrid('toolbar-position', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [{ label: 'Test', action: () => {} }],
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

    describe('runtime updates via setGridOption', () => {
        test('adds items when toolbar items are populated at runtime', async () => {
            // Start with an empty items array so the AG-TOOLBAR element is registered up-front
            // (the optional selector is evaluated once at grid creation based on whether `toolbar` is set).
            const api = gridMgr.createGrid('runtime-add-items', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: [] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-input-field')).toBeNull();

            api.setGridOption('toolbar', { items: ['agQuickFilterToolbarItem'] });

            expect(toolbar.querySelector('.ag-toolbar-input-field')).not.toBeNull();
        });

        test('replaces items when toolbar is updated at runtime', async () => {
            const api = gridMgr.createGrid('runtime-replace-items', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-input-field')).not.toBeNull();

            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });

            const inputs = toolbar.querySelectorAll<HTMLInputElement>('.ag-toolbar-input-field');
            expect(inputs).toHaveLength(1);
            expect(inputs[0].placeholder).toBe('Find...');
        });

        test('clears items when toolbar items are emptied at runtime', async () => {
            const api = gridMgr.createGrid('runtime-clear-items', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelectorAll('.ag-toolbar-input-field')).toHaveLength(2);

            api.setGridOption('toolbar', { items: [] });

            expect(toolbar.querySelectorAll('.ag-toolbar-input-field')).toHaveLength(0);
        });

        test('updates alignment when toolbar alignment changes at runtime', async () => {
            const api = gridMgr.createGrid('runtime-alignment', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    alignment: 'left',
                    items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-right-start')).toBeNull();

            api.setGridOption('toolbar', {
                alignment: 'right',
                items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'],
            });

            // right-start marker appears before the first right-aligned item
            const rightStart = toolbar.querySelector('.ag-toolbar-right-start');
            expect(rightStart).not.toBeNull();
            expect(toolbar.firstElementChild).toBe(rightStart);
        });

        test('default alignment in RTL does not force right partition', async () => {
            // When enableRtl is on and no alignment is set, items should stay in the
            // left partition and rely on flex to mirror them visually. Otherwise,
            // default items get pushed into the rightItems bucket and the spacer
            // ends up flipping their position versus explicit-left configs.
            const api = gridMgr.createGrid('rtl-default-alignment', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                enableRtl: true,
                toolbar: { items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;

            // No right-start spacer: all items are in the left partition.
            expect(toolbar.querySelector('.ag-toolbar-right-start')).toBeNull();
        });

        test('explicit left alignment matches inherited left alignment in RTL', async () => {
            const withExplicit = gridMgr.createGrid('rtl-explicit-left', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                enableRtl: true,
                toolbar: {
                    alignment: 'left',
                    items: [
                        { toolbarItem: 'agQuickFilterToolbarItem', alignment: 'left' },
                        { toolbarItem: 'agFindToolbarItem', alignment: 'left' },
                    ],
                },
            });
            const withInherited = gridMgr.createGrid('rtl-inherited-left', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                enableRtl: true,
                toolbar: {
                    alignment: 'left',
                    items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'],
                },
            });

            await Promise.all([
                waitForEvent('firstDataRendered', withExplicit),
                waitForEvent('firstDataRendered', withInherited),
            ]);

            const explicitToolbar =
                TestGridsManager.getHTMLElement(withExplicit)!.querySelector<HTMLElement>('.ag-toolbar')!;
            const inheritedToolbar =
                TestGridsManager.getHTMLElement(withInherited)!.querySelector<HTMLElement>('.ag-toolbar')!;

            const explicitChildClasses = Array.from(explicitToolbar.children).map((el) => el.className);
            const inheritedChildClasses = Array.from(inheritedToolbar.children).map((el) => el.className);
            expect(explicitChildClasses).toEqual(inheritedChildClasses);
        });

        test('rapid consecutive updates converge on the final configuration', async () => {
            const api = gridMgr.createGrid('runtime-rapid-updates', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;

            // Three rapid rebuilds: any in-flight resolves from earlier generations must not leak into the DOM
            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });
            api.setGridOption('toolbar', { items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'] });
            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });

            // Give any pending async promises a chance to resolve
            await new Promise<void>((resolve) => setTimeout(resolve, 0));

            const inputs = toolbar.querySelectorAll<HTMLInputElement>('.ag-toolbar-input-field');
            expect(inputs).toHaveLength(1);
            expect(inputs[0].placeholder).toBe('Find...');
        });
    });
});
