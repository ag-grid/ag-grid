import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { ValueGetterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    QuickFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { SetFilter } from 'ag-grid-enterprise';
import { PivotModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Person {
    firstName: string;
    lastName: string;
    age: number;
}

const ROW_DATA: Person[] = [
    { firstName: 'Ada', lastName: 'Lovelace', age: 36 },
    { firstName: 'Alan', lastName: 'Turing', age: 41 },
    { firstName: 'Grace', lastName: 'Hopper', age: 85 },
    { firstName: 'Linus', lastName: 'Torvalds', age: 54 },
];

describe('filterValueGetter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, QuickFilterModule],
    });

    afterEach(() => gridsManager.reset());

    test('function form filters rows by the getter result, not raw data', async () => {
        const api = await gridsManager.createGridAndWait<Person>('grid', {
            columnDefs: [
                {
                    colId: 'name',
                    field: 'firstName',
                    filter: 'agTextColumnFilter',
                    filterValueGetter: (params: ValueGetterParams<Person>) => {
                        return `${params.data!.firstName} ${params.data!.lastName}`;
                    },
                },
            ],
            rowData: ROW_DATA,
        });

        api.setFilterModel({
            name: { filterType: 'text', type: 'contains', filter: 'Turing' },
        });
        await asyncSetTimeout(0);

        await new GridRows(api, 'full name getter matches "Turing"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Alan"
        `);
    });

    test('function form can reference other columns via params.getValue', async () => {
        const api = await gridsManager.createGridAndWait<Person>('grid', {
            columnDefs: [
                { colId: 'firstName', field: 'firstName' },
                { colId: 'lastName', field: 'lastName' },
                {
                    colId: 'fullName',
                    field: 'firstName',
                    filter: 'agTextColumnFilter',
                    filterValueGetter: (params: ValueGetterParams<Person>) => {
                        const first = params.getValue('firstName');
                        const last = params.getValue('lastName');
                        return `${first} ${last}`;
                    },
                },
            ],
            rowData: ROW_DATA,
        });

        api.setFilterModel({
            fullName: { filterType: 'text', type: 'contains', filter: 'Ada Lovelace' },
        });
        await asyncSetTimeout(0);

        await new GridRows(api, 'cross-column getValue matches "Ada Lovelace"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 firstName:"Ada" lastName:"Lovelace" fullName:"Ada"
        `);
    });

    test('function form receives api and context on params', async () => {
        const seenApis: unknown[] = [];
        const seenContexts: unknown[] = [];

        const api = await gridsManager.createGridAndWait<Person>('grid', {
            context: { tenant: 'test-tenant' },
            columnDefs: [
                {
                    colId: 'name',
                    field: 'firstName',
                    filter: 'agTextColumnFilter',
                    filterValueGetter: (params: ValueGetterParams<Person>) => {
                        seenApis.push(params.api);
                        seenContexts.push(params.context);
                        return params.data!.firstName;
                    },
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(api, `function form receives api and context on params setup`).checkColumns(`
            CENTER
            └── name "First Name" width:200
        `);
        await new GridRows(api, `function form receives api and context on params setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Ada"
            ├── LEAF id:1 name:"Alan"
            ├── LEAF id:2 name:"Grace"
            └── LEAF id:3 name:"Linus"
        `);

        api.setFilterModel({
            name: { filterType: 'text', type: 'contains', filter: 'Ada' },
        });
        await new GridRows(api, `function form receives api and context on params after setFilterModel`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Ada"
        `);
        await asyncSetTimeout(0);

        expect(seenApis.length).toBeGreaterThan(0);
        for (const observed of seenApis) {
            expect(observed).toBe(api);
        }
        for (const observed of seenContexts) {
            expect(observed).toEqual({ tenant: 'test-tenant' });
        }
    });

    test('expression string form is evaluated by ExpressionService', async () => {
        const api = await gridsManager.createGridAndWait<Person>('grid', {
            columnDefs: [
                {
                    colId: 'initials',
                    field: 'firstName',
                    filter: 'agTextColumnFilter',
                    // Expression string: concatenates first-letter of firstName and lastName
                    filterValueGetter: 'data.firstName.charAt(0) + data.lastName.charAt(0)',
                },
            ],
            rowData: ROW_DATA,
        });

        api.setFilterModel({
            initials: { filterType: 'text', type: 'equals', filter: 'GH' },
        });
        await asyncSetTimeout(0);

        await new GridRows(api, 'expression-string getter matches "GH"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 initials:"Grace"
        `);
    });

    test('function form return value overrides raw cell data for filtering', async () => {
        // Raw data would make "Ada" match 'contains:Ada', but the filter getter
        // rewrites the value to lastName, so only rows whose *lastName* contains the
        // filter string should pass.
        const api = await gridsManager.createGridAndWait<Person>('grid', {
            columnDefs: [
                {
                    colId: 'name',
                    field: 'firstName',
                    filter: 'agTextColumnFilter',
                    filterValueGetter: (params: ValueGetterParams<Person>) => params.data!.lastName,
                },
            ],
            rowData: ROW_DATA,
        });

        api.setFilterModel({
            name: { filterType: 'text', type: 'contains', filter: 'Ada' },
        });
        await asyncSetTimeout(0);

        // 'Ada' appears in firstName but not in any lastName, so no rows match.
        await new GridRows(api, 'no row lastName contains "Ada"').check(`
            ROOT id:ROOT_NODE_ID
        `);

        api.setFilterModel({
            name: { filterType: 'text', type: 'contains', filter: 'Turing' },
        });
        await asyncSetTimeout(0);

        await new GridRows(api, 'only Turing lastName matches').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Alan"
        `);
    });

    describe('quick filter', () => {
        test('honours filterValueGetter when matching quick filter text', async () => {
            // Rewrite the filter value to a tag that does NOT contain the raw firstName.
            // This lets us prove that the quick filter is reading the getter output and
            // not the raw cell value: 'Ada' matches nothing, but 'HIT' matches Grace.
            const api = await gridsManager.createGridAndWait<Person>('grid', {
                columnDefs: [
                    {
                        colId: 'firstName',
                        field: 'firstName',
                        filterValueGetter: (params: ValueGetterParams<Person>) =>
                            params.data!.firstName === 'Grace' ? 'HIT' : 'MISS',
                    },
                ],
                rowData: ROW_DATA,
            });

            api.setGridOption('quickFilterText', 'HIT');
            await asyncSetTimeout(0);

            // Only Grace's getter output contains 'HIT'.
            await new GridRows(api, 'quick filter matches getter output "HIT"').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 firstName:"Grace"
            `);

            // Without the getter, 'Grace' would match the raw firstName. With the
            // getter, the filter value is 'HIT' or 'MISS' — so 'Grace' matches no rows.
            api.setGridOption('quickFilterText', 'Grace');
            await asyncSetTimeout(0);

            await new GridRows(api, 'raw firstName ignored when getter replaces value').check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('text filter UI interaction', () => {
        beforeAll(() => setupAgTestIds());

        test('typing into the filter popup input filters rows through filterValueGetter', async () => {
            const userSession = userEvent.setup();

            const api = await gridsManager.createGridAndWait<Person>('grid', {
                columnDefs: [
                    {
                        colId: 'name',
                        field: 'firstName',
                        filter: 'agTextColumnFilter',
                        // Filter value is lastName, not firstName — so typing 'Lovelace'
                        // in the input should match Ada's row, while 'Ada' should match none.
                        filterValueGetter: (params: ValueGetterParams<Person>) => params.data!.lastName,
                    },
                ],
                rowData: ROW_DATA,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(0);

            // Open the column filter popup by clicking the header filter button.
            const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('name'));
            await userSession.click(filterBtn);
            await asyncSetTimeout(0);

            // Type into the actual filter input — this drives the full flow
            // (component → model → filter evaluation → filterValueSvc.getValue).
            const input = getByTestId<HTMLInputElement>(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'column-filter' })
            );
            await userSession.type(input, 'Lovelace');

            await waitFor(() => {
                const model = api.getFilterModel()?.name;
                expect(model).toBeTruthy();
                expect(model.filter).toBe('Lovelace');
            });

            // The getter returns lastName, so 'Lovelace' matches only Ada's row.
            await new GridRows(api, 'filter popup typing filters via getter').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Ada"
            `);

            // Clear the input — typing 'Ada' (which is firstName, not lastName) must
            // match no rows because the getter replaces the filter value with lastName.
            await userSession.clear(input);
            await userSession.type(input, 'Ada');

            await waitFor(() => {
                expect(api.getFilterModel()?.name?.filter).toBe('Ada');
            });

            await new GridRows(api, 'raw firstName "Ada" is ignored, filter uses lastName').check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('set filter integration', () => {
        const setFilterGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, SetFilterModule],
        });

        afterEach(() => setFilterGridsManager.reset());

        test('set filter popup lists values produced by filterValueGetter', async () => {
            const api = await setFilterGridsManager.createGridAndWait<Person>('grid', {
                columnDefs: [
                    {
                        colId: 'ageGroup',
                        field: 'age',
                        filter: 'agSetColumnFilter',
                        // Bucket ages into 'YOUNG' (<50) and 'OLD' (>=50).
                        filterValueGetter: (params: ValueGetterParams<Person>) =>
                            params.data!.age < 50 ? 'YOUNG' : 'OLD',
                    },
                ],
                rowData: ROW_DATA,
            });
            await new GridColumns(api, `set filter popup lists values produced by filterValueGetter setup`)
                .checkColumns(`
                    CENTER
                    └── ageGroup "Age" width:200
                `);
            await new GridRows(api, `set filter popup lists values produced by filterValueGetter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 ageGroup:36
                ├── LEAF id:1 ageGroup:41
                ├── LEAF id:2 ageGroup:85
                └── LEAF id:3 ageGroup:54
            `);

            const setFilter = (await api.getColumnFilterInstance('ageGroup')) as SetFilter<any>;
            const keys = (await setFilter.handler.valueModel.allKeys) ?? [];

            // The popup checkbox list should reflect the getter's output buckets,
            // not the raw ages.
            expect([...keys].sort()).toEqual(['OLD', 'YOUNG']);
            await new GridRows(api, `set filter popup lists values produced by filterValueGetter final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 ageGroup:36
                    ├── LEAF id:1 ageGroup:41
                    ├── LEAF id:2 ageGroup:85
                    └── LEAF id:3 ageGroup:54
                `
            );
        });

        test('applying set filter with getter-output value filters rows', async () => {
            const api = await setFilterGridsManager.createGridAndWait<Person>('grid', {
                columnDefs: [
                    {
                        colId: 'ageGroup',
                        field: 'age',
                        filter: 'agSetColumnFilter',
                        filterValueGetter: (params: ValueGetterParams<Person>) =>
                            params.data!.age < 50 ? 'YOUNG' : 'OLD',
                    },
                ],
                rowData: ROW_DATA,
            });

            await api.setColumnFilterModel('ageGroup', { filterType: 'set', values: ['OLD'] });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // Only Grace (85) and Linus (54) are in the OLD bucket.
            await new GridRows(api, 'set filter keeps rows with getter output "OLD"').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 ageGroup:85
                └── LEAF id:3 ageGroup:54
            `);
        });
    });

    describe('params.getValue resolves pivot result column IDs', () => {
        const pivotGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, TextFilterModule, RowGroupingModule, PivotModule],
        });

        afterEach(() => pivotGridsManager.reset());

        interface SalesRow {
            country: string;
            year: number;
            sales: number;
        }

        const PIVOT_ROW_DATA: SalesRow[] = [
            { country: 'France', year: 2020, sales: 100 },
            { country: 'France', year: 2021, sales: 200 },
            { country: 'Germany', year: 2020, sales: 300 },
            { country: 'Germany', year: 2021, sales: 400 },
        ];

        test('colDef.valueGetter resolves pivot result column via params.getValue', async () => {
            // Filled in after pivot is active — the valueGetter closes over this variable.
            let targetPivotColId: string | null = null;

            const api = await pivotGridsManager.createGridAndWait<SalesRow>('grid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                    {
                        colId: 'doubled',
                        valueGetter: (params: ValueGetterParams<SalesRow>) => {
                            if (!targetPivotColId) {
                                return null;
                            }
                            const v = params.getValue(targetPivotColId);
                            return typeof v === 'number' ? v * 2 : null;
                        },
                    },
                ],
                rowData: PIVOT_ROW_DATA,
                pivotMode: true,
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `colDef.valueGetter resolves pivot result column via params.getValue setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
                `);
            await new GridRows(api, `colDef.valueGetter resolves pivot result column via params.getValue setup`).check(
                `
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:400 pivot_year_2021_sales:600
                    ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:100 pivot_year_2021_sales:200
                    │ ├── LEAF hidden id:0 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                    │ └── LEAF hidden id:1 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                    └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:300 pivot_year_2021_sales:400
                    · ├── LEAF hidden id:2 pivot_year_2020_sales:300 pivot_year_2021_sales:300
                    · └── LEAF hidden id:3 pivot_year_2020_sales:400 pivot_year_2021_sales:400
                `
            );

            await asyncSetTimeout(0);

            const pivotCols = api.getPivotResultColumns();
            const pivotCol2020 = pivotCols!.find((c) => c.getColId().includes('2020_sales'))!;
            targetPivotColId = pivotCol2020.getColId();

            // Group-row aggregated sales: France 2020 = 100, Germany 2020 = 300.
            const franceGroup = api.getRowNode('row-group-country-France')!;
            const germanyGroup = api.getRowNode('row-group-country-Germany')!;

            // Proves params.getValue found the pivot result column (via getColDefColOrCol)
            // and valueSvc.getValue returned its aggregated value.
            expect(api.getCellValue({ rowNode: franceGroup, colKey: 'doubled' })).toBe(200);
            expect(api.getCellValue({ rowNode: germanyGroup, colKey: 'doubled' })).toBe(600);
            await new GridRows(api, `colDef.valueGetter resolves pivot result column via params.getValue final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:400 pivot_year_2021_sales:600
                    ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:100 pivot_year_2021_sales:200
                    │ ├── LEAF hidden id:0 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                    │ └── LEAF hidden id:1 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                    └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:300 pivot_year_2021_sales:400
                    · ├── LEAF hidden id:2 pivot_year_2020_sales:300 pivot_year_2021_sales:300
                    · └── LEAF hidden id:3 pivot_year_2020_sales:400 pivot_year_2021_sales:400
                `);
        });

        test('colDef.filterValueGetter resolves pivot result column via params.getValue', async () => {
            const capturedValues: unknown[] = [];
            let targetPivotColId: string | null = null;

            const api = await pivotGridsManager.createGridAndWait<SalesRow>('grid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                    {
                        colId: 'salesFilter',
                        field: 'country',
                        filter: 'agTextColumnFilter',
                        filterValueGetter: (params: ValueGetterParams<SalesRow>) => {
                            if (!targetPivotColId) {
                                return null;
                            }
                            const v = params.getValue(targetPivotColId);
                            capturedValues.push(v);
                            return typeof v === 'number' ? `SALES_${v}` : null;
                        },
                    },
                ],
                rowData: PIVOT_ROW_DATA,
                pivotMode: true,
                groupDefaultExpanded: -1,
            });
            await new GridColumns(
                api,
                `colDef.filterValueGetter resolves pivot result column via params.getValue setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
            `);
            await new GridRows(api, `colDef.filterValueGetter resolves pivot result column via params.getValue setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:400 pivot_year_2021_sales:600
                    ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:100 pivot_year_2021_sales:200
                    │ ├── LEAF hidden id:0 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                    │ └── LEAF hidden id:1 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                    └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:300 pivot_year_2021_sales:400
                    · ├── LEAF hidden id:2 pivot_year_2020_sales:300 pivot_year_2021_sales:300
                    · └── LEAF hidden id:3 pivot_year_2020_sales:400 pivot_year_2021_sales:400
                `);

            await asyncSetTimeout(0);

            const pivotCols = api.getPivotResultColumns();
            const pivotCol2020 = pivotCols!.find((c) => c.getColId().includes('2020_sales'))!;
            targetPivotColId = pivotCol2020.getColId();

            // Trigger filter evaluation over leaf rows (where the pivot col redirects
            // to the underlying sales column via pivotValueColumn).
            api.setFilterModel({
                salesFilter: { filterType: 'text', type: 'contains', filter: 'SALES' },
            });
            await new GridRows(
                api,
                `colDef.filterValueGetter resolves pivot result column via params.getValue after setFilterModel`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:400 pivot_year_2021_sales:600
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:100 pivot_year_2021_sales:200
                │ ├── LEAF hidden id:0 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                │ └── LEAF hidden id:1 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:300 pivot_year_2021_sales:400
                · ├── LEAF hidden id:2 pivot_year_2020_sales:300 pivot_year_2021_sales:300
                · └── LEAF hidden id:3 pivot_year_2020_sales:400 pivot_year_2021_sales:400
            `);
            await asyncSetTimeout(0);

            // The closure only recorded non-null values — proves getColDefColOrCol
            // resolved the pivot col ID and valueSvc.getValue returned raw sales.
            expect(capturedValues.length).toBeGreaterThan(0);
            expect(capturedValues.every((v) => typeof v === 'number')).toBe(true);
            // Each leaf row's raw sales value should appear (100, 200, 300, 400).
            expect(new Set(capturedValues)).toEqual(new Set([100, 200, 300, 400]));
        });
    });
});
