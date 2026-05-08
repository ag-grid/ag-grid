import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

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

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
        expect(input).not.toBeNull();
        expect(input!.placeholder).toBe('Filter...');
        expect(input!.getAttribute('aria-label')).toBe('Filter');
    });

    test('sets quickFilterText on input', async () => {
        const api = gridMgr.createGrid('quick-filter-input', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }],
            toolbar: {
                items: ['agQuickFilterToolbarItem'],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        input.value = 'Alice';
        input.dispatchEvent(new Event('input'));

        // Input is debounced; wait past the debounce window before asserting
        await new Promise<void>((resolve) => setTimeout(resolve, 350));

        expect(api.getGridOption('quickFilterText')).toBe('Alice');
    });

    describe('missing QuickFilterModule', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides quickFilter and logs error when QuickFilterModule is not registered', async () => {
            const errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('quick-filter-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agQuickFilterToolbarItem'] },
            });

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
        });
    });
});
