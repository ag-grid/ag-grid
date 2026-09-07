import {
    AdvancedFilterBuilderHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    firePointerLikeClick,
    installFilterLayoutMock,
    nudgeVirtualList,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, ISetFilterParams, SetAdvancedFilterModel } from 'ag-grid-community';

import { DEFAULT_OPTIONS, SET_MODULES } from './advancedFilterSetFixture';

describe('Advanced Filter - Set Filter in the Builder', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the value pill shows the chosen values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica', 'Poland'],
        });
        api.showAdvancedFilterBuilder();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'builder set pill').checkFilterDom(`
            BUILDER
            AND
              Country is any of [Jamaica, Poland]
              + add
            buttons: Apply | Cancel
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
    });

    test('a long list is shortened on the pill', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica', 'Poland', 'United Kingdom', 'United States'],
        });
        api.showAdvancedFilterBuilder();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'builder long list').checkFilterDom(`
            BUILDER
            AND
              Country is any of [Jamaica, Poland, United Kingdom, +1 more]
              + add
            buttons: Apply | Cancel
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
                - "United Kingdom"
                - "United States"
        `);
    });

    test('an is none of condition reads on the pill as the option it is', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isNoneOf',
            values: ['Jamaica'],
        });
        api.showAdvancedFilterBuilder();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'builder is none of pill').checkFilterDom(`
            BUILDER
            AND
              Country is none of [Jamaica]
              + add
            buttons: Apply | Cancel
            model:
              filterType: "set"
              colId: "country"
              type: "isNoneOf"
              values:
                - "Jamaica"
        `);
    });

    test('a tree path shows on the pill as the path it is', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                    } satisfies ISetFilterParams,
                },
            ],
            rowData: [{ athlete: 'Anna Kowalski', country: 'Europe/Poland' }],
            enableAdvancedFilter: true,
        });

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Europe/Poland'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        expect(builder.valuePillText(item)).toBe('[Europe › Poland]');
    });

    test('a value the column does not hold still shows on the pill as it is stored', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Atlantis', null],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        // No path resolves for a key the values no longer hold, so the pill falls back to the key itself;
        // a blank does resolve, and reads as the Set Filter's own label for it.
        expect(builder.valuePillText(item)).toBe('[Atlantis, (Blanks)]');
    });

    test('the pill opens the column Set Filter itself', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        await firePointerLikeClick(builder.valuePills(item)[0]);
        await asyncSetTimeout(0);

        const picker = document.querySelector('.ag-advanced-filter-builder-set-picker');
        // Asserted first: `picker?.querySelector(...)` is undefined when nothing opened, which is not null.
        expect(picker).not.toBeNull();
        expect(picker!.querySelector('.ag-set-filter-list')).not.toBeNull();
        expect(picker!.querySelector('.ag-mini-filter')).not.toBeNull();
    });

    test('the pill toggles the Set Filter it opened', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        const pill = builder.valuePills(item)[0];

        await firePointerLikeClick(pill);
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-advanced-filter-builder-set-picker')).not.toBeNull();

        await firePointerLikeClick(pill);
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-advanced-filter-builder-set-picker')).toBeNull();

        await firePointerLikeClick(pill);
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-advanced-filter-builder-set-picker')).not.toBeNull();
    });

    test('a click away from the pill closes the Set Filter it opened', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        await firePointerLikeClick(builder.valuePills(item)[0]);
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-advanced-filter-builder-set-picker')).not.toBeNull();

        await firePointerLikeClick(document.body);
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-advanced-filter-builder-set-picker')).toBeNull();
    });
});

describe('Advanced Filter - Set Filter Builder round trip', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const PICKER = '.ag-advanced-filter-builder-set-picker';

    async function openPicker(api: GridApi): Promise<{ builder: AdvancedFilterBuilderHarness; item: HTMLElement }> {
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        await firePointerLikeClick(builder.valuePills(item)[0]);
        await asyncSetTimeout(0);
        nudgeVirtualList(`${PICKER} .ag-virtual-list-viewport`);
        await asyncSetTimeout(0);
        return { builder, item };
    }

    async function togglePickerItem(label: string): Promise<void> {
        nudgeVirtualList(`${PICKER} .ag-virtual-list-viewport`);
        const item = Array.from(document.querySelectorAll<HTMLElement>(`${PICKER} .ag-set-filter-item`)).find(
            (el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() === label
        );
        if (!item) {
            throw new Error(`Set Filter item "${label}" not in the Builder picker`);
        }
        await firePointerLikeClick(item.querySelector<HTMLElement>('input[type="checkbox"]') ?? item);
        await asyncSetTimeout(0);
    }

    test('a condition retargeted onto a Set Filter column in the Builder applies as a set model', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' });
        const builder = await AdvancedFilterBuilderHarness.open(api);

        const [item] = await builder.conditionItems();
        await builder.selectColumn(item, 'Country');
        await builder.selectOperator(item, 'is any of');

        await firePointerLikeClick(builder.valuePills(item)[0]);
        await asyncSetTimeout(0);
        await togglePickerItem('Jamaica');
        await builder.apply();

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        await new GridRows(api, 'builder authored set condition').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
    });

    test('ticking the last unticked value keeps every value, rather than reading as nothing selected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['United States', 'United Kingdom', 'Jamaica', 'Poland'],
        });
        const { builder, item } = await openPicker(api);
        expect(builder.valuePillText(item)).toBe('[United States, United Kingdom, Jamaica, +1 more]');

        // To the Set Filter an all-ticked list is "no selection to apply"; to a condition it is every value.
        await togglePickerItem('(Blanks)');

        // Every value, spelled out in the order the column's own list offers them.
        expect(builder.valuePillText(item)).toBe('[(Blanks), Jamaica, Poland, +2 more]');
        expect(builder.applyDisabled()).toBe(false);
        await builder.apply();
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual([
            null,
            'Jamaica',
            'Poland',
            'United Kingdom',
            'United States',
        ]);
    });

    test('the picker shows the values the condition already holds as selected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        await openPicker(api);

        const checked = Array.from(document.querySelectorAll<HTMLElement>(`${PICKER} .ag-set-filter-item`))
            .filter((el) => el.querySelector('input[type="checkbox"]:checked'))
            .map((el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim());
        expect(checked).toEqual(['Jamaica']);
    });

    test('choosing another value in the picker updates the pill, the model and the rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const { builder, item } = await openPicker(api);
        await togglePickerItem('Poland');

        // The pill follows the picker straight away; the model waits for the Builder's own Apply.
        expect(builder.valuePillText(item)).toBe('[Jamaica, Poland]');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });

        await builder.apply();

        await new FilterDom(api, 'builder picker selection applied').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
        await new GridRows(api, 'builder picker selection rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            └── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
        `);
    });

    test('changing a set option for one that takes a value drops the values and the set filterType', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        await builder.selectOperator(item, 'contains');
        await builder.setValue(item, 'Pol');
        await builder.apply();

        // `values` is not one of the operand keys, so leaving a list option has to drop it on its own account.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'country',
            type: 'contains',
            filter: 'Pol',
        });
        await new GridRows(api, 'set condition changed to a text one').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
        `);
    });

    test('changing a set option for one that takes nothing leaves no values behind either', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        await builder.selectOperator(item, 'is blank');
        await builder.apply();

        expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'text', colId: 'country', type: 'blank' });
        await new GridRows(api, 'set condition changed to is blank').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });

    test('a set option changed away and back leaves nothing chosen, not the values it held before', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(builder.valuePillText(item)).toBe('[Jamaica]');

        await builder.selectOperator(item, 'contains');
        await builder.selectOperator(item, 'is any of');

        // The values left with the option, so coming back to it is a fresh choice rather than the old one.
        // Only reachable this way: an applied model is re-parsed from the text, which never carries them.
        expect(builder.valuePillText(item)).toBe('Enter a value...');
        expect(builder.applyDisabled()).toBe(true);
    });

    test('Escape closes the picker and hands focus back to the pill, as the input pill does', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        const { builder, item } = await openPicker(api);
        const pill = builder.valuePills(item)[0];

        // The popup only answers Escape while it holds focus, which is also what makes the restore matter.
        const miniFilter = document.querySelector<HTMLElement>(`${PICKER} .ag-mini-filter input`)!;
        miniFilter.focus();
        expect(document.activeElement).toBe(miniFilter);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await asyncSetTimeout(0);

        expect(document.querySelector(PICKER)).toBeNull();
        expect(document.activeElement).toBe(pill);
    });

    test('deselecting the last value leaves the pill with nothing to show', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
        await openPicker(api);
        await togglePickerItem('Jamaica');

        await new FilterDom(api, 'builder picker emptied').checkFilterDom(`
            BUILDER
            AND
              Country is any of Enter a value... ✗
              + add
            buttons: Apply ⊘ | Cancel
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
        `);
    });
});
