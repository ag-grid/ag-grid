import { fireEvent, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { ToolbarBuiltInItemDef } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

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
        expect(input!.type).toBe('text');
        expect(input!.placeholder).toBe('Find...');
        expect(input!.getAttribute('aria-label')).toBe('Find');
        await new GridRows(api, `renders input with placeholder final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('accepts pre-existing ToolbarBuiltInItemDef typing for input items', async () => {
        // compile-time compatibility pin: this assignment must keep compiling for released user code
        const legacyDef: ToolbarBuiltInItemDef = { toolbarItem: 'agFindToolbarItem' };
        const api = gridMgr.createGrid('find-legacy-def', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: { items: [legacyDef] },
        });
        await waitForEvent('firstDataRendered', api);

        expect(TestGridsManager.getHTMLElement(api)!.querySelector('.ag-toolbar-input-field')).not.toBeNull();
    });

    test('toolbarItemParams.browserAutoComplete overrides enableInputAutoComplete', async () => {
        const api = gridMgr.createGrid('find-autocomplete-override', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            enableInputAutoComplete: true,
            toolbar: {
                items: [{ toolbarItem: 'agFindToolbarItem', toolbarItemParams: { browserAutoComplete: false } }],
            },
        });
        await waitForEvent('firstDataRendered', api);

        const input = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        expect(input.getAttribute('autocomplete')).toBe('off');
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
        const clearButton = gridDiv.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        const findButtons = gridDiv.querySelectorAll<HTMLButtonElement>('.ag-toolbar-find-button');
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);
        expect(findButtons).toHaveLength(2);
        expect(clearButton.compareDocumentPosition(findButtons[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        const user = userEvent.setup();
        input.focus();
        await user.tab();
        expect(document.activeElement).toBe(clearButton);
        await user.tab({ shift: true });
        expect(document.activeElement).toBe(input);

        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);

        expect(input.value).toBe('');
        expect(api.getGridOption('findSearchValue')).toBe('');
        expect(document.activeElement).toBe(input);
        expect(clearButton.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(api, `sets findSearchValue on input final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('input follows an external findSearchValue change', async () => {
        const api = gridMgr.createGrid('find-external-change', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        });
        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        const matchCount = gridDiv.querySelector<HTMLLabelElement>('.ag-toolbar-find-match-count')!;
        expect(input.value).toBe('');

        api.setGridOption('findSearchValue', 'Alice');

        await waitFor(() => {
            expect(input.value).toBe('Alice');
            expect(matchCount.textContent).toBe('0/1');
        });

        api.setGridOption('findSearchValue', undefined);

        await waitFor(() => {
            expect(input.value).toBe('');
            expect(matchCount.textContent).toBe('');
        });
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
            // This test deliberately triggers error #302 (module not registered) and asserts it via a console spy.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [302] });
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
