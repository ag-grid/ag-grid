import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, fakeElementAttribute } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';

import type { ColDef } from 'ag-grid-community';
import { enableDevValidations, getGridElement } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

/**
 * Rich Select typing filter ignores `formatValue` when `cellEditorParams` is a function.
 *
 * Setup: a column using `agRichSelectCellEditor` with object values, a `colDef.keyCreator` that returns
 * an id-like code, and `cellEditorParams` supplied as a function returning `values`, `formatValue`,
 * `allowTyping`, `filterList` and `searchType: 'match'` (the default fuzzy search re-orders non-matches rather
 * than removing them). Typing in the editor should filter the list.
 *
 * Expected: the resolved `formatValue` drives the search strings, exactly as it does when
 * `cellEditorParams` is a plain object. Sources: the Rich Select Cell Editor docs page (provided-cell-editors-rich-select)
 * documents `formatValue` for complex objects, and the Cell Editors docs page (cell-editors) documents that
 * `colDef.cellEditorParams` may be a function returning the params. Typing "Ger" narrows the list to "Germany",
 * as it does with the same params supplied as a plain object (control below).
 *
 * Actual: the editor checks `colDef.cellEditorParams?.formatValue`, which is undefined for a function,
 * so it falls back to the `keyCreator` branch (warning 266) and searches on the codes ("IE", "FR", "DE").
 * Typing "Ger" matches nothing.
 *
 * Note: warning 266 ("using `keyCreator` with the Rich Select Editor has been deprecated ... requires the
 * `formatValue` callback") would surface as a thrown error in the behavioural environment when the editor
 * starts. The test suppresses it so that it reaches the typing/search assertion at the end.
 *
 * Reported on: AG Grid 33.3.2 (Angular).
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * One search in September 2026 on Angular 33.3.2: "agRichSelectCellEditor object values formatValue
 * cellEditorParams function empty list falls back to text editor".
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('Rich Select with function cellEditorParams', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule],
    });

    beforeEach(() => {
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');
        // Warning 266 is a symptom of the bug; let it log so the test reaches the search assertion.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [266] });
    });

    afterEach(() => gridMgr.reset());

    type Country = { code: string; name: string };
    const values: Country[] = [
        { code: 'IE', name: 'Ireland' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
    ];
    const params = {
        values,
        formatValue: (value: Country) => value?.name ?? '',
        allowTyping: true,
        filterList: true,
        searchType: 'match' as const,
    };

    /** Opens the editor, types "Ger", and returns a function reading the list's labels. */
    async function typeGer(cellEditorParams: ColDef['cellEditorParams']) {
        const api = await gridMgr.createGridAndWait('grid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellDataType: false,
                    cellEditor: 'agRichSelectCellEditor',
                    keyCreator: (p: { value: Country }) => p.value.code,
                    cellEditorParams,
                    valueFormatter: (p: { value?: Country }) => p.value?.name ?? '',
                },
            ],
            rowData: [{ a: values[0] }],
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const labels = () =>
            Array.from(gridDiv.querySelectorAll<HTMLElement>('.ag-popup .ag-rich-select-row')).map(
                (row) => row.textContent?.trim() ?? ''
            );
        await waitFor(() => expect(labels()).toEqual(['Ireland', 'France', 'Germany']));

        const input = gridDiv.querySelector<HTMLInputElement>('.ag-rich-select-field-input input')!;
        input.focus();
        await userEvent.clear(input);
        await userEvent.type(input, 'Ger');
        return labels;
    }

    test('typing filters object values by the resolved formatValue, not the keyCreator', async () => {
        const labels = await typeGer(() => params);
        await waitFor(() => expect(labels()).toEqual(['Germany']));
    });

    test('control: typing filters by formatValue when cellEditorParams is a plain object', async () => {
        const labels = await typeGer(params);
        await waitFor(() => expect(labels()).toEqual(['Germany']));
    });
});
