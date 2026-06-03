import {
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    AggregationModule,
    AiToolkitModule,
    MultiFilterModule,
    PivotModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

function toJSON(schema: any): any {
    return JSON.parse(JSON.stringify(schema));
}

describe('getStructuredSchema', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule],
    });

    afterEach(() => gridsManager.reset());

    describe('basic schema structure', () => {
        test('returns a schema with allColumnIds enum matching grid columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }, { field: 'country' }],
                rowData: [],
            });
            await new GridColumns(api, `returns a schema with allColumnIds enum matching grid columns setup`)
                .checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── age "Age" width:200
                    └── country "Country" width:200
                `);
            await new GridRows(api, `returns a schema with allColumnIds enum matching grid columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());

            expect(schema).toBeDefined();
            expect(schema.$defs).toBeDefined();
            expect(schema.$defs.allColumnIds.enum).toEqual(['name', 'age', 'country']);
            await new GridRows(api, `returns a schema with allColumnIds enum matching grid columns final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('includes column descriptions in allColumnIds when provided', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });
            await new GridColumns(api, `includes column descriptions in allColumnIds when provided setup`).checkColumns(
                `
                    CENTER
                    ├── name "Name" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `includes column descriptions in allColumnIds when provided setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(
                api.getStructuredSchema({
                    columns: {
                        name: { description: 'Full name of the person' },
                    },
                })
            );

            expect(schema.$defs.allColumnIds.description).toContain('name: Full name of the person');
            expect(schema.$defs.allColumnIds.description).toContain('age');
            await new GridRows(api, `includes column descriptions in allColumnIds when provided final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('columns without descriptions use colId only', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });
            await new GridColumns(api, `columns without descriptions use colId only setup`).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `columns without descriptions use colId only setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());

            expect(schema.$defs.allColumnIds.description).toBe('name\nage');
            await new GridRows(api, `columns without descriptions use colId only final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('exclude parameter', () => {
        test('excludes specified features from the schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: true }],
                rowData: [],
            });
            await new GridColumns(api, `excludes specified features from the schema setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `excludes specified features from the schema setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(
                api.getStructuredSchema({
                    exclude: ['sort', 'columnVisibility', 'columnSizing'],
                })
            );

            expect(schema.properties.sort).toBeUndefined();
            expect(schema.properties.columnVisibility).toBeUndefined();
            expect(schema.properties.columnSizing).toBeUndefined();
            await new GridRows(api, `excludes specified features from the schema final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('excludes all features when all are listed', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });
            await new GridColumns(api, `excludes all features when all are listed setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `excludes all features when all are listed setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(
                api.getStructuredSchema({
                    exclude: ['aggregation', 'filter', 'sort', 'pivot', 'columnVisibility', 'columnSizing', 'rowGroup'],
                })
            );

            expect(schema.properties).toEqual({});
            await new GridRows(api, `excludes all features when all are listed final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('sort feature', () => {
        test('includes sort schema only for sortable columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', sortable: true },
                    { field: 'age', sortable: true },
                    { field: 'hidden', sortable: false },
                ],
                rowData: [],
            });
            await new GridColumns(api, `includes sort schema only for sortable columns setup`).checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── hidden "Hidden" width:200 !sortable
            `);
            await new GridRows(api, `includes sort schema only for sortable columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.sort).toBeDefined();

            const sortItems = schema.properties.sort.properties.sortModel.items;
            const colIdEnum = sortItems.properties.colId.enum;
            expect(colIdEnum).toContain('name');
            expect(colIdEnum).toContain('age');
            expect(colIdEnum).not.toContain('hidden');
            await new GridRows(api, `includes sort schema only for sortable columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('sort model items include direction and type enums', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: true }],
                rowData: [],
            });
            await new GridColumns(api, `sort model items include direction and type enums setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `sort model items include direction and type enums setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            const sortItems = schema.properties.sort.properties.sortModel.items;
            expect(sortItems.properties.sort.enum).toEqual(['asc', 'desc']);
            expect(sortItems.properties.type.enum).toEqual(['default', 'absolute']);
            await new GridRows(api, `sort model items include direction and type enums final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('omits sort feature when no columns are sortable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: false }],
                rowData: [],
            });
            await new GridColumns(api, `omits sort feature when no columns are sortable setup`).checkColumns(`
                CENTER
                └── name "Name" width:200 !sortable
            `);
            await new GridRows(api, `omits sort feature when no columns are sortable setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.sort).toBeUndefined();
            await new GridRows(api, `omits sort feature when no columns are sortable final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('columnVisibility feature', () => {
        test('always includes columnVisibility referencing allColumnIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });
            await new GridColumns(api, `always includes columnVisibility referencing allColumnIds setup`).checkColumns(
                `
                    CENTER
                    ├── name "Name" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `always includes columnVisibility referencing allColumnIds setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            const vis = schema.properties.columnVisibility;
            expect(vis).toBeDefined();
            expect(vis.properties.hiddenColIds.items.$ref).toBe('#/$defs/allColumnIds');
            await new GridRows(api, `always includes columnVisibility referencing allColumnIds final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('columnSizing feature', () => {
        test('includes columnSizing with width and flex options for resizable columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', resizable: true },
                    { field: 'age', resizable: false },
                ],
                rowData: [],
            });
            await new GridColumns(api, `includes columnSizing with width and flex options for resizable columns setup`)
                .checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └── age "Age" width:200 !resizable
                `);
            await new GridRows(api, `includes columnSizing with width and flex options for resizable columns setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const schema = toJSON(api.getStructuredSchema());
            const sizing = schema.properties.columnSizing;
            expect(sizing).toBeDefined();

            const sizingItems = sizing.properties.columnSizingModel.items;
            expect(sizingItems.anyOf).toHaveLength(2);

            const resizableEnum = schema.$defs.resizableColumnId.enum;
            expect(resizableEnum).toContain('name');
            expect(resizableEnum).not.toContain('age');
            await new GridRows(
                api,
                `includes columnSizing with width and flex options for resizable columns final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('width option has minimum constraint and flex option has minimum constraint', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', resizable: true }],
                rowData: [],
            });
            await new GridColumns(
                api,
                `width option has minimum constraint and flex option has minimum constraint setup`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `width option has minimum constraint and flex option has minimum constraint setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const schema = toJSON(api.getStructuredSchema());
            const sizingItems = schema.properties.columnSizing.properties.columnSizingModel.items;

            const widthOption = sizingItems.anyOf.find((opt: any) => opt.properties.width);
            const flexOption = sizingItems.anyOf.find((opt: any) => opt.properties.flex);

            expect(widthOption).toBeDefined();
            expect(widthOption.properties.width.minimum).toBe(20);
            expect(widthOption.properties.colId.$ref).toBe('#/$defs/resizableColumnId');

            expect(flexOption).toBeDefined();
            expect(flexOption.properties.flex.minimum).toBe(0);
            expect(flexOption.properties.colId.$ref).toBe('#/$defs/resizableColumnId');
            await new GridRows(
                api,
                `width option has minimum constraint and flex option has minimum constraint final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('omits columnSizing when no columns are resizable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', resizable: false }],
                rowData: [],
            });
            await new GridColumns(api, `omits columnSizing when no columns are resizable setup`).checkColumns(`
                CENTER
                └── name "Name" width:200 !resizable
            `);
            await new GridRows(api, `omits columnSizing when no columns are resizable setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.columnSizing).toBeUndefined();
            await new GridRows(api, `omits columnSizing when no columns are resizable final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });
});

describe('getStructuredSchema - filter feature', () => {
    describe('column filters', () => {
        const gridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                AiToolkitModule,
                TextFilterModule,
                NumberFilterModule,
                DateFilterModule,
                CustomFilterModule,
            ],
        });
        afterEach(() => gridsManager.reset());

        test('includes text filter schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `includes text filter schema setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `includes text filter schema setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            await new GridRows(api, `includes text filter schema final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('includes number filter schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter' }],
                rowData: [{ age: 25 }],
            });
            await new GridColumns(api, `includes number filter schema setup`).checkColumns(`
                CENTER
                └── age "Age" width:200
            `);
            await new GridRows(api, `includes number filter schema setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 age:25
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.age).toBeDefined();
            await new GridRows(api, `includes number filter schema final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 age:25
            `);
        });

        test('includes date filter schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', filter: 'agDateColumnFilter' }],
                rowData: [{ date: '2024-01-01' }],
            });
            await new GridColumns(api, `includes date filter schema setup`).checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
            await new GridRows(api, `includes date filter schema setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.date).toBeDefined();
            await new GridRows(api, `includes date filter schema final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);
        });

        test('respects custom filterOptions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', 'equals'] },
                    },
                ],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `respects custom filterOptions setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `respects custom filterOptions setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = schema.properties.filter.properties.filterModel.properties.name;
            const conditionType = nameFilter.properties.conditions.items.properties.type;
            expect(conditionType.enum).toEqual(['contains', 'equals']);
            await new GridRows(api, `respects custom filterOptions final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('maxNumConditions=1 produces flat filter schema without join wrapper', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        filterParams: { maxNumConditions: 1 },
                    },
                ],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `maxNumConditions=1 produces flat filter schema without join wrapper setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `maxNumConditions=1 produces flat filter schema without join wrapper setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `
            );

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.operator).toBeUndefined();
            expect(nameFilter.properties.conditions).toBeUndefined();
            expect(nameFilter.properties.type).toBeDefined();
            expect(nameFilter.properties.filterType).toBeDefined();
            await new GridRows(api, `maxNumConditions=1 produces flat filter schema without join wrapper final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);
        });

        test('maxNumConditions > 1 wraps in join schema with operator and conditions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        filterParams: { maxNumConditions: 3 },
                    },
                ],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `maxNumConditions > 1 wraps in join schema with operator and conditions setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `maxNumConditions > 1 wraps in join schema with operator and conditions setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.operator).toBeDefined();
            expect(nameFilter.properties.operator.enum).toEqual(['AND', 'OR']);
            expect(nameFilter.properties.conditions).toBeDefined();
            expect(nameFilter.properties.conditions.maxItems).toBe(3);
            await new GridRows(
                api,
                `maxNumConditions > 1 wraps in join schema with operator and conditions final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('date filter uses ISO separator pattern when useIsoSeparator is true', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'date',
                        filter: 'agDateColumnFilter',
                        filterParams: { useIsoSeparator: true },
                    },
                ],
                rowData: [{ date: '2024-01-01' }],
            });
            await new GridColumns(api, `date filter uses ISO separator pattern when useIsoSeparator is true setup`)
                .checkColumns(`
                    CENTER
                    └── date "Date" width:200
                `);
            await new GridRows(api, `date filter uses ISO separator pattern when useIsoSeparator is true setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 date:"2024-01-01"
                `
            );

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            const dateFrom = dateFilter.properties.conditions.items.properties.dateFrom;
            expect(dateFrom.pattern).toContain('T');
            await new GridRows(api, `date filter uses ISO separator pattern when useIsoSeparator is true final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 date:"2024-01-01"
                `);
        });

        test('date filter uses space separator pattern by default', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', filter: 'agDateColumnFilter' }],
                rowData: [{ date: '2024-01-01' }],
            });
            await new GridColumns(api, `date filter uses space separator pattern by default setup`).checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
            await new GridRows(api, `date filter uses space separator pattern by default setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            const dateFrom = dateFilter.properties.conditions.items.properties.dateFrom;
            expect(dateFrom.pattern).not.toContain('T');
            expect(dateFrom.pattern).toContain('\\d{2}');
            await new GridRows(api, `date filter uses space separator pattern by default final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);
        });

        test('omits filter feature when no columns are filterable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: false }],
                rowData: [],
            });
            await new GridColumns(api, `omits filter feature when no columns are filterable setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `omits filter feature when no columns are filterable setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.filter).toBeUndefined();
            await new GridRows(api, `omits filter feature when no columns are filterable final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('uses default filter when filter=true', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: true }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `uses default filter when filter=true setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `uses default filter when filter=true setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            await new GridRows(api, `uses default filter when filter=true final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('resolves filter from object with component string', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: { component: 'agTextColumnFilter' } as any }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `resolves filter from object with component string setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `resolves filter from object with component string setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            await new GridRows(api, `resolves filter from object with component string final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('resolves filter from object with component=true using default', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: { component: true } as any }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `resolves filter from object with component=true using default setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `resolves filter from object with component=true using default setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            await new GridRows(api, `resolves filter from object with component=true using default final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `
            );
        });

        test('extracts displayKey from object-style filterOptions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            filterOptions: ['contains', { displayKey: 'customEquals' }],
                        },
                    },
                ],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `extracts displayKey from object-style filterOptions setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `extracts displayKey from object-style filterOptions setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            const conditionType = nameFilter.properties.conditions.items.properties.type;
            expect(conditionType.enum).toEqual(['contains', 'customEquals']);
            await new GridRows(api, `extracts displayKey from object-style filterOptions final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('ignores unrecognised filter keys', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', filter: 'myCustomFilter' as any },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ],
                rowData: [{ name: 'Alice', age: 25 }],
            });
            await new GridColumns(api, `ignores unrecognised filter keys setup`).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `ignores unrecognised filter keys setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:25
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeUndefined();
            expect(filterModel.properties.age).toBeDefined();
            await new GridRows(api, `ignores unrecognised filter keys final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:25
            `);
        });

        test('number filter maxNumConditions=1 produces flat schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: { maxNumConditions: 1 },
                    },
                ],
                rowData: [{ age: 25 }],
            });
            await new GridColumns(api, `number filter maxNumConditions=1 produces flat schema setup`).checkColumns(`
                CENTER
                └── age "Age" width:200
            `);
            await new GridRows(api, `number filter maxNumConditions=1 produces flat schema setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 age:25
            `);

            const schema = toJSON(api.getStructuredSchema());
            const ageFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.age);
            expect(ageFilter.properties.filterType.enum).toEqual(['number']);
            expect(ageFilter.properties.operator).toBeUndefined();
            expect(ageFilter.properties.filter).toBeDefined();
            await new GridRows(api, `number filter maxNumConditions=1 produces flat schema final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 age:25
            `);
        });

        test('date filter maxNumConditions=1 produces flat schema', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'date',
                        filter: 'agDateColumnFilter',
                        filterParams: { maxNumConditions: 1 },
                    },
                ],
                rowData: [{ date: '2024-01-01' }],
            });
            await new GridColumns(api, `date filter maxNumConditions=1 produces flat schema setup`).checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
            await new GridRows(api, `date filter maxNumConditions=1 produces flat schema setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            expect(dateFilter.properties.filterType.enum).toEqual(['date']);
            expect(dateFilter.properties.operator).toBeUndefined();
            expect(dateFilter.properties.dateFrom).toBeDefined();
            await new GridRows(api, `date filter maxNumConditions=1 produces flat schema final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 date:"2024-01-01"
            `);
        });

        test('includes multiple filter columns in filterModel', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                    { field: 'date', filter: 'agDateColumnFilter' },
                ],
                rowData: [{ name: 'Alice', age: 25, date: '2024-01-01' }],
            });
            await new GridColumns(api, `includes multiple filter columns in filterModel setup`).checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── date "Date" width:200
            `);
            await new GridRows(api, `includes multiple filter columns in filterModel setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:25 date:"2024-01-01"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            expect(filterModel.properties.age).toBeDefined();
            expect(filterModel.properties.date).toBeDefined();
            await new GridRows(api, `includes multiple filter columns in filterModel final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:25 date:"2024-01-01"
            `);
        });
    });

    describe('set filter', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, SetFilterModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes set filter schema with filterType literal', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }, { sport: 'Tennis' }],
            });
            await new GridColumns(api, `includes set filter schema with filterType literal setup`).checkColumns(`
                CENTER
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `includes set filter schema with filterType literal setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"Football"
                └── LEAF id:1 sport:"Tennis"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const sportFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.sport);
            expect(sportFilter.properties.filterType.enum).toEqual(['set']);
            expect(sportFilter.properties.values).toBeDefined();
            await new GridRows(api, `includes set filter schema with filterType literal final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"Football"
                └── LEAF id:1 sport:"Tennis"
            `);
        });

        test('includes set filter values when includeSetValues is true', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }, { sport: 'Tennis' }, { sport: 'Football' }],
                enableFilterHandlers: true,
            });
            await new GridColumns(api, `includes set filter values when includeSetValues is true setup`).checkColumns(
                `
                    CENTER
                    └── sport "Sport" width:200
                `
            );
            await new GridRows(api, `includes set filter values when includeSetValues is true setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"Football"
                ├── LEAF id:1 sport:"Tennis"
                └── LEAF id:2 sport:"Football"
            `);

            const schema = toJSON(
                api.getStructuredSchema({
                    columns: { sport: { includeSetValues: true } },
                })
            );

            const sportFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.sport);
            const valuesItems = sportFilter.properties.values.items;
            if (valuesItems.enum) {
                expect(valuesItems.enum).toContain('Football');
                expect(valuesItems.enum).toContain('Tennis');
            }
            await new GridRows(api, `includes set filter values when includeSetValues is true final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"Football"
                ├── LEAF id:1 sport:"Tennis"
                └── LEAF id:2 sport:"Football"
            `);
        });

        test('set filter values are strings when includeSetValues is false', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }],
            });
            await new GridColumns(api, `set filter values are strings when includeSetValues is false setup`)
                .checkColumns(`
                    CENTER
                    └── sport "Sport" width:200
                `);
            await new GridRows(api, `set filter values are strings when includeSetValues is false setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 sport:"Football"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const sportFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.sport);
            const valuesItems = sportFilter.properties.values.items;
            expect(valuesItems.type).toBe('string');
            expect(valuesItems.enum).toBeUndefined();
            await new GridRows(api, `set filter values are strings when includeSetValues is false final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 sport:"Football"
                `
            );
        });
    });

    describe('multi filter', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, MultiFilterModule, SetFilterModule, TextFilterModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes multi filter schema with filterModels array', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter' }],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `includes multi filter schema with filterModels array setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `includes multi filter schema with filterModels array setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.filterType.enum).toEqual(['multi']);
            expect(nameFilter.properties.filterModels).toBeDefined();
            await new GridRows(api, `includes multi filter schema with filterModels array final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('multi filter with custom child filters', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', filterParams: { filterOptions: ['contains'] } },
                                { filter: 'agSetColumnFilter' },
                            ],
                        },
                    },
                ],
                rowData: [{ name: 'Alice' }],
            });
            await new GridColumns(api, `multi filter with custom child filters setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `multi filter with custom child filters setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            const filterModels = nameFilter.properties.filterModels;
            expect(filterModels.items.anyOf.length).toBeGreaterThanOrEqual(2);
            await new GridRows(api, `multi filter with custom child filters final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });
    });
});

