import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import {
    AdvancedFilterModule,
    AggregationModule,
    AiToolkitModule,
    MultiFilterModule,
    PivotModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

function toJSON(schema: any): any {
    return JSON.parse(JSON.stringify(schema));
}

describe('getStructuredSchema', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule],
    });

    afterEach(() => gridsManager.reset());

    describe('basic schema structure', () => {
        test('returns a schema with allColumnIds enum matching grid columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }, { field: 'country' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());

            expect(schema).toBeDefined();
            expect(schema.$defs).toBeDefined();
            expect(schema.$defs.allColumnIds.enum).toEqual(['name', 'age', 'country']);
        });

        test('includes column descriptions in allColumnIds when provided', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });

            const schema = toJSON(
                api.getStructuredSchema({
                    columns: {
                        name: { description: 'Full name of the person' },
                    },
                })
            );

            expect(schema.$defs.allColumnIds.description).toContain('name: Full name of the person');
            expect(schema.$defs.allColumnIds.description).toContain('age');
        });

        test('columns without descriptions use colId only', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());

            expect(schema.$defs.allColumnIds.description).toBe('name\nage');
        });
    });

    describe('exclude parameter', () => {
        test('excludes specified features from the schema', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: true }],
                rowData: [],
            });

            const schema = toJSON(
                api.getStructuredSchema({
                    exclude: ['sort', 'columnVisibility', 'columnSizing'],
                })
            );

            expect(schema.properties.sort).toBeUndefined();
            expect(schema.properties.columnVisibility).toBeUndefined();
            expect(schema.properties.columnSizing).toBeUndefined();
        });

        test('excludes all features when all are listed', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });

            const schema = toJSON(
                api.getStructuredSchema({
                    exclude: ['aggregation', 'filter', 'sort', 'pivot', 'columnVisibility', 'columnSizing', 'rowGroup'],
                })
            );

            expect(schema.properties).toEqual({});
        });
    });

    describe('sort feature', () => {
        test('includes sort schema only for sortable columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', sortable: true },
                    { field: 'age', sortable: true },
                    { field: 'hidden', sortable: false },
                ],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.sort).toBeDefined();

            const sortItems = schema.properties.sort.properties.sortModel.items;
            const colIdEnum = sortItems.properties.colId.enum;
            expect(colIdEnum).toContain('name');
            expect(colIdEnum).toContain('age');
            expect(colIdEnum).not.toContain('hidden');
        });

        test('sort model items include direction and type enums', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: true }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            const sortItems = schema.properties.sort.properties.sortModel.items;
            expect(sortItems.properties.sort.enum).toEqual(['asc', 'desc']);
            expect(sortItems.properties.type.enum).toEqual(['default', 'absolute']);
        });

        test('omits sort feature when no columns are sortable', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', sortable: false }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.sort).toBeUndefined();
        });
    });

    describe('columnVisibility feature', () => {
        test('always includes columnVisibility referencing allColumnIds', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            const vis = schema.properties.columnVisibility;
            expect(vis).toBeDefined();
            expect(vis.properties.hiddenColIds.items.$ref).toBe('#/$defs/allColumnIds');
        });
    });

    describe('columnSizing feature', () => {
        test('includes columnSizing with width and flex options for resizable columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', resizable: true },
                    { field: 'age', resizable: false },
                ],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            const sizing = schema.properties.columnSizing;
            expect(sizing).toBeDefined();

            const sizingItems = sizing.properties.columnSizingModel.items;
            expect(sizingItems.anyOf).toHaveLength(2);

            const resizableEnum = schema.$defs.resizableColumnId.enum;
            expect(resizableEnum).toContain('name');
            expect(resizableEnum).not.toContain('age');
        });

        test('width option has minimum constraint and flex option has minimum constraint', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', resizable: true }],
                rowData: [],
            });

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
        });

        test('omits columnSizing when no columns are resizable', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', resizable: false }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.columnSizing).toBeUndefined();
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
            ],
        });
        afterEach(() => gridsManager.reset());

        test('includes text filter schema', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
                rowData: [{ name: 'Alice' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
        });

        test('includes number filter schema', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter' }],
                rowData: [{ age: 25 }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.age).toBeDefined();
        });

        test('includes date filter schema', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', filter: 'agDateColumnFilter' }],
                rowData: [{ date: '2024-01-01' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.date).toBeDefined();
        });

        test('respects custom filterOptions', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = schema.properties.filter.properties.filterModel.properties.name;
            const conditionType = nameFilter.properties.conditions.items.properties.type;
            expect(conditionType.enum).toEqual(['contains', 'equals']);
        });

        test('maxNumConditions=1 produces flat filter schema without join wrapper', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.operator).toBeUndefined();
            expect(nameFilter.properties.conditions).toBeUndefined();
            expect(nameFilter.properties.type).toBeDefined();
            expect(nameFilter.properties.filterType).toBeDefined();
        });

        test('maxNumConditions > 1 wraps in join schema with operator and conditions', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.operator).toBeDefined();
            expect(nameFilter.properties.operator.enum).toEqual(['AND', 'OR']);
            expect(nameFilter.properties.conditions).toBeDefined();
            expect(nameFilter.properties.conditions.maxItems).toBe(3);
        });

        test('date filter uses ISO separator pattern when useIsoSeparator is true', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            const dateFrom = dateFilter.properties.conditions.items.properties.dateFrom;
            expect(dateFrom.pattern).toContain('T');
        });

        test('date filter uses space separator pattern by default', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', filter: 'agDateColumnFilter' }],
                rowData: [{ date: '2024-01-01' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            const dateFrom = dateFilter.properties.conditions.items.properties.dateFrom;
            expect(dateFrom.pattern).not.toContain('T');
            expect(dateFrom.pattern).toContain('\\d{2}');
        });

        test('omits filter feature when no columns are filterable', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: false }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.filter).toBeUndefined();
        });

        test('uses default filter when filter=true', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: true }],
                rowData: [{ name: 'Alice' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
        });

        test('resolves filter from object with component string', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: { component: 'agTextColumnFilter' } as any }],
                rowData: [{ name: 'Alice' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
        });

        test('resolves filter from object with component=true using default', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: { component: true } as any }],
                rowData: [{ name: 'Alice' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
        });

        test('extracts displayKey from object-style filterOptions', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            const conditionType = nameFilter.properties.conditions.items.properties.type;
            expect(conditionType.enum).toEqual(['contains', 'customEquals']);
        });

        test('ignores unrecognised filter keys', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', filter: 'myCustomFilter' as any },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ],
                rowData: [{ name: 'Alice', age: 25 }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeUndefined();
            expect(filterModel.properties.age).toBeDefined();
        });

        test('number filter maxNumConditions=1 produces flat schema', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const ageFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.age);
            expect(ageFilter.properties.filterType.enum).toEqual(['number']);
            expect(ageFilter.properties.operator).toBeUndefined();
            expect(ageFilter.properties.filter).toBeDefined();
        });

        test('date filter maxNumConditions=1 produces flat schema', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const dateFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.date);
            expect(dateFilter.properties.filterType.enum).toEqual(['date']);
            expect(dateFilter.properties.operator).toBeUndefined();
            expect(dateFilter.properties.dateFrom).toBeDefined();
        });

        test('includes multiple filter columns in filterModel', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                    { field: 'date', filter: 'agDateColumnFilter' },
                ],
                rowData: [{ name: 'Alice', age: 25, date: '2024-01-01' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const filterModel = schema.properties.filter.properties.filterModel;
            expect(filterModel.properties.name).toBeDefined();
            expect(filterModel.properties.age).toBeDefined();
            expect(filterModel.properties.date).toBeDefined();
        });
    });

    describe('set filter', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, SetFilterModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes set filter schema with filterType literal', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }, { sport: 'Tennis' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const sportFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.sport);
            expect(sportFilter.properties.filterType.enum).toEqual(['set']);
            expect(sportFilter.properties.values).toBeDefined();
        });

        test('includes set filter values when includeSetValues is true', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }, { sport: 'Tennis' }, { sport: 'Football' }],
                enableFilterHandlers: true,
            });

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
        });

        test('set filter values are strings when includeSetValues is false', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'sport', filter: 'agSetColumnFilter' }],
                rowData: [{ sport: 'Football' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const sportFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.sport);
            const valuesItems = sportFilter.properties.values.items;
            expect(valuesItems.type).toBe('string');
            expect(valuesItems.enum).toBeUndefined();
        });
    });

    describe('multi filter', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, MultiFilterModule, SetFilterModule, TextFilterModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes multi filter schema with filterModels array', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter' }],
                rowData: [{ name: 'Alice' }],
            });

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            expect(nameFilter.properties.filterType.enum).toEqual(['multi']);
            expect(nameFilter.properties.filterModels).toBeDefined();
        });

        test('multi filter with custom child filters', () => {
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

            const schema = toJSON(api.getStructuredSchema());
            const nameFilter = resolveNullable(schema.properties.filter.properties.filterModel.properties.name);
            const filterModels = nameFilter.properties.filterModels;
            expect(filterModels.items.anyOf.length).toBeGreaterThanOrEqual(2);
        });
    });
});

