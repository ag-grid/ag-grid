import { fireEvent, waitFor } from '@testing-library/dom';
import { TestGridsManager, getAllRows } from 'ag-test-utils';

import {
    NumberFilterModule,
    PaginationModule,
    SelectEditorModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';

const ANIMALS = ['Ant', 'Lemur', 'Lion', 'Llama', 'Lynx'];
const FILTER_SELECT = '.ag-filter-select .ag-picker-field-wrapper';
const PAGE_SIZE_SELECT = '.ag-paging-page-size .ag-picker-field-wrapper';

const options = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item[role=option]'));
const highlighted = (): string | undefined =>
    document.querySelector('.ag-list-item.ag-active-item')?.textContent?.trim();

function type(wrapper: HTMLElement, text: string): void {
    for (const key of text) {
        fireEvent.keyDown(wrapper, { key });
    }
}

describe('Typing to move to an option in grid dropdowns', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [SelectEditorModule, TextFilterModule, NumberFilterModule, PaginationModule],
    });

    afterEach(() => {
        gridMgr.reset();
        vi.useRealTimers();
    });

    const createGrid = (gridOptions: GridOptions): Promise<GridApi> => gridMgr.createGridAndWait('grid', gridOptions);

    const editorColDef = (values: unknown[], colDef: object = {}) => ({
        field: 'a',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values },
        ...colDef,
    });

    const startEditing = async (values: unknown[], value: unknown, colDef?: object) => {
        const api = await createGrid({
            columnDefs: [editorColDef(values, colDef)],
            rowData: [{ a: value }],
        });
        api.setFocusedCell(0, 'a');
        api.startEditingCell({ rowIndex: 0, colKey: 'a', key: 'Enter' });
        await waitFor(() => expect(options().length).toBeGreaterThan(0));
        const wrapper = getGridElement(api)!.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
        return { api, wrapper };
    };

    describe('agSelectCellEditor', () => {
        test('the same character cycles through matching options and wraps round', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Ant');

            const visited: (string | undefined)[] = [];
            for (let i = 0; i < 5; ++i) {
                type(wrapper, 'l');
                visited.push(highlighted());
            }

            expect(visited).toEqual(['Lemur', 'Lion', 'Llama', 'Lynx', 'Lemur']);
        });

        test('a repeated character followed by another matches the combined text', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Ant');

            type(wrapper, 'll');
            expect(highlighted()).toBe('Lion');

            type(wrapper, 'a');
            expect(highlighted()).toBe('Llama');
        });

        test('characters typed quickly match the first option with the combined text, ignoring case', async () => {
            const { wrapper } = await startEditing(['Cambodia', 'Cameroon', 'Chad', 'China'], 'Cambodia');

            type(wrapper, 'CHI');

            expect(highlighted()).toBe('China');
        });

        test('characters only combine within the time window', async () => {
            vi.useFakeTimers({ toFake: ['Date'] });
            const { wrapper } = await startEditing(ANIMALS, 'Ant');

            type(wrapper, 'l');
            expect(highlighted()).toBe('Lemur');

            vi.setSystemTime(Date.now() + 999);
            type(wrapper, 'a');
            expect(highlighted()).toBe('Lemur');

            vi.setSystemTime(Date.now() + 1001);
            type(wrapper, 'a');
            expect(highlighted()).toBe('Ant');
        });

        test('the highlight stays put when nothing matches', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Ant');

            type(wrapper, 'lz');

            expect(highlighted()).toBe('Lemur');
        });

        test('only Enter commits the option reached by typing', async () => {
            const { api, wrapper } = await startEditing(ANIMALS, 'Ant');

            type(wrapper, 'ly');
            expect(highlighted()).toBe('Lynx');
            expect(api.getCellEditorInstances()[0].getValue()).toBe('Ant');

            fireEvent.keyDown(wrapper, { key: 'Enter' });

            await waitFor(() => expect(getAllRows(api)[0].data.a).toBe('Lynx'));
        });

        test('matches the formatted text', async () => {
            const names: Record<string, string> = { en: 'English', fr: 'French' };
            const { wrapper } = await startEditing(['en', 'fr'], 'en', {
                valueFormatter: (params: { value: string }) => names[params.value],
            });

            type(wrapper, 'f');

            expect(highlighted()).toBe('French');
        });

        test('options whose text is not a string do not stop matching', async () => {
            const { wrapper } = await startEditing([null, 0, 'Ant', 'Lion'], 'Lion', { cellDataType: false });

            type(wrapper, 'a');

            expect(highlighted()).toBe('Ant');
        });

        test('ignores accents and leading whitespace in option text', async () => {
            vi.useFakeTimers({ toFake: ['Date'] });
            const { wrapper } = await startEditing(['Ant', 'Égal', '  Bee'], 'Ant');

            type(wrapper, 'e');
            expect(highlighted()).toBe('Égal');

            vi.setSystemTime(Date.now() + 1001);
            type(wrapper, 'b');
            expect(highlighted()).toBe('Bee');
        });

        test('Space joins an active search and otherwise leaves the open list alone', async () => {
            const { wrapper } = await startEditing(['Not blank', 'Not equal', 'Nothing'], 'Nothing');

            type(wrapper, ' ');
            expect(highlighted()).toBe('Nothing');

            type(wrapper, 'not e');
            expect(highlighted()).toBe('Not equal');
        });

        test('the typed text does not survive closing the list', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Lion');

            type(wrapper, 'l');
            fireEvent.keyDown(wrapper, { key: 'Escape' });
            expect(options()).toHaveLength(0);

            fireEvent.keyDown(wrapper, { key: 'Enter' });
            await waitFor(() => expect(options().length).toBeGreaterThan(0));
            type(wrapper, 'a');

            expect(highlighted()).toBe('Ant');
        });

        test('modifier shortcuts do not move the highlight', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Ant');

            fireEvent.keyDown(wrapper, { key: 'l', ctrlKey: true });
            fireEvent.keyDown(wrapper, { key: 'l', metaKey: true });
            fireEvent.keyDown(wrapper, { key: 'l', altKey: true });
            type(wrapper, 'l');

            expect(highlighted()).toBe('Lemur');
        });

        test('only pointer movement moves the highlight away from the typed option', async () => {
            const { wrapper } = await startEditing(ANIMALS, 'Ant');
            type(wrapper, 'l');

            const lion = options()[2];
            fireEvent.mouseOver(lion);
            fireEvent.mouseMove(lion, { clientX: 10, clientY: 10 });
            fireEvent.mouseMove(lion, { clientX: 10, clientY: 10 });
            expect(highlighted()).toBe('Lemur');

            fireEvent.mouseMove(lion, { clientX: 11, clientY: 10 });
            expect(highlighted()).toBe('Lion');
        });

        test('typing with the list closed opens it on the match', async () => {
            const api = await createGrid({ columnDefs: [editorColDef(ANIMALS)], rowData: [{ a: 'Ant' }] });
            api.setFocusedCell(0, 'a');
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            const wrapper = await waitFor(() => {
                const el = getGridElement(api)!.querySelector<HTMLElement>('.ag-picker-field-wrapper');
                expect(el).not.toBeNull();
                return el!;
            });
            expect(options()).toHaveLength(0);

            type(wrapper, 'l');

            expect(highlighted()).toBe('Lemur');
            expect(getAllRows(api)[0].data.a).toBe('Ant');
        });

        test('the character that starts editing is the first typed character', async () => {
            const api = await createGrid({ columnDefs: [editorColDef(ANIMALS)], rowData: [{ a: 'Ant' }] });
            api.setFocusedCell(0, 'a');
            const cell = getGridElement(api)!.querySelector<HTMLElement>('[col-id="a"][role=gridcell]')!;

            fireEvent.keyDown(cell, { key: 'l' });

            await waitFor(() => expect(highlighted()).toBe('Lemur'));

            const wrapper = getGridElement(api)!.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
            type(wrapper, 'y');
            expect(highlighted()).toBe('Lynx');
        });

        test('full row editing only opens the list of the cell that started editing', async () => {
            const api = await createGrid({
                columnDefs: [editorColDef(ANIMALS), { ...editorColDef(['Bee', 'Lark']), field: 'b' }],
                rowData: [{ a: 'Ant', b: 'Bee' }],
                editType: 'fullRow',
            });
            api.setFocusedCell(0, 'a');
            const cell = getGridElement(api)!.querySelector<HTMLElement>('[col-id="a"][role=gridcell]')!;

            fireEvent.keyDown(cell, { key: 'l' });

            await waitFor(() => expect(highlighted()).toBe('Lemur'));
            expect(options().map((option) => option.textContent?.trim())).toEqual(ANIMALS);
        });
    });

    describe('filter operator dropdown', () => {
        const openFilter = async (gridOptions: GridOptions): Promise<{ api: GridApi; wrapper: HTMLElement }> => {
            const api = await createGrid({ rowData: [{ a: 1 }], ...gridOptions });
            api.showColumnFilter('a');
            const wrapper = await waitFor(() => {
                const el = document.querySelector<HTMLElement>(FILTER_SELECT);
                expect(el).not.toBeNull();
                return el!;
            });
            return { api, wrapper };
        };

        test('cycles through text filter options and only applies on Enter', async () => {
            const { api, wrapper } = await openFilter({ columnDefs: [{ field: 'a', filter: 'agTextColumnFilter' }] });
            const initialDisplay = wrapper.querySelector('.ag-picker-field-display')?.textContent;

            type(wrapper, 'e');
            expect(highlighted()).toBe('Equals');
            type(wrapper, 'e');
            expect(highlighted()).toBe('Ends with');
            type(wrapper, 'e');
            expect(highlighted()).toBe('Equals');
            expect(wrapper.querySelector('.ag-picker-field-display')?.textContent).toBe(initialDisplay);

            fireEvent.keyDown(wrapper, { key: 'Enter' });

            expect(wrapper.querySelector('.ag-picker-field-display')?.textContent).toBe('Equals');
            expect(api.getFilterModel()).toEqual({});
        });

        test('moves to the matching number filter option', async () => {
            const { wrapper } = await openFilter({ columnDefs: [{ field: 'a', filter: 'agNumberColumnFilter' }] });

            fireEvent.keyDown(wrapper, { key: 'Enter' });
            type(wrapper, 'g');

            expect(highlighted()).toBe('Greater than');
        });

        test('a disabled dropdown does not open from typing', async () => {
            const { wrapper } = await openFilter({
                columnDefs: [{ field: 'a', filter: 'agTextColumnFilter', filterParams: { filterOptions: ['equals'] } }],
            });

            type(wrapper, 'e');

            expect(options()).toHaveLength(0);
        });
    });

    describe('pagination page-size dropdown', () => {
        test('opens on the match and only changes the page size on Enter', async () => {
            const api = await createGrid({
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                pagination: true,
                paginationPageSize: 20,
                paginationPageSizeSelector: [20, 50, 100],
            });
            const wrapper = getGridElement(api)!.querySelector<HTMLElement>(PAGE_SIZE_SELECT)!;

            type(wrapper, '5');

            expect(highlighted()).toBe('50');
            expect(api.paginationGetPageSize()).toBe(20);

            fireEvent.keyDown(wrapper, { key: 'Enter' });

            await waitFor(() => expect(api.paginationGetPageSize()).toBe(50));
        });
    });
});
