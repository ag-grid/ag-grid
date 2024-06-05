// import { beforeAll, describe, expect, jest, test } from '@jest/globals';

// import { GridApiService } from './apiFunctions';

// interface RowData {
//     name: string;
//     account: { name: string };
//     age: number;
// }

describe('dummyTest', () => {
    it('always true', () => {
        expect('hello').toBe('hello');
    });
});

// describe('GridApi setGridOption, updateGridOptions types', () => {
//     beforeAll(() => {
//         // We only want to test the types not that it actually does anything
//         jest.spyOn(GridApiService.prototype, 'setGridOption').mockImplementation(() => undefined);
//         jest.spyOn(GridApiService.prototype, 'updateGridOptions').mockImplementation(() => undefined);
//     });

//     describe('setters', () => {
//         test('no TData generic', () => {
//             const api: GridApiService = new GridApiService();

//             api.setGridOption('columnDefs', [
//                 { field: 'name' },
//                 { field: 'nameAnyThing' },
//                 { children: [{ field: 'name' }] },
//             ]);
//             api.updateGridOptions({
//                 columnDefs: [{ field: 'name' }, { field: 'nameAnyThing' }, { children: [{ field: 'name' }] }],
//             });

//             api.setGridOption('rowData', [{ name: 'a' }, { wrongName: 'b' }]);
//             api.updateGridOptions({ rowData: [{ name: 'a' }, { wrongName: 'b' }] });

//             // @ts-expect-error - Cannot set non managed property
//             api.setGridOption('suppressColumnVirtualisation', true);
//             api.updateGridOptions({
//                 // @ts-expect-error - Cannot set non managed property
//                 suppressColumnVirtualisation: true,
//             });
//         });

//         test('setters with TData generic', () => {
//             const api: GridApiService<RowData> = new GridApiService<RowData>();

//             api.setGridOption('columnDefs', [
//                 { field: 'name' },
//                 // @ts-expect-error - non existent field
//                 { field: 'nameAnyThing' },
//                 // @ts-expect-error - non existent field
//                 { children: [{ field: 'nameWrong' }] },
//             ]);
//             api.updateGridOptions({
//                 columnDefs: [
//                     { field: 'name' },
//                     // @ts-expect-error - non existent field
//                     { field: 'nameAnyThing' },
//                     // @ts-expect-error - non existent field
//                     { children: [{ field: 'nameWrong' }] },
//                 ],
//             });

//             api.setGridOption('rowData', [
//                 { name: 'a', account: { name: 'test' }, age: 2 },
//                 // @ts-expect-error - non existent field
//                 { wrongName: 'b' },
//                 // @ts-expect-error - non existent field
//                 { name: 'a', account: { name: 'test' }, age: 'string' },
//             ]);
//             api.updateGridOptions({
//                 rowData: [
//                     { name: 'a', account: { name: 'test' }, age: 2 },
//                     // @ts-expect-error - non existent field
//                     { wrongName: 'b' },
//                     // @ts-expect-error - non existent field
//                     { name: 'a', account: { name: 'test' }, age: 'string' },
//                 ],
//             });

//             // @ts-expect-error - Cannot set non managed property
//             api.setGridOption('suppressColumnVirtualisation', true);
//             api.updateGridOptions({
//                 // @ts-expect-error - Cannot set non managed property
//                 suppressColumnVirtualisation: true,
//             });
//         });
//     });

//     describe('getters', () => {
//         describe('columnDefs', () => {
//             beforeAll(() => {
//                 jest.spyOn(GridApiService.prototype, 'getGridOption').mockImplementation(() => [{ field: 'name' }]);
//             });

//             test('no TData generic', () => {
//                 const api: GridApiService = new GridApiService();

//                 const cols = api.getGridOption('columnDefs')!;
//                 const col = cols![0]!;

//                 if ('field' in col) {
//                     col.field = 'name';
//                     col.field = 'nameAnyThing';
//                 }
//             });

//             test(' with TData generic', () => {
//                 const api: GridApiService<RowData> = new GridApiService<RowData>();

//                 const cols = api.getGridOption('columnDefs')!;
//                 const col = cols[0]!;

//                 if ('field' in col) {
//                     col.field = 'name';
//                     // @ts-expect-error - non existent field
//                     col.field = 'nameWrong';
//                 }
//             });
//         });

//         describe('rowData', () => {
//             beforeAll(() => {
//                 jest.spyOn(GridApiService.prototype, 'getGridOption').mockImplementation(() => [{ name: 'a' }]);
//             });

//             test('no TData generic', () => {
//                 const api: GridApiService = new GridApiService();

//                 const rows = api.getGridOption('rowData')!;
//                 rows[0].name = 'a';
//                 rows[0].wrongName = 'b';
//             });

//             test(' with TData generic', () => {
//                 const api: GridApiService<RowData> = new GridApiService<RowData>();

//                 const rows = api.getGridOption('rowData')!;
//                 rows[0].name = 'a';
//                 // @ts-expect-error - non existent field
//                 rows[0].wrongName = 'b';
//             });
//         });
//     });
// });
