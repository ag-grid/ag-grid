import { ColDef, ColGroupDef, GridOptions, GridReadyEvent, createGrid } from '@ag-grid-community/core';
import { afterEach, beforeEach, describe, expect, it, jest, test, xit, xtest } from '@jest/globals';

import { ClientSideRowModelModule } from './clientSideRowModelModule';

const getColNames = (cols: any[] | undefined) => cols?.map((c) => c.field ?? c.colId) ?? [];

const onlyFields = [{ field: 'field' }, { field: 'field2' }];
const withGroups: (ColDef | ColGroupDef)[] = [
    { field: 'field' },
    {
        children: [
            { field: 'child1' },
            {
                children: [{ field: 'grandchild' }],
            },
        ],
    },
    { field: 'field2' },
];

describe('getColumnDefs', () => {
    test('simple columns', (done) => {
        const options: GridOptions = {
            columnDefs: onlyFields,
            onGridReady: (params: GridReadyEvent) => {
                const defs1 = params.api.getColumnDefs();
                expect(getColNames(defs1)).toStrictEqual(getColNames(onlyFields));
                done();
            },
        };
        createGrid(document.createElement('div'), options, {
            modules: [ClientSideRowModelModule],
        });
    });

    test('with column groups', (done) => {
        const options: GridOptions = {
            columnDefs: withGroups,
            onGridReady: (params: GridReadyEvent) => {
                const defs1 = params.api.getColumnDefs();
                expect(getColNames(defs1)).toStrictEqual(getColNames(withGroups));
                done();
            },
        };
        createGrid(document.createElement('div'), options, {
            modules: [ClientSideRowModelModule],
        });
    });

    test('crashes after destroy', (done) => {
        const options: GridOptions = {
            columnDefs: withGroups,
            onGridReady: (params: GridReadyEvent) => {
                params.api.destroy();

                // If not broken this will just finish.
                params.api.getColumnDefs();

                done();
            },
        };
        createGrid(document.createElement('div'), options, {
            modules: [ClientSideRowModelModule],
        });
    });
});
