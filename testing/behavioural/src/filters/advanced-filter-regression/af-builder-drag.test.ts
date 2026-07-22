import type { AdvancedFilterModel, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterBuilderHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    initPointerEventPolyfill,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for reordering Advanced Filter Builder conditions by drag-and-drop (the
 * VirtualListDragFeature path): dragging a condition's grip handle and dropping it over another row
 * reorders the model. AND siblings are commutative so the rows are unchanged; the observable behaviour
 * is the persisted condition order, asserted alongside a GridRows check that the filter still applies.
 * Drag is driven through real pointer events (initPointerEventPolyfill) + the shared DragEventDispatcher.
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
};

const AND_MODEL: AdvancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [
        { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 26 },
    ],
};

const SWAPPED: AdvancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [
        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 26 },
        { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
    ],
};

// contains 'B' AND age>26 ⇒ Bond only (unchanged by reordering).
const BOND_ONLY = `
    ROOT id:ROOT_NODE_ID
    └── LEAF id:1 athlete:"Bond" age:40
`;

describe('Advanced Filter — builder drag-and-drop reorder', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        initPointerEventPolyfill();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('dragging the first condition below the second swaps their order', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel(AND_MODEL);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        await builder.forceReRender();
        const conditions = await builder.conditionItems();

        // List rows: [join(0), athlete(1), age(2)]; drop the first condition onto row 2 (after age).
        await builder.dragToRow(conditions[0], 2);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(SWAPPED);
        await new GridRows(api, 'after drag down').check(BOND_ONLY);
    });

    test('dragging the second condition above the first swaps their order', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel(AND_MODEL);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        await builder.forceReRender();
        const conditions = await builder.conditionItems();

        // Drop the second condition (age) onto the group's join row (0) so it lands first.
        await builder.dragToRow(conditions[1], 0);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(SWAPPED);
        await new GridRows(api, 'after drag up').check(BOND_ONLY);
    });
});
