import { GridApi } from './gridApi';
import { describe, test, beforeAll, jest, expect } from '@jest/globals';

interface RowData {
    name: string;
    account: { name: string };
    age: number;
}

describe('GridApi setGridOption, updateGridOptions types', () => {
    beforeAll(() => {
        // We only want to test the types not that it actually does anything
        jest.spyOn(GridApi.prototype, 'setGridOption').mockImplementation(() => undefined);
        jest.spyOn(GridApi.prototype, 'updateGridOptions').mockImplementation(() => undefined);
    });

    describe('setters', () => {
        test('no TData generic', () => {
            const api: GridApi = new GridApi();

            api.setGridOption('columnDefs', [
                { field: 'name' },
                { field: 'nameAnyThing' },
                { children: [{ field: 'name' }] },
            ]);
            api.updateGridOptions({
                columnDefs: [{ field: 'name' }, { field: 'nameAnyThing' }, { children: [{ field: 'name' }] }],
            });

            api.setGridOption('rowData', [{ name: 'a' }, { wrongName: 'b' }]);
            api.updateGridOptions({ rowData: [{ name: 'a' }, { wrongName: 'b' }] });

            // @ts-expect-error - Cannot set non managed property
            api.setGridOption('suppressColumnVirtualisation', true);
            api.updateGridOptions({
                // @ts-expect-error - Cannot set non managed property
                suppressColumnVirtualisation: true,
            });
        });

        test('setters with TData generic', () => {
            const api: GridApi<RowData> = new GridApi<RowData>();

            api.setGridOption('columnDefs', [
                { field: 'name' },
                // @ts-expect-error - non existent field
                { field: 'nameAnyThing' },
                // @ts-expect-error - non existent field
                { children: [{ field: 'nameWrong' }] },
            ]);
            api.updateGridOptions({
                columnDefs: [
                    { field: 'name' },
                    // @ts-expect-error - non existent field
                    { field: 'nameAnyThing' },
                    // @ts-expect-error - non existent field
                    { children: [{ field: 'nameWrong' }] },
                ],
            });

            api.setGridOption('rowData', [
                { name: 'a', account: { name: 'test' }, age: 2 },
                // @ts-expect-error - non existent field
                { wrongName: 'b' },
                // @ts-expect-error - non existent field
                { name: 'a', account: { name: 'test' }, age: 'string' },
            ]);
            api.updateGridOptions({
                rowData: [
                    { name: 'a', account: { name: 'test' }, age: 2 },
                    // @ts-expect-error - non existent field
                    { wrongName: 'b' },
                    // @ts-expect-error - non existent field
                    { name: 'a', account: { name: 'test' }, age: 'string' },
                ],
            });

            // @ts-expect-error - Cannot set non managed property
            api.setGridOption('suppressColumnVirtualisation', true);
            api.updateGridOptions({
                // @ts-expect-error - Cannot set non managed property
                suppressColumnVirtualisation: true,
            });
        });
    });

    describe('getters', () => {
        describe('columnDefs', () => {
            beforeAll(() => {
                jest.spyOn(GridApi.prototype, 'getGridOption').mockImplementation(() => [{ field: 'name'}]);
            });

            test('no TData generic', () => {
                const api: GridApi = new GridApi();

                const cols = api.getGridOption('columnDefs')!;
                const col = cols![0]!;

                if ('field' in col) {
                    col.field = 'name';
                    col.field = 'nameAnyThing';
                }
            });

            test(' with TData generic', () => {
                const api: GridApi<RowData> = new GridApi<RowData>();

                const cols = api.getGridOption('columnDefs')!;
                const col = cols[0]!;

                if ('field' in col) {
                    col.field = 'name';
                    // @ts-expect-error - non existent field
                    col.field = 'nameWrong';
                }
            });
        });

        describe('rowData', () => {
            beforeAll(() => {
                jest.spyOn(GridApi.prototype, 'getGridOption').mockImplementation(() => [{ name: 'a'}]);
            });

            test('no TData generic', () => {
                const api: GridApi = new GridApi();

                const rows = api.getGridOption('rowData')!;
                rows[0].name = 'a';
                rows[0].wrongName = 'b';
            });

            test(' with TData generic', () => {
                const api: GridApi<RowData> = new GridApi<RowData>();

                const rows = api.getGridOption('rowData')!;
                rows[0].name = 'a';
                // @ts-expect-error - non existent field
                rows[0].wrongName = 'b';
            });
        });
    });
});
