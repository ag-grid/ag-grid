import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, fakeElementAttribute } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

/**
 * Rich Select typing filter ignores `formatValue` when `cellEditorParams` is a function.
 *
 * Setup: a column using `agRichSelectCellEditor` with object values, a `colDef.keyCreator` that returns
 * an id-like code, and `cellEditorParams` supplied as a function returning `values`, `formatValue`,
 * `allowTyping` and `filterList`. Typing in the editor should filter the list.
 *
 * Expected: the resolved `formatValue` drives the search strings, exactly as it does when
 * `cellEditorParams` is a plain object. Sources: the Rich Select Cell Editor docs page (provided-cell-editors-rich-select)
 * documents `formatValue` for complex objects, and the Cell Editors docs page (cell-editors) documents that
 * `colDef.cellEditorParams` may be a function returning the params. Typing "Ger" narrows the list to "Germany".
 *
 * Actual: the editor checks `colDef.cellEditorParams?.formatValue`, which is undefined for a function,
 * so it falls back to the `keyCreator` branch (warning 266) and searches on the codes ("IE", "FR", "DE").
 * Typing "Ger" matches nothing.
 *
 * Note: warning 266 ("using `keyCreator` with the Rich Select Editor has been deprecated ... requires the
 * `formatValue` callback") surfaces as a thrown error in the behavioural environment, so this test may fail on
 * that warning (when the editor starts) before reaching the typing/search assertion at the end. Either way it
 * is the same defect: the function-valued `formatValue` was not seen.
 *
 * Reported on: AG Grid 33.3.2 (Angular).
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * One search in September 2026 on Angular 33.3.2: "agRichSelectCellEditor object values formatValue
 * cellEditorParams function empty list falls back to text editor".
 */
describe('Rich Select with function cellEditorParams', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule],
    });

    beforeEach(() => {
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');
    });

    afterEach(() => gridMgr.reset());

    test('typing filters object values by the resolved formatValue, not the keyCreator', async () => {
        type Country = { code: string; name: string };
        const values: Country[] = [
            { code: 'IE', name: 'Ireland' },
            { code: 'FR', name: 'France' },
            { code: 'DE', name: 'Germany' },
        ];
        const api: GridApi = await gridMgr.createGridAndWait('grid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellDataType: false,
                    cellEditor: 'agRichSelectCellEditor',
                    keyCreator: (p: { value: Country }) => p.value.code,
                    cellEditorParams: () => ({
                        values,
                        formatValue: (value: Country) => value?.name ?? '',
                        allowTyping: true,
                        filterList: true,
                    }),
                    valueFormatter: (p: { value?: Country }) => p.value?.name ?? '',
                },
            ],
            rowData: [{ id: '0', a: values[0] }],
            getRowId: (p) => p.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const popup = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>('.ag-popup');
            if (!el || !gridDiv.querySelector('.ag-rich-select-list')) {
                throw new Error('Rich Select picker did not open');
            }
            return el;
        });
        const labels = () =>
            Array.from(popup.querySelectorAll<HTMLElement>('.ag-rich-select-row')).map(
                (row) => row.textContent?.trim() ?? ''
            );
        await waitFor(() => expect(labels()).toEqual(['Ireland', 'France', 'Germany']));

        const input = gridDiv.querySelector<HTMLInputElement>('.ag-rich-select-field-input input')!;
        input.focus();
        await userEvent.clear(input);
        await userEvent.type(input, 'Ger');

        await waitFor(() => expect(labels()).toEqual(['Germany']), { timeout: 2000 });
    });
});
