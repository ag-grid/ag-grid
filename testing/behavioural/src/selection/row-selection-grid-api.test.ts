import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';

import { TestGridsManager } from '../test-utils';
import { assertSelectedRowNodes, assertSelectedRowsByIndex } from './utils';

describe('Row Selection Grid API', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    function createGrid(go: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', go);
    }

    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];

    describe('Single Row Selection', () => {
        describe('selectAll', () => {
            test('Prevented from selecting all rows via the API', () => {
                const api = createGrid({
                    columnDefs,
                    rowData,
                    selection: {
                        mode: 'singleRow',
                    },
                });

                assertSelectedRowsByIndex([], api);

                api.selectAll();

                assertSelectedRowsByIndex([], api);
            });
        });

        describe('selectAllOnCurrentPage', () => {
            test('Cannot select all rows on current page', () => {
                const api = createGrid({
                    columnDefs,
                    rowData,
                    selection: { mode: 'singleRow' },
                    pagination: true,
                    paginationPageSize: 5,
                    paginationPageSizeSelector: false,
                });

                api.selectAllOnCurrentPage();

                assertSelectedRowsByIndex([], api);
            });
        });

        describe('selectAllFiltered', () => {
            test('Cannot select all filtered rows', () => {
                const api = createGrid({
                    columnDefs,
                    rowData,
                    selection: { mode: 'singleRow' },
                });

                api.setGridOption('quickFilterText', 'ing');

                api.selectAllFiltered();

                assertSelectedRowNodes([], api);
            });
        });

        describe('setNodesSelected', () => {
            test('Select single row', () => {
                const api = createGrid({
                    columnDefs,
                    rowData,
                    selection: { mode: 'singleRow' },
                });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                assertSelectedRowNodes(toSelect, api);
            });

            test('Cannot select multiple rows', () => {
                const api = createGrid({
                    columnDefs,
                    rowData,
                    selection: { mode: 'singleRow' },
                });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[0], nodes[3], nodes[1]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                assertSelectedRowNodes([], api);
            });
        });
    });

    describe('Multi Row Selection', () => {
        describe('setNodesSelected', () => {
            test('Select single row', () => {
                const api = createGrid({ columnDefs, rowData, selection: { mode: 'multiRow' } });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[3]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                assertSelectedRowNodes(toSelect, api);
            });

            test('Can select multiple rows', () => {
                const api = createGrid({ columnDefs, rowData, selection: { mode: 'multiRow' } });

                const nodes = api.getRenderedNodes();
                const toSelect = [nodes[5], nodes[4], nodes[2]];
                api.setNodesSelected({ nodes: toSelect, newValue: true });

                assertSelectedRowNodes(toSelect, api);
            });
        });

        describe('selectAll', () => {
            test('Can select all rows', () => {
                const api = createGrid({ columnDefs, rowData, selection: { mode: 'multiRow' } });

                api.selectAll();

                expect(api.getSelectedNodes().length).toBe(rowData.length);

                api.deselectAll();
                assertSelectedRowNodes([], api);
            });
        });
    });
});
