import { FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Tests for find with value formatters, value getters, and different data types.
 */
describe('Find Value Formatting', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [FindModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('Value Formatters', () => {
        test('find searches formatted values, not raw values', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'price',
                        valueFormatter: (params) => `£${params.value.toFixed(2)}`,
                    },
                ],
                rowData: [{ price: 100 }, { price: 200 }, { price: 150 }],
            });
            await new GridColumns(api, `find searches formatted values, not raw values setup`).checkColumns(`
                CENTER
                └── price "Price" width:200
            `);
            await new GridRows(api, `find searches formatted values, not raw values setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 price:"£100.00"
                ├── LEAF id:1 price:"£200.00"
                └── LEAF id:2 price:"£150.00"
            `);

            // Search for formatted value
            api.setGridOption('findSearchValue', '£100.00');
            await new GridColumns(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── price "Price" width:200
            `);
            await new GridRows(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 price:"£100.00"
                ├── LEAF id:1 price:"£200.00"
                └── LEAF id:2 price:"£150.00"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for raw value shouldn't match the formatted display
            api.setGridOption('findSearchValue', '100');
            await new GridColumns(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue #2`
            ).checkColumns(`
                CENTER
                └── price "Price" width:200
            `);
            await new GridRows(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 price:"£100.00"
                ├── LEAF id:1 price:"£200.00"
                └── LEAF id:2 price:"£150.00"
            `);
            await asyncSetTimeout(1);
            // Will match '100' in '£100.00'
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for currency symbol
            api.setGridOption('findSearchValue', '£');
            await new GridColumns(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue #3`
            ).checkColumns(`
                CENTER
                └── price "Price" width:200
            `);
            await new GridRows(
                api,
                `find searches formatted values, not raw values after setGridOption findSearchValue #3`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 price:"£100.00"
                ├── LEAF id:1 price:"£200.00"
                └── LEAF id:2 price:"£150.00"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(3);
        });

        test('find works with date formatters', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'date',
                        valueFormatter: (params) => {
                            const d = params.value as Date;
                            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                        },
                    },
                ],
                rowData: [
                    { date: new Date(2024, 0, 15) },
                    { date: new Date(2024, 5, 20) },
                    { date: new Date(2023, 11, 25) },
                ],
            });
            await new GridColumns(api, `find works with date formatters setup`).checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
            await new GridRows(api, `find works with date formatters setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"15/1/2024"
                ├── LEAF id:1 date:"20/6/2024"
                └── LEAF id:2 date:"25/12/2023"
            `);

            // Search for year
            api.setGridOption('findSearchValue', '2024');
            await new GridColumns(api, `find works with date formatters after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── date "Date" width:200
                `);
            await new GridRows(api, `find works with date formatters after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"15/1/2024"
                ├── LEAF id:1 date:"20/6/2024"
                └── LEAF id:2 date:"25/12/2023"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(2);

            // Search for specific date format
            api.setGridOption('findSearchValue', '15/1/2024');
            await new GridColumns(api, `find works with date formatters after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── date "Date" width:200
                `);
            await new GridRows(api, `find works with date formatters after setGridOption findSearchValue #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"15/1/2024"
                ├── LEAF id:1 date:"20/6/2024"
                └── LEAF id:2 date:"25/12/2023"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);
        });
    });

    describe('Value Getters', () => {
        test('find searches computed values from valueGetter', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'firstName' },
                    { field: 'lastName' },
                    {
                        headerName: 'Full Name',
                        valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
                    },
                ],
                rowData: [
                    { firstName: 'John', lastName: 'Doe' },
                    { firstName: 'Jane', lastName: 'Smith' },
                ],
            });
            await new GridColumns(api, `find searches computed values from valueGetter setup`).checkColumns(`
                CENTER
                ├── firstName "First Name" width:200
                ├── lastName "Last Name" width:200
                └── 0 "Full Name" width:200
            `);
            await new GridRows(api, `find searches computed values from valueGetter setup`).check(`
                ROOT id:ROOT_NODE_ID 0:"<ERROR>"
                ├── LEAF id:0 firstName:"John" lastName:"Doe" 0:"John Doe"
                └── LEAF id:1 firstName:"Jane" lastName:"Smith" 0:"Jane Smith"
            `);

            // Search for full name (computed value)
            api.setGridOption('findSearchValue', 'John Doe');
            await new GridColumns(
                api,
                `find searches computed values from valueGetter after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                ├── firstName "First Name" width:200
                ├── lastName "Last Name" width:200
                └── 0 "Full Name" width:200
            `);
            await new GridRows(
                api,
                `find searches computed values from valueGetter after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID 0:"<ERROR>"
                ├── LEAF id:0 firstName:"John" lastName:"Doe" 0:"John Doe"
                └── LEAF id:1 firstName:"Jane" lastName:"Smith" 0:"Jane Smith"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for partial
            api.setGridOption('findSearchValue', 'Jane');
            await new GridColumns(
                api,
                `find searches computed values from valueGetter after setGridOption findSearchValue #2`
            ).checkColumns(`
                CENTER
                ├── firstName "First Name" width:200
                ├── lastName "Last Name" width:200
                └── 0 "Full Name" width:200
            `);
            await new GridRows(
                api,
                `find searches computed values from valueGetter after setGridOption findSearchValue #2`
            ).check(`
                ROOT id:ROOT_NODE_ID 0:"<ERROR>"
                ├── LEAF id:0 firstName:"John" lastName:"Doe" 0:"John Doe"
                └── LEAF id:1 firstName:"Jane" lastName:"Smith" 0:"Jane Smith"
            `);
            await asyncSetTimeout(1);
            // Should find in both firstName column and Full Name column
            expect(api.findGetTotalMatches()).toBe(2);
        });
    });

    describe('Different Data Types', () => {
        test('find with number values', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'number' }],
                rowData: [{ number: 123 }, { number: 456 }, { number: 1234 }, { number: 12345 }],
            });
            await new GridColumns(api, `find with number values setup`).checkColumns(`
                CENTER
                └── number "Number" width:200
            `);
            await new GridRows(api, `find with number values setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:123
                ├── LEAF id:1 number:456
                ├── LEAF id:2 number:1234
                └── LEAF id:3 number:12345
            `);

            api.setGridOption('findSearchValue', '123');
            await new GridColumns(api, `find with number values after setGridOption findSearchValue`).checkColumns(`
                CENTER
                └── number "Number" width:200
            `);
            await new GridRows(api, `find with number values after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:123
                ├── LEAF id:1 number:456
                ├── LEAF id:2 number:1234
                └── LEAF id:3 number:12345
            `);
            await asyncSetTimeout(1);
            // Matches '123', '1234', '12345'
            expect(api.findGetTotalMatches()).toBe(3);

            api.setGridOption('findSearchValue', '456');
            await new GridColumns(api, `find with number values after setGridOption findSearchValue #2`).checkColumns(
                `
                    CENTER
                    └── number "Number" width:200
                `
            );
            await new GridRows(api, `find with number values after setGridOption findSearchValue #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:123
                ├── LEAF id:1 number:456
                ├── LEAF id:2 number:1234
                └── LEAF id:3 number:12345
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);
        });

        // Note: boolean values without valueFormatter return empty display value
        // Users should add a valueFormatter to search boolean values

        test('find with null and undefined values', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: null }, { value: undefined }, { value: 'test' }, { value: '' }],
            });
            await new GridColumns(api, `find with null and undefined values setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find with null and undefined values setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:null
                ├── LEAF id:1
                ├── LEAF id:2 value:"test"
                └── LEAF id:3 value:""
            `);

            api.setGridOption('findSearchValue', 'test');
            await new GridColumns(api, `find with null and undefined values after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find with null and undefined values after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:null
                    ├── LEAF id:1
                    ├── LEAF id:2 value:"test"
                    └── LEAF id:3 value:""
                `
            );
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Null/undefined shouldn't match anything
            api.setGridOption('findSearchValue', 'null');
            await new GridColumns(api, `find with null and undefined values after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find with null and undefined values after setGridOption findSearchValue #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:null
                    ├── LEAF id:1
                    ├── LEAF id:2 value:"test"
                    └── LEAF id:3 value:""
                `
            );
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);
        });

        test('find with special characters', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { value: 'hello@world.com' },
                    { value: 'price: $100' },
                    { value: 'test (brackets)' },
                    { value: 'a*b+c' },
                ],
            });
            await new GridColumns(api, `find with special characters setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find with special characters setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"hello@world.com"
                ├── LEAF id:1 value:"price: $100"
                ├── LEAF id:2 value:"test (brackets)"
                └── LEAF id:3 value:"a*b+c"
            `);

            api.setGridOption('findSearchValue', '@');
            await new GridColumns(api, `find with special characters after setGridOption findSearchValue`).checkColumns(
                `
                    CENTER
                    └── value "Value" width:200
                `
            );
            await new GridRows(api, `find with special characters after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"hello@world.com"
                ├── LEAF id:1 value:"price: $100"
                ├── LEAF id:2 value:"test (brackets)"
                └── LEAF id:3 value:"a*b+c"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '$');
            await new GridColumns(api, `find with special characters after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find with special characters after setGridOption findSearchValue #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"hello@world.com"
                ├── LEAF id:1 value:"price: $100"
                ├── LEAF id:2 value:"test (brackets)"
                └── LEAF id:3 value:"a*b+c"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '(brackets)');
            await new GridColumns(api, `find with special characters after setGridOption findSearchValue #3`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find with special characters after setGridOption findSearchValue #3`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"hello@world.com"
                ├── LEAF id:1 value:"price: $100"
                ├── LEAF id:2 value:"test (brackets)"
                └── LEAF id:3 value:"a*b+c"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '*');
            await new GridColumns(api, `find with special characters after setGridOption findSearchValue #4`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find with special characters after setGridOption findSearchValue #4`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"hello@world.com"
                ├── LEAF id:1 value:"price: $100"
                ├── LEAF id:2 value:"test (brackets)"
                └── LEAF id:3 value:"a*b+c"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);
        });
    });

    describe('getFindText Column Option', () => {
        test('uses getFindText when provided', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'value',
                        valueFormatter: () => 'formatted',
                        getFindText: (params) => `searchable:${params.value}`,
                    },
                ],
                rowData: [{ value: 'original' }],
            });
            await new GridColumns(api, `uses getFindText when provided setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `uses getFindText when provided setup`).check(`
                ROOT id:ROOT_NODE_ID value:"formatted"
                └── LEAF id:0 value:"formatted"
            `);

            // Display shows 'formatted' but search uses getFindText result
            api.setGridOption('findSearchValue', 'searchable');
            await new GridColumns(api, `uses getFindText when provided after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `uses getFindText when provided after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID value:"formatted"
                └── LEAF id:0 value:"formatted"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Shouldn't find the formatted display value
            api.setGridOption('findSearchValue', 'formatted');
            await new GridColumns(api, `uses getFindText when provided after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `uses getFindText when provided after setGridOption findSearchValue #2`).check(`
                ROOT id:ROOT_NODE_ID value:"formatted"
                └── LEAF id:0 value:"formatted"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);

            // Can search for original value via getFindText
            api.setGridOption('findSearchValue', 'original');
            await new GridColumns(api, `uses getFindText when provided after setGridOption findSearchValue #3`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `uses getFindText when provided after setGridOption findSearchValue #3`).check(`
                ROOT id:ROOT_NODE_ID value:"formatted"
                └── LEAF id:0 value:"formatted"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);
        });
    });
});
