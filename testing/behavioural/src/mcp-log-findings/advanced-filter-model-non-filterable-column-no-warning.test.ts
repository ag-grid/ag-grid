/*
 * Issue: an Advanced Filter model that names a column without filtering enabled is dropped with no console
 * warning. The model does not apply, `getAdvancedFilterModel()` returns `null`, and the only signal is the
 * Advanced Filter input's error state ("Column not found").
 *
 * Setup: ClientSideRowModelModule + AdvancedFilterModule, `enableAdvancedFilter: true`, one column
 * `{ field: 'athlete', cellDataType: 'text' }` (no `filter`), then `setAdvancedFilterModel` with a text
 * condition on `athlete`.
 *
 * Expected: a warning naming the column, as `setFilterModel()` gives for a non-filterable column (warning #63
 * "`setFilterModel()` - unable to fully apply model, filtering disabled for colId: athlete"). The Advanced
 * Filter docs say only columns with filtering enabled appear in the Advanced Filter.
 *
 * Actual: nothing is logged.
 *
 * Not reported by a client; found while reviewing the same feature (AG-18665). Two earlier repro attempts made
 * this mistake and showed the symptom.
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-19214 - re-enable once fixed
describe.skip('Advanced Filter model naming a non-filterable column', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, AdvancedFilterModule] });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('warns that the column is not filterable', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', cellDataType: 'text' }],
            rowData: [{ athlete: 'Anna' }, { athlete: 'Bob' }],
            enableAdvancedFilter: true,
        });

        // In the test environment grid warnings are thrown as errors, so capture either form.
        const messages: string[] = [];
        try {
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' });
        } catch (e) {
            messages.push(String((e as Error).message));
        }
        messages.push(...warn.mock.calls.map((args) => args.join(' ')));

        expect(api.getAdvancedFilterModel()).toBeNull();
        expect(messages.some((m) => m.includes('athlete'))).toBe(true);
    });
});
