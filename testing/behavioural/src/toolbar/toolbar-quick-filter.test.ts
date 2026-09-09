import { fireEvent } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';

import { ClientSideRowModelModule, QuickFilterModule, enableDevValidations } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

describe('Toolbar quickFilter item', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, QuickFilterModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders input with placeholder', async () => {
        const api = gridMgr.createGrid('quick-filter-render', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }],
            toolbar: {
                items: ['agQuickFilterToolbarItem'],
            },
        });
        await new GridColumns(api, `renders input with placeholder setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `renders input with placeholder setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:1 name:"Bob"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
        expect(input).not.toBeNull();
        expect(input!.placeholder).toBe('Filter...');
        expect(input!.getAttribute('aria-label')).toBe('Filter');
        expect(input!.autocomplete).toBe('off');
        await new GridRows(api, `renders input with placeholder final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:1 name:"Bob"
        `);
    });

    test('toolbarItemParams.browserAutoComplete overrides enableInputAutoComplete', async () => {
        const api = gridMgr.createGrid('quick-filter-autocomplete-override', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            enableInputAutoComplete: true,
            toolbar: {
                items: [{ toolbarItem: 'agQuickFilterToolbarItem', toolbarItemParams: { browserAutoComplete: false } }],
            },
        });
        await waitForEvent('firstDataRendered', api);

        const input = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        expect(input.getAttribute('autocomplete')).toBe('off');
    });

    test('global input options control toolbar autocomplete and the clear button', async () => {
        const api = gridMgr.createGrid('quick-filter-input-options', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }],
            quickFilterText: 'Alice',
            suppressInputClearButton: true,
            enableInputAutoComplete: true,
            toolbar: { items: ['agQuickFilterToolbarItem'] },
        });
        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        const clearButton = gridDiv.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        expect(input.getAttribute('autocomplete')).toBeNull();
        expect(clearButton.classList.contains('ag-hidden')).toBe(true);
        expect(input.classList.contains('ag-input-field-input-with-clear-button')).toBe(false);

        api.setGridOption('suppressInputClearButton', false);
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);
        expect(input.classList.contains('ag-input-field-input-with-clear-button')).toBe(true);

        api.setGridOption('enableInputAutoComplete', false);
        expect(input.autocomplete).toBe('off');
    });

    test('sets quickFilterText on input', async () => {
        const api = gridMgr.createGrid('quick-filter-input', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }],
            toolbar: {
                items: ['agQuickFilterToolbarItem'],
            },
        });
        await new GridColumns(api, `sets quickFilterText on input setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `sets quickFilterText on input setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:1 name:"Bob"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        input.value = 'Alice';
        input.dispatchEvent(new Event('input'));

        // Input is debounced; wait past the debounce window before asserting
        await new Promise<void>((resolve) => setTimeout(resolve, 350));

        expect(api.getGridOption('quickFilterText')).toBe('Alice');
        const clearButton = gridDiv.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        expect(clearButton.classList.contains('ag-hidden')).toBe(false);

        const user = userEvent.setup();
        input.focus();
        await user.tab();
        expect(document.activeElement).toBe(clearButton);
        await user.tab({ shift: true });
        expect(document.activeElement).toBe(input);

        fireEvent.mouseDown(clearButton);
        fireEvent.click(clearButton);

        expect(input.value).toBe('');
        expect(api.getGridOption('quickFilterText')).toBe('');
        expect(document.activeElement).toBe(input);
        expect(clearButton.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(api, `sets quickFilterText on input final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:1 name:"Bob"
        `);
    });

    describe('missing QuickFilterModule', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides quickFilter and logs error when QuickFilterModule is not registered', async () => {
            // This test deliberately triggers error #302 (module not registered) and asserts it via a console spy.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [302] });
            const errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('quick-filter-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });
            await new GridColumns(
                api,
                `hides quickFilter and logs error when QuickFilterModule is not registered setup`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `hides quickFilter and logs error when QuickFilterModule is not registered setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-input');
            expect(item).not.toBeNull();
            expect(item!.classList.contains('ag-hidden')).toBe(true);

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #302'),
                expect.stringContaining('agQuickFilterToolbarItem'),
                expect.anything()
            );

            errorSpy.mockRestore();
            await new GridRows(
                api,
                `hides quickFilter and logs error when QuickFilterModule is not registered final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });
    });
});
