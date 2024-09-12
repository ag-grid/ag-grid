import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

import { TestGridsManager } from '../test-utils';
import { assertSelectedRowNodes, assertSelectedRowsByIndex, wait } from './utils';

describe('Row Selection Grid API', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ServerSideRowModelModule],
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
        describe('CSRM', () => {
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

        describe('SSRM', () => {
            describe('selectAll', () => {
                test('Prevented from selecting all rows via the API', async () => {
                    const api = createGrid({
                        columnDefs,
                        selection: {
                            mode: 'singleRow',
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                    });

                    await wait(10);
                    assertSelectedRowNodes([], api);

                    api.selectAll();

                    assertSelectedRowNodes([], api);
                });
            });

            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const api = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        selection: { mode: 'singleRow' },
                    });

                    await wait(10);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                });

                test('Cannot select multiple rows', async () => {
                    const api = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        selection: { mode: 'singleRow' },
                    });

                    await wait(10);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[0], nodes[3], nodes[1]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes([], api);
                });
            });
        });
    });

    describe('Multi Row Selection', () => {
        describe('CSRM', () => {
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

        describe('SSRM', () => {
            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const api = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        selection: { mode: 'multiRow' },
                    });

                    await wait(10);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                });

                test('Can select multiple rows', async () => {
                    const api = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        selection: { mode: 'multiRow' },
                    });

                    await wait(10);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[5], nodes[4], nodes[2]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                });
            });
        });
    });
});