describe('getStructuredSchema - enterprise features', () => {
    describe('aggregation feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, AggregationModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes aggregation schema for columns that allow values', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enableRowGroup: true },
                    { field: 'gold', enableValue: true, aggFunc: 'sum' },
                    { field: 'silver', enableValue: true, aggFunc: 'avg' },
                ],
                rowData: [],
            });
            await new GridColumns(api, `includes aggregation schema for columns that allow values setup`).checkColumns(
                `
                    CENTER
                    ├── country "Country" width:200
                    ├── gold "Gold" width:200 aggFunc:sum
                    └── silver "Silver" width:200 aggFunc:avg
                `
            );
            await new GridRows(api, `includes aggregation schema for columns that allow values setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.aggregation).toBeDefined();
            await new GridRows(api, `includes aggregation schema for columns that allow values final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('per-column aggFunc enums reflect available functions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'gold', enableValue: true, aggFunc: 'sum' },
                    { field: 'silver', enableValue: true, aggFunc: 'avg' },
                ],
                rowData: [],
            });
            await new GridColumns(api, `per-column aggFunc enums reflect available functions setup`).checkColumns(`
                CENTER
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200 aggFunc:avg
            `);
            await new GridRows(api, `per-column aggFunc enums reflect available functions setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            const agg = resolveNullable(schema.properties.aggregation);
            const aggModel = agg.properties.aggregationModel;
            const unionItems = aggModel.items.anyOf;

            expect(unionItems).toHaveLength(2);

            const goldItem = unionItems.find((item: any) => item.properties.colId.enum[0] === 'gold');
            const silverItem = unionItems.find((item: any) => item.properties.colId.enum[0] === 'silver');
            expect(goldItem).toBeDefined();
            expect(silverItem).toBeDefined();
            expect(goldItem.properties.aggFunc.enum).toContain('sum');
            expect(silverItem.properties.aggFunc.enum).toContain('avg');
            await new GridRows(api, `per-column aggFunc enums reflect available functions final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('omits aggregation when no columns allow values', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });
            await new GridColumns(api, `omits aggregation when no columns allow values setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `omits aggregation when no columns allow values setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.aggregation).toBeUndefined();
            await new GridRows(api, `omits aggregation when no columns allow values final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('pivot feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, PivotModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes pivot schema with pivotMode and pivotColIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enablePivot: true },
                    { field: 'sport', enablePivot: true },
                    { field: 'gold' },
                ],
                rowData: [],
            });
            await new GridColumns(api, `includes pivot schema with pivotMode and pivotColIds setup`).checkColumns(`
                CENTER
                ├── country "Country" width:200
                ├── sport "Sport" width:200
                └── gold "Gold" width:200
            `);
            await new GridRows(api, `includes pivot schema with pivotMode and pivotColIds setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            const pivot = resolveNullable(schema.properties.pivot);
            expect(pivot.properties.pivotMode).toBeDefined();
            expect(pivot.properties.pivotColIds).toBeDefined();

            const pivotColIds = pivot.properties.pivotColIds.items.enum;
            expect(pivotColIds).toContain('country');
            expect(pivotColIds).toContain('sport');
            expect(pivotColIds).not.toContain('gold');
            await new GridRows(api, `includes pivot schema with pivotMode and pivotColIds final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('omits pivot when no columns allow pivoting', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });
            await new GridColumns(api, `omits pivot when no columns allow pivoting setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `omits pivot when no columns allow pivoting setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.pivot).toBeUndefined();
            await new GridRows(api, `omits pivot when no columns allow pivoting final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('rowGroup feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes rowGroup schema with groupable column enum', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enableRowGroup: true },
                    { field: 'sport', enableRowGroup: true },
                    { field: 'gold' },
                ],
                rowData: [],
            });
            await new GridColumns(api, `includes rowGroup schema with groupable column enum setup`).checkColumns(`
                CENTER
                ├── country "Country" width:200
                ├── sport "Sport" width:200
                └── gold "Gold" width:200
            `);
            await new GridRows(api, `includes rowGroup schema with groupable column enum setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            const group = schema.properties.rowGroup;
            expect(group).toBeDefined();

            const groupColIds = group.properties.groupColIds.items.enum;
            expect(groupColIds).toContain('country');
            expect(groupColIds).toContain('sport');
            expect(groupColIds).not.toContain('gold');
            await new GridRows(api, `includes rowGroup schema with groupable column enum final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('omits rowGroup when no columns allow grouping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });
            await new GridColumns(api, `omits rowGroup when no columns allow grouping setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `omits rowGroup when no columns allow grouping setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.rowGroup).toBeUndefined();
            await new GridRows(api, `omits rowGroup when no columns allow grouping final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });
});

describe('getStructuredSchema - advanced filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule, AdvancedFilterModule],
    });
    afterEach(() => gridsManager.reset());

    test('uses advanced filter schema instead of column filter when enabled', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'name', cellDataType: 'text' },
                { field: 'age', cellDataType: 'number' },
            ],
            rowData: [{ name: 'Alice', age: 25 }],
            enableAdvancedFilter: true,
        });
        await new GridColumns(api, `uses advanced filter schema instead of column filter when enabled setup`)
            .checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `uses advanced filter schema instead of column filter when enabled setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" age:25
        `);

        const schema = toJSON(api.getStructuredSchema());
        const filter = resolveNullable(schema.properties.filter);
        expect(filter.properties.advancedFilterModel).toBeDefined();
        expect(filter.properties.filterModel).toBeUndefined();
        await new GridRows(api, `uses advanced filter schema instead of column filter when enabled final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:25
            `
        );
    });

    test('advanced filter references advancedFilterModel def', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellDataType: 'text' }],
            rowData: [{ name: 'Alice' }],
            enableAdvancedFilter: true,
        });
        await new GridColumns(api, `advanced filter references advancedFilterModel def setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `advanced filter references advancedFilterModel def setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        const schema = toJSON(api.getStructuredSchema());
        const advRef = resolveNullable(schema.properties.filter).properties.advancedFilterModel;
        expect(advRef.$ref).toBe('#/$defs/advancedFilterModel');
        await new GridRows(api, `advanced filter references advancedFilterModel def final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test.each([['text'], ['number'], ['boolean'], ['date'], ['dateString'], ['object']] as const)(
        'advanced filter produces filter property for %s data type',
        (cellDataType) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'col', cellDataType, valueFormatter: () => '' }],
                rowData: [{ col: null }],
                enableAdvancedFilter: true,
            });

            const schema = toJSON(api.getStructuredSchema());
            const filter = resolveNullable(schema.properties.filter);
            expect(filter.properties.advancedFilterModel).toBeDefined();
            expect(filter.properties.advancedFilterModel.$ref).toBe('#/$defs/advancedFilterModel');
        }
    );

    test('advanced filter $defs include data-type models, join model, and advancedFilterModel', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'name', cellDataType: 'text' },
                { field: 'age', cellDataType: 'number' },
                { field: 'active', cellDataType: 'boolean' },
            ],
            rowData: [{ name: 'Alice', age: 25, active: true }],
            enableAdvancedFilter: true,
        });
        await new GridColumns(
            api,
            `advanced filter _defs include data-type models, join model, and advancedFilterMo setup`
        ).checkColumns(`
            CENTER
            ├── name "Name" width:200
            ├── age "Age" width:200
            └── active "Active" width:200
        `);
        await new GridRows(
            api,
            `advanced filter _defs include data-type models, join model, and advancedFilterMo setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" age:25 active:true
        `);

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.$defs.textAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.numberAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.booleanAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.joinAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.advancedFilterModel).toBeDefined();
        expect(schema.$defs.advancedFilterModel.anyOf).toBeDefined();
        await new GridRows(
            api,
            `advanced filter _defs include data-type models, join model, and advancedFilterMo final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" age:25 active:true
        `);
    });

    test('advanced filter omits data type defs for types with no columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellDataType: 'text' }],
            rowData: [{ name: 'Alice' }],
            enableAdvancedFilter: true,
        });
        await new GridColumns(api, `advanced filter omits data type defs for types with no columns setup`).checkColumns(
            `
                CENTER
                └── name "Name" width:200
            `
        );
        await new GridRows(api, `advanced filter omits data type defs for types with no columns setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.$defs.textAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.numberAdvancedFilterModel).toBeUndefined();
        expect(schema.$defs.booleanAdvancedFilterModel).toBeUndefined();
        await new GridRows(api, `advanced filter omits data type defs for types with no columns final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });
});

