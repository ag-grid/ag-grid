import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

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
        await new GridColumns(api, `renders toolbar element when toolbar option is provided setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `renders toolbar element when toolbar option is provided setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar).not.toBeNull();
        expect(toolbar?.classList.contains('ag-hidden')).toBe(false);
        await new GridRows(api, `renders toolbar element when toolbar option is provided final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('hides toolbar when toolbar option is not provided', async () => {
        const api = gridMgr.createGrid('toolbar-hidden', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
        });
        await new GridColumns(api, `hides toolbar when toolbar option is not provided setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `hides toolbar when toolbar option is not provided setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(api, `hides toolbar when toolbar option is not provided final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('hides toolbar when items array is empty', async () => {
        const api = gridMgr.createGrid('toolbar-empty-items', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [],
            },
        });
        await new GridColumns(api, `hides toolbar when items array is empty setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `hides toolbar when items array is empty setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(api, `hides toolbar when items array is empty final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('toolbar is positioned above header drop zones', async () => {
        const api = gridMgr.createGrid('toolbar-position', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [{ label: 'Test', action: () => {} }],
            },
        });
        await new GridColumns(api, `toolbar is positioned above header drop zones setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `toolbar is positioned above header drop zones setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const rootWrapper = gridDiv.querySelector('.ag-root-wrapper');
        const children = Array.from(rootWrapper?.children ?? []);
        const toolbarIndex = children.findIndex((el) => el.classList.contains('ag-toolbar'));
        const bodyIndex = children.findIndex((el) => el.classList.contains('ag-root-wrapper-body'));

        expect(toolbarIndex).toBeGreaterThanOrEqual(0);
        expect(toolbarIndex).toBeLessThan(bodyIndex);
        await new GridRows(api, `toolbar is positioned above header drop zones final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    describe('getToolbarItemInstance', () => {
        test('returns undefined when no toolbar is configured', async () => {
            const api = gridMgr.createGrid('get-instance-no-toolbar', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `returns undefined when no toolbar is configured setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `returns undefined when no toolbar is configured setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            expect(api.getToolbarItemInstance('agQuickFilterToolbarItem')).toBeUndefined();
            await new GridRows(api, `returns undefined when no toolbar is configured final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('returns undefined for an unknown key', async () => {
            const api = gridMgr.createGrid('get-instance-unknown-key', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });
            await new GridColumns(api, `returns undefined for an unknown key setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `returns undefined for an unknown key setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            expect(api.getToolbarItemInstance('nonExistentKey')).toBeUndefined();
            await new GridRows(api, `returns undefined for an unknown key final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('returns the built-in item instance by explicit key', async () => {
            const api = gridMgr.createGrid('get-instance-builtin-explicit-key', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [{ toolbarItem: 'agQuickFilterToolbarItem', key: 'myFilter' }],
                },
            });
            await new GridColumns(api, `returns the built-in item instance by explicit key setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `returns the built-in item instance by explicit key setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const instance = api.getToolbarItemInstance('myFilter');
            expect(instance).toBeDefined();
            await new GridRows(api, `returns the built-in item instance by explicit key final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('returns built in item when string form is used (no explicit key)', async () => {
            const api = gridMgr.createGrid('get-instance-builtin-string-form', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });
            await new GridColumns(api, `returns built in item when string form is used (no explicit key) setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `returns built in item when string form is used (no explicit key) setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            expect(api.getToolbarItemInstance('agQuickFilterToolbarItem')).toBeDefined();
            await new GridRows(api, `returns built in item when string form is used (no explicit key) final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);
        });

        test('returns undefined when no explicit key is given on object form', async () => {
            const api = gridMgr.createGrid('get-instance-builtin-derived-key', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [{ toolbarItem: 'agQuickFilterToolbarItem' }],
                },
            });
            await new GridColumns(api, `returns undefined when no explicit key is given on object form setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `returns undefined when no explicit key is given on object form setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            expect(api.getToolbarItemInstance('agQuickFilterToolbarItem')).toBeUndefined();
            await new GridRows(api, `returns undefined when no explicit key is given on object form final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `
            );
        });

        test('returns undefined after toolbar items are cleared at runtime', async () => {
            const api = gridMgr.createGrid('get-instance-after-clear', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [{ toolbarItem: 'agQuickFilterToolbarItem', key: 'myFilter' }],
                },
            });
            await new GridColumns(api, `returns undefined after toolbar items are cleared at runtime setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `returns undefined after toolbar items are cleared at runtime setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            expect(api.getToolbarItemInstance('myFilter')).toBeDefined();

            api.setGridOption('toolbar', { items: [] });
            await new GridColumns(
                api,
                `returns undefined after toolbar items are cleared at runtime after setGridOption toolbar`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `returns undefined after toolbar items are cleared at runtime after setGridOption toolbar`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            expect(api.getToolbarItemInstance('myFilter')).toBeUndefined();
        });
    });

    describe('duplicate items', () => {
        test('does not render duplicate built-in items in string form', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridMgr.createGrid('duplicate-string-form', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem', 'agQuickFilterToolbarItem'] },
            });
            await new GridColumns(api, `does not render duplicate built-in items in string form setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `does not render duplicate built-in items in string form setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelectorAll('.ag-toolbar-input-field').length).toBe(1);

            const warnings = warnSpy.mock.calls.flat().join(' ');
            expect(warnings).toContain('303');

            warnSpy.mockRestore();
            await new GridRows(api, `does not render duplicate built-in items in string form final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('renders duplicate built-in items when passed as objects without explicit keys', async () => {
            const api = gridMgr.createGrid('duplicate-keyless-object-form', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [{ toolbarItem: 'agQuickFilterToolbarItem' }, { toolbarItem: 'agQuickFilterToolbarItem' }],
                },
            });
            await new GridColumns(
                api,
                `renders duplicate built-in items when passed as objects without explicit keys setup`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `renders duplicate built-in items when passed as objects without explicit keys setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelectorAll('.ag-toolbar-input-field').length).toBe(2);
            await new GridRows(
                api,
                `renders duplicate built-in items when passed as objects without explicit keys final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('does not render both items when explicit keys collide and warns', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridMgr.createGrid('duplicate-explicit-key-collision', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        { toolbarItem: 'agQuickFilterToolbarItem', key: 'shared' },
                        { toolbarItem: 'agQuickFilterToolbarItem', key: 'shared' },
                    ],
                },
            });
            await new GridColumns(api, `does not render both items when explicit keys collide and warns setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `does not render both items when explicit keys collide and warns setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelectorAll('.ag-toolbar-input-field').length).toBe(1);

            const warnings = warnSpy.mock.calls.flat().join(' ');
            expect(warnings).toContain('303');

            warnSpy.mockRestore();
            await new GridRows(api, `does not render both items when explicit keys collide and warns final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);
        });
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
            await new GridColumns(api, `adds items when toolbar items are populated at runtime setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `adds items when toolbar items are populated at runtime setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-input-field')).toBeNull();

            api.setGridOption('toolbar', { items: ['agQuickFilterToolbarItem'] });
            await new GridColumns(
                api,
                `adds items when toolbar items are populated at runtime after setGridOption toolbar`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `adds items when toolbar items are populated at runtime after setGridOption toolbar`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            expect(toolbar.querySelector('.ag-toolbar-input-field')).not.toBeNull();
        });

        test('replaces items when toolbar is updated at runtime', async () => {
            const api = gridMgr.createGrid('runtime-replace-items', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });
            await new GridColumns(api, `replaces items when toolbar is updated at runtime setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `replaces items when toolbar is updated at runtime setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-input-field')).not.toBeNull();

            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });
            await new GridColumns(api, `replaces items when toolbar is updated at runtime after setGridOption toolbar`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `replaces items when toolbar is updated at runtime after setGridOption toolbar`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);

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
            await new GridColumns(api, `clears items when toolbar items are emptied at runtime setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `clears items when toolbar items are emptied at runtime setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelectorAll('.ag-toolbar-input-field')).toHaveLength(2);

            api.setGridOption('toolbar', { items: [] });
            await new GridColumns(
                api,
                `clears items when toolbar items are emptied at runtime after setGridOption toolbar`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `clears items when toolbar items are emptied at runtime after setGridOption toolbar`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

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
            await new GridColumns(api, `updates alignment when toolbar alignment changes at runtime setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `updates alignment when toolbar alignment changes at runtime setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            expect(toolbar.querySelector('.ag-toolbar-right-start')).toBeNull();

            api.setGridOption('toolbar', {
                alignment: 'right',
                items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'],
            });
            await new GridColumns(
                api,
                `updates alignment when toolbar alignment changes at runtime after setGridOption toolbar`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `updates alignment when toolbar alignment changes at runtime after setGridOption toolbar`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

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
            await new GridColumns(api, `default alignment in RTL does not force right partition setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `default alignment in RTL does not force right partition setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;

            // No right-start spacer: all items are in the left partition.
            expect(toolbar.querySelector('.ag-toolbar-right-start')).toBeNull();
            await new GridRows(api, `default alignment in RTL does not force right partition final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
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
            await new GridColumns(api, `rapid consecutive updates converge on the final configuration setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `rapid consecutive updates converge on the final configuration setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;

            // Three rapid rebuilds: any in-flight resolves from earlier generations must not leak into the DOM
            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });
            await new GridColumns(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
            api.setGridOption('toolbar', { items: ['agQuickFilterToolbarItem', 'agFindToolbarItem'] });
            await new GridColumns(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar #2`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });
            await new GridColumns(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar #3`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `rapid consecutive updates converge on the final configuration after setGridOption toolbar #3`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            // Give any pending async promises a chance to resolve
            await new Promise<void>((resolve) => setTimeout(resolve, 0));

            const inputs = toolbar.querySelectorAll<HTMLInputElement>('.ag-toolbar-input-field');
            expect(inputs).toHaveLength(1);
            expect(inputs[0].placeholder).toBe('Find...');
        });
    });
});
