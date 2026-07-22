import type { AdvancedFilterModel, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterBuilderHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for the Advanced Filter Builder keyboard surface: the item-navigation feature
 * (Enter to focus into a row's pills, Escape to return focus to the row, focus highlight) and the
 * keyboard-accessible reorder via the Move Up/Down buttons (shown by `showMoveButtons`). Reordering
 * AND siblings does not change the result, so the observable behaviour is the model's condition order
 * and the builder tree — both asserted, alongside a GridRows check that the filter still applies.
 */
interface Row {
    athlete: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { athlete: 'Bolt', age: 25 },
    { athlete: 'Bond', age: 40 },
    { athlete: 'Ng', age: 28 },
];

const OPTS: GridOptions<Row> = {
    columnDefs: [
        { field: 'athlete', filter: true },
        { field: 'age', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
    advancedFilterBuilderParams: { showMoveButtons: true },
};

const AND_MODEL: AdvancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [
        { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 26 },
    ],
};

/** The focus wrapper of a builder condition row (the virtual-list item that the nav feature highlights). */
function focusWrapper(item: HTMLElement): HTMLElement {
    const wrapper = item.closest<HTMLElement>('.ag-advanced-filter-builder-virtual-list-item');
    if (!wrapper) {
        throw new Error('builder item has no virtual-list focus wrapper');
    }
    return wrapper;
}

/** Display text of a condition row's column pill. */
function columnPill(item: HTMLElement): string {
    return (
        item
            .querySelector('.ag-advanced-filter-builder-column-pill .ag-advanced-filter-builder-pill-display')
            ?.textContent?.trim() ?? ''
    );
}

const HIGHLIGHT = 'ag-advanced-filter-builder-virtual-list-item-highlight';

describe('Advanced Filter — builder keyboard navigation & reorder', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('Enter focuses into a row and Escape returns focus to the row, toggling the highlight', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel(AND_MODEL);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        const wrapper = focusWrapper(condition);

        // Focusing the row highlights it.
        wrapper.focus();
        await asyncSetTimeout(0);
        expect(wrapper.classList.contains(HIGHLIGHT)).toBe(true);

        // Enter moves focus into the row's editable pills.
        wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(0);
        expect(document.activeElement).not.toBe(wrapper);
        expect(condition.contains(document.activeElement)).toBe(true);

        // Escape returns focus to the row wrapper.
        document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await asyncSetTimeout(0);
        expect(document.activeElement).toBe(wrapper);

        // Moving focus away removes the highlight.
        wrapper.blur();
        wrapper.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        await asyncSetTimeout(0);
        expect(wrapper.classList.contains(HIGHLIGHT)).toBe(false);
    });

    test('the Move Down button reorders sibling conditions (keyboard Enter)', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel(AND_MODEL);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const conditions = await builder.conditionItems();
        expect(columnPill(conditions[0])).toBe('Athlete');
        expect(columnPill(conditions[1])).toBe('Age');

        // Move the first (Athlete) condition down via the keyboard, then commit.
        await builder.moveWithKeyboard(conditions[0], 'down');
        await builder.apply();
        await asyncSetTimeout(0);

        // Order flips in the persisted model; AND is commutative so the rows are unchanged.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 26 },
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
            ],
        });
        // contains 'B' AND age>26 ⇒ Bond only.
        await new GridRows(api, 'after keyboard move down').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Bond" age:40
        `);
    });

    test('the Move Up button reorders sibling conditions (click)', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel(AND_MODEL);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const conditions = await builder.conditionItems();

        // Move the second (Age) condition up above the first.
        await builder.move(conditions[1], 'up');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 26 },
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
            ],
        });
        await new GridRows(api, 'after click move up').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Bond" age:40
        `);
    });
});