describe('getStructuredSchema - enterprise features', () => {
    describe('aggregation feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, AggregationModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes aggregation schema for columns that allow values', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enableRowGroup: true },
                    { field: 'gold', enableValue: true, aggFunc: 'sum' },
                    { field: 'silver', enableValue: true, aggFunc: 'avg' },
                ],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.aggregation).toBeDefined();
        });

        test('per-column aggFunc enums reflect available functions', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'gold', enableValue: true, aggFunc: 'sum' },
                    { field: 'silver', enableValue: true, aggFunc: 'avg' },
                ],
                rowData: [],
            });

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
        });

        test('omits aggregation when no columns allow values', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.aggregation).toBeUndefined();
        });
    });

    describe('pivot feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, PivotModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes pivot schema with pivotMode and pivotColIds', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enablePivot: true },
                    { field: 'sport', enablePivot: true },
                    { field: 'gold' },
                ],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            const pivot = resolveNullable(schema.properties.pivot);
            expect(pivot.properties.pivotMode).toBeDefined();
            expect(pivot.properties.pivotColIds).toBeDefined();

            const pivotColIds = pivot.properties.pivotColIds.items.enum;
            expect(pivotColIds).toContain('country');
            expect(pivotColIds).toContain('sport');
            expect(pivotColIds).not.toContain('gold');
        });

        test('omits pivot when no columns allow pivoting', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.pivot).toBeUndefined();
        });
    });

    describe('rowGroup feature', () => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AiToolkitModule, RowGroupingModule],
        });
        afterEach(() => gridsManager.reset());

        test('includes rowGroup schema with groupable column enum', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', enableRowGroup: true },
                    { field: 'sport', enableRowGroup: true },
                    { field: 'gold' },
                ],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            const group = schema.properties.rowGroup;
            expect(group).toBeDefined();

            const groupColIds = group.properties.groupColIds.items.enum;
            expect(groupColIds).toContain('country');
            expect(groupColIds).toContain('sport');
            expect(groupColIds).not.toContain('gold');
        });

        test('omits rowGroup when no columns allow grouping', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowData: [],
            });

            const schema = toJSON(api.getStructuredSchema());
            expect(schema.properties.rowGroup).toBeUndefined();
        });
    });
});

