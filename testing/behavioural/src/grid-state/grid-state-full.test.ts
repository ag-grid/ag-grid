import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { VERSION } from '../version';

describe('Grid State Full Snapshot', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const defaultRowData = [
        { id: '1', name: 'Alice', age: 30, sport: 'Football' },
        { id: '2', name: 'Bob', age: 25, sport: 'Tennis' },
        { id: '3', name: 'Charlie', age: 35, sport: 'Golf' },
        { id: '4', name: 'David', age: 28, sport: 'Basketball' },
        { id: '5', name: 'Eve', age: 32, sport: 'Swimming' },
    ];

    const defaultColumnDefs = [{ field: 'id' }, { field: 'name' }, { field: 'age' }, { field: 'sport' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('validate no unexpected changes to State shape', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defaultColumnDefs,
            rowData: defaultRowData,
        });
        await asyncSetTimeout(1);

        expect({
            aggregation: undefined,
            cellSelection: undefined,
            columnGroup: undefined,
            columnOrder: {
                orderedColIds: ['id', 'name', 'age', 'sport'],
            },
            columnPinning: undefined,
            columnSizing: {
                columnSizingModel: [
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'age',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'sport',
                        flex: undefined,
                        width: 200,
                    },
                ],
            },
            columnVisibility: undefined,
            filter: {
                advancedFilterModel: undefined,
                columnFilterState: undefined,
                filterModel: undefined,
                selectableFilters: {},
            },
            focusedCell: undefined,
            pagination: {
                page: 0,
                pageSize: 100,
            },
            pivot: undefined,
            rangeSelection: undefined,
            rowGroup: undefined,
            rowGroupExpansion: {
                collapsedRowGroupIds: ['0', '1', '2', '3', '4'], // TODO: FIX as part of https://ag-grid.zendesk.com/agent/tickets/40345
                expandedRowGroupIds: [],
            },
            rowSelection: undefined,
            scroll: undefined,
            sideBar: {
                openToolPanel: null,
                position: undefined,
                toolPanels: {},
                visible: false,
            },
            sort: undefined,
            ssrmRowGroupExpansion: undefined,
            version: VERSION,
        }).toEqual(api.getState());
    });

    test('should get state with multiple features active', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'id', hide: false },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
            ],
            rowData: defaultRowData,
            rowSelection: { mode: 'multiRow' },
            pagination: true,
            paginationPageSize: 2,
            paginationPageSizeSelector: [2],
        });

        api.selectAll('filtered');
        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        api.setColumnsVisible(['age'], false);

        const state = api.getState();
        expect(state).toEqual({
            aggregation: undefined,
            cellSelection: undefined,
            columnGroup: undefined,
            columnOrder: {
                orderedColIds: ['ag-Grid-SelectionColumn', 'ag-Grid-AutoColumn', 'id', 'name', 'age', 'sport'],
            },
            columnPinning: undefined,
            columnSizing: {
                columnSizingModel: [
                    {
                        colId: 'ag-Grid-SelectionColumn',
                        flex: undefined,
                        width: 50,
                    },
                    {
                        colId: 'ag-Grid-AutoColumn',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'age',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'sport',
                        flex: undefined,
                        width: 200,
                    },
                ],
            },
            columnVisibility: {
                hiddenColIds: ['age'],
            },
            filter: {
                advancedFilterModel: undefined,
                columnFilterState: undefined,
                filterModel: undefined,
                selectableFilters: {},
            },
            pagination: {
                page: 0,
                pageSize: 2,
            },
            pivot: undefined,
            rowGroup: {
                groupColIds: ['sport'],
            },
            rowGroupExpansion: {
                collapsedRowGroupIds: [
                    //TODO FIX
                    'row-group-sport-Football',
                    '0',
                    'row-group-sport-Tennis',
                    '1',
                    'row-group-sport-Golf',
                    '2',
                    'row-group-sport-Basketball',
                    '3',
                    'row-group-sport-Swimming',
                    '4',
                ],
                expandedRowGroupIds: [],
            },
            rowSelection: [
                'row-group-sport-Football',
                '0',
                'row-group-sport-Tennis',
                '1',
                'row-group-sport-Golf',
                '2',
                'row-group-sport-Basketball',
                '3',
                'row-group-sport-Swimming',
                '4',
            ],
            sideBar: {
                openToolPanel: null,
                position: undefined,
                toolPanels: {},
                visible: false,
            },
            sort: {
                sortModel: [
                    {
                        colId: 'name',
                        sort: 'asc',
                        type: 'default',
                    },
                ],
            },
            ssrmRowGroupExpansion: undefined,
            version: VERSION,
        });
    });
});