describe('getStructuredSchema - combined scenarios', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            AiToolkitModule,
            TextFilterModule,
            NumberFilterModule,
            RowGroupingModule,
            PivotModule,
            AggregationModule,
        ],
    });
    afterEach(() => gridsManager.reset());

    test('includes all applicable features for a fully-configured grid', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'country',
                    sortable: true,
                    filter: 'agTextColumnFilter',
                    enableRowGroup: true,
                    enablePivot: true,
                    resizable: true,
                },
                {
                    field: 'gold',
                    sortable: true,
                    filter: 'agNumberColumnFilter',
                    enableValue: true,
                    aggFunc: 'sum',
                    resizable: true,
                },
            ],
            rowData: [],
        });
        await new GridColumns(api, `includes all applicable features for a fully-configured grid setup`).checkColumns(
            `
                CENTER
                ├── country "Country" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `
        );
        await new GridRows(api, `includes all applicable features for a fully-configured grid setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.properties.sort).toBeDefined();
        expect(schema.properties.filter).toBeDefined();
        expect(schema.properties.columnVisibility).toBeDefined();
        expect(schema.properties.columnSizing).toBeDefined();
        expect(schema.properties.rowGroup).toBeDefined();
        expect(schema.properties.pivot).toBeDefined();
        expect(schema.properties.aggregation).toBeDefined();
        await new GridRows(api, `includes all applicable features for a fully-configured grid final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('all features are nullable', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', sortable: true, filter: 'agTextColumnFilter', enableRowGroup: true }],
            rowData: [],
        });
        await new GridColumns(api, `all features are nullable setup`).checkColumns(`
            CENTER
            └── country "Country" width:200
        `);
        await new GridRows(api, `all features are nullable setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const schema = toJSON(api.getStructuredSchema());

        for (const key of ['sort', 'filter', 'columnVisibility', 'rowGroup']) {
            const feature = schema.properties[key];
            expect(feature).toBeDefined();
            expect(feature.type).toContain('null');
        }
        await new GridRows(api, `all features are nullable final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('selective exclusion keeps other features intact', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', sortable: true, filter: 'agTextColumnFilter', enableRowGroup: true },
                { field: 'gold', sortable: true, filter: 'agNumberColumnFilter' },
            ],
            rowData: [],
        });
        await new GridColumns(api, `selective exclusion keeps other features intact setup`).checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `selective exclusion keeps other features intact setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const schema = toJSON(
            api.getStructuredSchema({
                exclude: ['sort', 'rowGroup'],
            })
        );

        expect(schema.properties.sort).toBeUndefined();
        expect(schema.properties.rowGroup).toBeUndefined();
        expect(schema.properties.filter).toBeDefined();
        expect(schema.properties.columnVisibility).toBeDefined();
        await new GridRows(api, `selective exclusion keeps other features intact final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('column descriptions apply alongside feature schemas', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', filter: 'agTextColumnFilter' },
                { field: 'gold', filter: 'agNumberColumnFilter' },
            ],
            rowData: [],
        });
        await new GridColumns(api, `column descriptions apply alongside feature schemas setup`).checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `column descriptions apply alongside feature schemas setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const schema = toJSON(
            api.getStructuredSchema({
                columns: {
                    country: { description: 'Country name' },
                    gold: { description: 'Gold medal count' },
                },
            })
        );

        expect(schema.$defs.allColumnIds.description).toContain('country: Country name');
        expect(schema.$defs.allColumnIds.description).toContain('gold: Gold medal count');
        expect(schema.properties.filter).toBeDefined();
        await new GridRows(api, `column descriptions apply alongside feature schemas final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('schema type is object with additionalProperties false', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowData: [],
        });
        await new GridColumns(api, `schema type is object with additionalProperties false setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `schema type is object with additionalProperties false setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const schema = toJSON(api.getStructuredSchema());
        expect(schema.type).toBe('object');
        expect(schema.additionalProperties).toBe(false);
        await new GridRows(api, `schema type is object with additionalProperties false final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });
});

function resolveNullable(schema: any): any {
    if (!schema) {
        return schema;
    }
    if (schema.anyOf) {
        for (const sub of schema.anyOf) {
            if (sub.type === 'object' && sub.properties) {
                return sub;
            }
        }
        return schema.anyOf[0];
    }
    return schema;
}