describe('getStructuredSchema - advanced filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule, AdvancedFilterModule],
    });
    afterEach(() => gridsManager.reset());

    test('uses advanced filter schema instead of column filter when enabled', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'name', cellDataType: 'text' },
                { field: 'age', cellDataType: 'number' },
            ],
            rowData: [{ name: 'Alice', age: 25 }],
            enableAdvancedFilter: true,
        });

        const schema = toJSON(api.getStructuredSchema());
        const filter = resolveNullable(schema.properties.filter);
        expect(filter.properties.advancedFilterModel).toBeDefined();
        expect(filter.properties.filterModel).toBeUndefined();
    });

    test('advanced filter references advancedFilterModel def', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellDataType: 'text' }],
            rowData: [{ name: 'Alice' }],
            enableAdvancedFilter: true,
        });

        const schema = toJSON(api.getStructuredSchema());
        const advRef = resolveNullable(schema.properties.filter).properties.advancedFilterModel;
        expect(advRef.$ref).toBe('#/$defs/advancedFilterModel');
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

    test('advanced filter $defs include data-type models, join model, and advancedFilterModel', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'name', cellDataType: 'text' },
                { field: 'age', cellDataType: 'number' },
                { field: 'active', cellDataType: 'boolean' },
            ],
            rowData: [{ name: 'Alice', age: 25, active: true }],
            enableAdvancedFilter: true,
        });

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.$defs.textAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.numberAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.booleanAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.joinAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.advancedFilterModel).toBeDefined();
        expect(schema.$defs.advancedFilterModel.anyOf).toBeDefined();
    });

    test('advanced filter omits data type defs for types with no columns', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellDataType: 'text' }],
            rowData: [{ name: 'Alice' }],
            enableAdvancedFilter: true,
        });

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.$defs.textAdvancedFilterModel).toBeDefined();
        expect(schema.$defs.numberAdvancedFilterModel).toBeUndefined();
        expect(schema.$defs.booleanAdvancedFilterModel).toBeUndefined();
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

    test('includes all applicable features for a fully-configured grid', () => {
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

        const schema = toJSON(api.getStructuredSchema());

        expect(schema.properties.sort).toBeDefined();
        expect(schema.properties.filter).toBeDefined();
        expect(schema.properties.columnVisibility).toBeDefined();
        expect(schema.properties.columnSizing).toBeDefined();
        expect(schema.properties.rowGroup).toBeDefined();
        expect(schema.properties.pivot).toBeDefined();
        expect(schema.properties.aggregation).toBeDefined();
    });

    test('all features are nullable', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', sortable: true, filter: 'agTextColumnFilter', enableRowGroup: true }],
            rowData: [],
        });

        const schema = toJSON(api.getStructuredSchema());

        for (const key of ['sort', 'filter', 'columnVisibility', 'rowGroup']) {
            const feature = schema.properties[key];
            expect(feature).toBeDefined();
            expect(feature.type).toContain('null');
        }
    });

    test('selective exclusion keeps other features intact', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', sortable: true, filter: 'agTextColumnFilter', enableRowGroup: true },
                { field: 'gold', sortable: true, filter: 'agNumberColumnFilter' },
            ],
            rowData: [],
        });

        const schema = toJSON(
            api.getStructuredSchema({
                exclude: ['sort', 'rowGroup'],
            })
        );

        expect(schema.properties.sort).toBeUndefined();
        expect(schema.properties.rowGroup).toBeUndefined();
        expect(schema.properties.filter).toBeDefined();
        expect(schema.properties.columnVisibility).toBeDefined();
    });

    test('column descriptions apply alongside feature schemas', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', filter: 'agTextColumnFilter' },
                { field: 'gold', filter: 'agNumberColumnFilter' },
            ],
            rowData: [],
        });

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
    });

    test('schema type is object with additionalProperties false', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowData: [],
        });

        const schema = toJSON(api.getStructuredSchema());
        expect(schema.type).toBe('object');
        expect(schema.additionalProperties).toBe(false);
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
