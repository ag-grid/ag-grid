import { fireEvent, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { getGridElement } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    fakeElementAttribute,
    getAllRows,
    waitForPopup,
} from '../../test-utils';

/**
 * End-to-end behavioural coverage for the Rich Select cell editor (`agRichSelectCellEditor`).
 *
 * These tests drive the real open -> render list -> search / keyboard-navigate -> commit path
 * through the public GridApi, verifying committed cell values and the rendered popup DOM.
 *
 * jsdom has no layout, so the VirtualList only renders rows once a non-zero `offsetHeight` is
 * faked on its viewport (see `fakeElementAttribute`). Row clicks resolve the target from the
 * pointer `clientY` (not the event target), hence the `clientY` maths when committing by click.
 */

async function openEditor(api: GridApi, gridDiv: HTMLElement, rowIndex: number, colKey: string): Promise<HTMLElement> {
    api.startEditingCell({ rowIndex, colKey });
    await asyncSetTimeout(1);
    return waitForPopup(gridDiv);
}

function getRows(popup: HTMLElement): HTMLElement[] {
    return Array.from(popup.querySelectorAll<HTMLElement>('.ag-rich-select-row'));
}

function getRowLabels(popup: HTMLElement): string[] {
    return getRows(popup).map((row) => row.textContent?.trim() ?? '');
}

/** Commits a Rich Select row by clicking it. The editor reads the row from `clientY`, so a plain
 * click always lands on row 0 — we compute a `clientY` inside the target row's band. */
async function commitByClick(popup: HTMLElement, label: string): Promise<void> {
    const rows = getRows(popup);
    const index = rows.findIndex((row) => row.textContent?.trim() === label);
    if (index < 0) {
        throw new Error(`Rich Select row "${label}" not found. Available: ${getRowLabels(popup).join(', ')}`);
    }
    const target = rows[index];
    const rowHeight = target.getBoundingClientRect().height || 20;
    const clientY = rowHeight * index + rowHeight / 2;
    fireEvent(target, new MouseEvent('click', { bubbles: true, clientY }));
    await asyncSetTimeout(1);
}

/** Fires a keydown on the picker aria/wrapper element (the element the editor listens on). */
function pressKey(gridDiv: HTMLElement, key: string): void {
    const wrapper = gridDiv.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
    fireEvent.keyDown(wrapper, { key });
}

function getHighlightedRow(popup: HTMLElement): HTMLElement | undefined {
    return getRows(popup).find((row) => row.classList.contains('ag-rich-select-row-highlighted'));
}

