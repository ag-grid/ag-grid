import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

describe('ag-grid overlays state', () => {
    const renderedSym = Symbol('rendered');
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        const api = createGrid(document.getElementById('myGrid')!, gridOptions);
        api.addEventListener('firstDataRendered', () => {
            (api as any)[renderedSym] = true;
        });
        return api;
    }

    function waitGridRendered(api: GridApi) {
        return new Promise<void>((resolve) => {
            if ((api as any)[renderedSym]) {
                resolve();
            } else {
                api.addEventListener('firstDataRendered', () => resolve());
            }
        });
    }

    function getAllRows(api: GridApi) {
        const rows: IRowNode<any>[] = [];
        api.forEachNode((node) => {
            rows.push(node);
        });
        return rows;
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);
    });

    beforeEach(() => {
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('simple tree data', () => {
        it('should render a simple tree data', async () => {
            const rowData = [
                { orgHierarchy: ['A'] },
                { orgHierarchy: ['A', 'B'] },
                { orgHierarchy: ['C', 'D'] },
                { orgHierarchy: ['E', 'F', 'G', 'H'] },
            ];

            const gridOptions: GridOptions = {
                columnDefs: [
                    {
                        field: 'groupType',
                        valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                    },
                ],
                autoGroupColumnDef: {
                    headerName: 'Organisation Hierarchy',
                    cellRendererParams: { suppressCount: true },
                },
                treeData: true,
                animateRows: true,
                groupDefaultExpanded: -1,
                rowData,
                getDataPath: (data: any) => data.orgHierarchy,
            };

            const api = createMyGrid(gridOptions);

            await waitGridRendered(api);

            const allRows = getAllRows(api);

            expect(allRows.length).toBe(8);

            // console.log(allRows);

            expect(allRows[0].data).toEqual(rowData[0]);
            expect(allRows[0].level).toBe(1);
            expect(allRows[0].allChildrenCount).toBe(1);

            expect(allRows[1].level).toBe(2);
            expect(allRows[1].data).toEqual(rowData[1]);
            expect(allRows[1].allChildrenCount).toBe(null);

            expect(allRows[2].level).toBe(0);
            expect(allRows[2].data).toBeUndefined();
            expect(allRows[2].allChildrenCount).toBe(1);

            expect(allRows[3].level).toBe(2);
            expect(allRows[3].data).toEqual(rowData[2]);
            expect(allRows[3].allChildrenCount).toBe(null);

            expect(allRows[4].level).toBe(0);
            expect(allRows[4].data).toBeUndefined();
            expect(allRows[4].allChildrenCount).toBe(3);

            expect(allRows[5].level).toBe(1);
            expect(allRows[5].data).toBeUndefined();
            expect(allRows[5].allChildrenCount).toBe(2);

            expect(allRows[6].level).toBe(2);
            expect(allRows[6].data).toBeUndefined();
            expect(allRows[6].allChildrenCount).toBe(1);

            expect(allRows[7].level).toBe(4);
            expect(allRows[7].data).toEqual(rowData[3]);
            expect(allRows[7].allChildrenCount).toBe(null);

            // expect(allRows[0].firstChild).toBe(allRows[1]);
            // expect(allRows[1].firstChild).toBeUndefined();
            // expect(allRows[2].firstChild).toBe(allRows[3]);
            // expect(allRows[3].firstChild).toBeUndefined();
            // expect(allRows[4].firstChild).toBe(allRows[5]);
            // expect(allRows[5].firstChild).toBe(allRows[6]);
            // expect(allRows[6].firstChild).toBeUndefined();
            // expect(allRows[7].firstChild).toBeUndefined();
        });
    });
});
