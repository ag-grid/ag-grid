import { FindModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { expect } from '../test-utils/matchers';

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

            // Search for formatted value
            api.setGridOption('findSearchValue', '£100.00');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for raw value shouldn't match the formatted display
            api.setGridOption('findSearchValue', '100');
            await asyncSetTimeout(1);
            // Will match '100' in '£100.00'
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for currency symbol
            api.setGridOption('findSearchValue', '£');
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

            // Search for year
            api.setGridOption('findSearchValue', '2024');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(2);

            // Search for specific date format
            api.setGridOption('findSearchValue', '15/1/2024');
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

            // Search for full name (computed value)
            api.setGridOption('findSearchValue', 'John Doe');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Search for partial
            api.setGridOption('findSearchValue', 'Jane');
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

            api.setGridOption('findSearchValue', '123');
            await asyncSetTimeout(1);
            // Matches '123', '1234', '12345'
            expect(api.findGetTotalMatches()).toBe(3);

            api.setGridOption('findSearchValue', '456');
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

            api.setGridOption('findSearchValue', 'test');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Null/undefined shouldn't match anything
            api.setGridOption('findSearchValue', 'null');
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

            api.setGridOption('findSearchValue', '@');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '$');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '(brackets)');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', '*');
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

            // Display shows 'formatted' but search uses getFindText result
            api.setGridOption('findSearchValue', 'searchable');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Shouldn't find the formatted display value
            api.setGridOption('findSearchValue', 'formatted');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);

            // Can search for original value via getFindText
            api.setGridOption('findSearchValue', 'original');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);
        });
    });
});