describe('Rich Select cell editor', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule],
    });

    beforeEach(() => {
        // VirtualList skips rendering rows when the viewport height is 0 (no layout in jsdom).
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');
    });

    afterEach(() => gridMgr.reset());

    const createGrid = (options: GridOptions): Promise<GridApi> => gridMgr.createGridAndWait('grid', options);

    const baseColDef = (params: object = {}) => ({
        field: 'a',
        editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: ['Alpha', 'Beta', 'Gamma'], ...params },
    });

    // 1. Opening the editor renders the values list; clicking an item commits it and closes the popup.
    test('opening renders the values list, clicking an item commits and closes the popup', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef()],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        const popup = await openEditor(api, gridDiv, 0, 'a');
        expect(getRowLabels(popup)).toEqual(['Alpha', 'Beta', 'Gamma']);

        await commitByClick(popup, 'Gamma');

        expect(getAllRows(api)[0].data.a).toBe('Gamma');
        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
        await new GridRows(api, 'after commit Gamma').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"Gamma"
        `);
    });

    // 2. Keyboard flow: type-to-filter narrows the list, arrows move highlight, Enter commits.
    test('keyboard: type-to-filter narrows the list, arrows move highlight, Enter commits', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef({ values: ['Alpha', 'Beta', 'Gamma', 'Gadget'], filterList: true })],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        pressKey(gridDiv, 'G');
        await asyncSetTimeout(1);
        expect(getRowLabels(popup)).toEqual(['Gamma', 'Gadget']);

        // ArrowDown moves the highlight down the filtered list; commit whichever row it lands on.
        pressKey(gridDiv, 'ArrowDown');
        await asyncSetTimeout(1);
        const highlighted = getHighlightedRow(popup)?.textContent?.trim();
        expect(['Gamma', 'Gadget']).toContain(highlighted);

        pressKey(gridDiv, 'Enter');
        await asyncSetTimeout(1);
        expect(getAllRows(api)[0].data.a).toBe(highlighted);
        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
    });

    // 2b. Escape cancels without committing.
    test('keyboard: Escape closes the picker without committing', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef()],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await openEditor(api, gridDiv, 0, 'a');

        pressKey(gridDiv, 'ArrowDown');
        await asyncSetTimeout(1);
        pressKey(gridDiv, 'Escape');
        await asyncSetTimeout(1);

        expect(getAllRows(api)[0].data.a).toBe('Alpha');
        expect(gridDiv.querySelector('.ag-rich-select-list')).toBeNull();
        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
    });

    // 3. allowTyping: true filters via the typed text using formatValue.
    test('allowTyping filters the list via the typed text', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef({ values: ['Alpha', 'Beta', 'Gamma'], allowTyping: true, filterList: true })],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        const input = gridDiv.querySelector<HTMLInputElement>('.ag-rich-select-field-input input')!;
        expect(input).toBeTruthy();
        input.focus();
        await userEvent.clear(input);
        await userEvent.type(input, 'Be');

        await waitFor(() => expect(getRowLabels(popup)).toEqual(['Beta']), { timeout: 2000 });
    });

    // 4. Object values with keyCreator + formatValue: display text and committed value are correct.
    test('object values with keyCreator + formatValue commit the object and display formatted text', async () => {
        type Country = { code: string; name: string };
        const values: Country[] = [
            { code: 'IE', name: 'Ireland' },
            { code: 'FR', name: 'France' },
            { code: 'DE', name: 'Germany' },
        ];
        const api = await createGrid({
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellDataType: false,
                    cellEditor: 'agRichSelectCellEditor',
                    keyCreator: (p: { value: Country }) => p.value.code,
                    cellEditorParams: {
                        values,
                        formatValue: (value: Country) => value?.name ?? '',
                    },
                    valueFormatter: (p: { value?: Country }) => p.value?.name ?? '',
                },
            ],
            rowData: [{ id: '0', a: values[0] }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        expect(getRowLabels(popup)).toEqual(['Ireland', 'France', 'Germany']);

        await commitByClick(popup, 'France');
        expect(getAllRows(api)[0].data.a).toEqual({ code: 'FR', name: 'France' });
    });

    // 5. Async values promise populates the list.
    test('async values promise populates the list once resolved', async () => {
        const api = await createGrid({
            columnDefs: [
                baseColDef({
                    values: () =>
                        new Promise<string[]>((resolve) => setTimeout(() => resolve(['One', 'Two', 'Three']), 10)),
                }),
            ],
            rowData: [{ id: '0', a: 'One' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        await waitFor(() => expect(getRowLabels(popup)).toEqual(['One', 'Two', 'Three']));

        await commitByClick(popup, 'Two');
        expect(getAllRows(api)[0].data.a).toBe('Two');
    });

    // 6. Paged/lazy loading: valuesPage loads the initial page and renders its rows.
    test('paged values load the initial page and render its rows', async () => {
        const dataset = Array.from({ length: 30 }, (_, i) => `Item-${i}`);
        const pageRequests: { startRow: number; endRow: number }[] = [];
        const valuesPage = ({ startRow, endRow }: { startRow: number; endRow: number }) => {
            pageRequests.push({ startRow, endRow });
            return {
                values: dataset.slice(startRow, endRow),
                lastRow: dataset.length,
            };
        };
        const api = await createGrid({
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { valuesPage, valuesPageSize: 10 },
                },
            ],
            rowData: [{ id: '0', a: 'Item-0' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        await waitFor(() => expect(getRows(popup).length).toBeGreaterThan(0));

        // The initial page requests the first block (startRow 0) sized to valuesPageSize.
        expect(pageRequests[0]).toEqual({ startRow: 0, endRow: 10 });
        // Rendered rows are the leading, in-order slice of the loaded first page.
        const rendered = getRowLabels(popup);
        expect(rendered).toEqual(dataset.slice(0, rendered.length));
        expect(rendered[0]).toBe('Item-0');

        await commitByClick(popup, 'Item-0');
        expect(getAllRows(api)[0].data.a).toBe('Item-0');
    });

    // 7. multiSelect: true selects several values; committed cell value is the expected collection.
    test('multiSelect commits the selected collection', async () => {
        const api = await createGrid({
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellDataType: false,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: ['Alpha', 'Beta', 'Gamma'], multiSelect: true },
                },
            ],
            rowData: [{ id: '0', a: ['Alpha'] }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        await commitByClick(popup, 'Beta');
        await commitByClick(popup, 'Gamma');

        api.stopEditing();
        await asyncSetTimeout(1);

        const committed = getAllRows(api)[0].data.a as string[];
        expect([...committed].sort()).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    // 8. filterList + searchType 'match' filters on a leading-substring match.
    test('searchType "match" filters rows whose text contains the search string', async () => {
        const api = await createGrid({
            columnDefs: [
                baseColDef({
                    values: ['Apple', 'Apricot', 'Banana'],
                    filterList: true,
                    searchType: 'match',
                }),
            ],
            rowData: [{ id: '0', a: 'Apple' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        pressKey(gridDiv, 'A');
        pressKey(gridDiv, 'p');
        await asyncSetTimeout(1);

        expect(getRowLabels(popup)).toEqual(['Apple', 'Apricot']);
    });

    // 9. allowTyping: false blocks free-text entry; there is no typing input, selection is list-only.
    test('allowTyping false renders no text input and commits only from the list', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef({ allowTyping: false })],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        // With allowTyping:false the editor hides the text input via `setDisplayed(false)`,
        // which adds `ag-hidden` to the input field element (jsdom has no layout to assert on).
        const inputField = gridDiv.querySelector<HTMLElement>('.ag-rich-select-field-input');
        expect(inputField?.classList.contains('ag-hidden')).toBe(true);

        await commitByClick(popup, 'Beta');
        expect(getAllRows(api)[0].data.a).toBe('Beta');
    });

    // 10. highlightMatch marks matched substrings in filtered results.
    test('highlightMatch wraps the matched substring in the rendered rows', async () => {
        const api = await createGrid({
            columnDefs: [
                baseColDef({
                    values: ['Apple', 'Apricot', 'Banana'],
                    filterList: true,
                    searchType: 'match',
                    highlightMatch: true,
                }),
            ],
            rowData: [{ id: '0', a: 'Apple' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        pressKey(gridDiv, 'A');
        pressKey(gridDiv, 'p');
        await asyncSetTimeout(1);

        const highlight = popup.querySelector('.ag-rich-select-row-text-highlight');
        expect(highlight?.textContent).toBe('Ap');
    });

    // 11. Clicking outside the picker closes it.
    test('clicking outside the picker closes it', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef()],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await openEditor(api, gridDiv, 0, 'a');
        expect(gridDiv.querySelector('.ag-rich-select-list')).not.toBeNull();

        // A real click on an element outside the picker collapses it.
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        try {
            await userEvent.click(outside);
            await asyncSetTimeout(1);
            await waitFor(() => expect(gridDiv.querySelector('.ag-rich-select-list')).toBeNull());
        } finally {
            outside.remove();
        }
    });

    // 12. Empty/null initial value opens with no highlight; committing from empty works.
    test('null initial value opens with no highlighted row and commits from empty', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef()],
            rowData: [{ id: '0', a: null }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        expect(getRows(popup).some((row) => row.classList.contains('ag-rich-select-row-selected'))).toBe(false);

        await commitByClick(popup, 'Alpha');
        expect(getAllRows(api)[0].data.a).toBe('Alpha');
    });

    // 13. Navigation keys while the picker is open drive the list, not grid cell navigation.
    test('arrow keys navigate the picker list and do not move the focused grid cell', async () => {
        const api = await createGrid({
            columnDefs: [baseColDef({ values: ['Alpha', 'Beta', 'Gamma'], filterList: true })],
            rowData: [
                { id: '0', a: 'Alpha' },
                { id: '1', a: 'Beta' },
            ],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const popup = await openEditor(api, gridDiv, 0, 'a');

        pressKey(gridDiv, 'ArrowDown');
        pressKey(gridDiv, 'ArrowDown');
        await asyncSetTimeout(1);

        // Highlight moved within the list; the editing cell is still row 0 (grid did not navigate).
        expect(getHighlightedRow(popup)).toBeTruthy();
        const editingCells = api.getEditingCells();
        expect(editingCells).toHaveLength(1);
        expect(editingCells[0].rowIndex).toBe(0);
    });
});
