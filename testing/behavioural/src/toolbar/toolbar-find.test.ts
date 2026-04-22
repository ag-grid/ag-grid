import { ClientSideRowModelModule } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

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

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
        expect(input).not.toBeNull();
        expect(input!.placeholder).toBe('Find...');
        expect(input!.getAttribute('aria-label')).toBe('Find');
    });

    test('sets findSearchValue on input', async () => {
        const api = gridMgr.createGrid('find-input', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        input.value = 'Alice';
        input.dispatchEvent(new Event('input'));

        // Input is debounced; wait past the debounce window before asserting
        await new Promise<void>((resolve) => setTimeout(resolve, 350));

        expect(api.getGridOption('findSearchValue')).toBe('Alice');
    });

    test('match count is a label associated with the input', async () => {
        const api = gridMgr.createGrid('find-match-count-label', {
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

        expect(matchCount.tagName).toBe('LABEL');
        expect(input.id).toBeTruthy();
        expect(matchCount.getAttribute('for')).toBe(input.id);
    });

    describe('missing FindModule', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides find and logs warning when FindModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('find-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agFindToolbarItem'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-find');
            expect(item).not.toBeNull();
            expect(item!.classList.contains('ag-hidden')).toBe(true);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #302'),
                expect.stringContaining('agFindToolbarItem'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });
    });
});
