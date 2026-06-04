import { ClientSideRowModelModule } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar find item', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, FindModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders input with placeholder', async () => {
        const api = gridMgr.createGrid('find-render', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        });
        await new GridColumns(api, `renders input with placeholder setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `renders input with placeholder setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
        expect(input).not.toBeNull();
        expect(input!.placeholder).toBe('Find...');
        expect(input!.getAttribute('aria-label')).toBe('Find');
        await new GridRows(api, `renders input with placeholder final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('sets findSearchValue on input', async () => {
        const api = gridMgr.createGrid('find-input', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        });
        await new GridColumns(api, `sets findSearchValue on input setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `sets findSearchValue on input setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        input.value = 'Alice';
        input.dispatchEvent(new Event('input'));

        // Input is debounced; wait past the debounce window before asserting
        await new Promise<void>((resolve) => setTimeout(resolve, 350));

        expect(api.getGridOption('findSearchValue')).toBe('Alice');
        await new GridRows(api, `sets findSearchValue on input final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('match count is a label associated with the input', async () => {
        const api = gridMgr.createGrid('find-match-count-label', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        });
        await new GridColumns(api, `match count is a label associated with the input setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `match count is a label associated with the input setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        const matchCount = gridDiv.querySelector<HTMLLabelElement>('.ag-toolbar-find-match-count')!;

        expect(matchCount.tagName).toBe('LABEL');
        expect(input.id).toBeTruthy();
        expect(matchCount.getAttribute('for')).toBe(input.id);
        await new GridRows(api, `match count is a label associated with the input final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    describe('missing FindModule', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides find and logs error when FindModule is not registered', async () => {
            const errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('find-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agFindToolbarItem'] },
            });
            await new GridColumns(api, `hides find and logs error when FindModule is not registered setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `hides find and logs error when FindModule is not registered setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-find');
            expect(item).not.toBeNull();
            expect(item!.classList.contains('ag-hidden')).toBe(true);

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #302'),
                expect.stringContaining('agFindToolbarItem'),
                expect.anything()
            );

            errorSpy.mockRestore();
            await new GridRows(api, `hides find and logs error when FindModule is not registered final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `
            );
        });
    });
});
