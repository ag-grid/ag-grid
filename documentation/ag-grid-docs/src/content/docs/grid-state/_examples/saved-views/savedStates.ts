import type { GridState } from 'ag-grid-community';

// Full grid states as returned by `api.getState()` after a user configured the grid and saved.
export const savedStates: Record<string, GridState> = {
    // An empty initialState uses all the defaults based on grid and column definitions
    default: {},
    medalsByCountry: {
        version: '36.2.0',
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'columns',
            toolPanels: {
                columns: {
                    expandedGroupIds: [],
                },
            },
        },
        sort: {
            sortModel: [
                {
                    colId: 'total',
                    sort: 'desc',
                    type: 'default',
                },
            ],
        },
        rowGroup: {
            groupColIds: ['country'],
        },
        aggregation: {
            aggregationModel: [
                {
                    colId: 'total',
                    aggFunc: 'sum',
                },
                {
                    colId: 'gold',
                    aggFunc: 'sum',
                },
                {
                    colId: 'silver',
                    aggFunc: 'sum',
                },
                {
                    colId: 'bronze',
                    aggFunc: 'sum',
                },
            ],
        },
        columnVisibility: {
            hiddenColIds: ['athlete', 'sport', 'year'],
        },
        columnSizing: {
            columnSizingModel: [
                {
                    colId: 'ag-Grid-AutoColumn',
                    flex: 1,
                    width: 200,
                },
                {
                    colId: 'country',
                    flex: 1,
                    width: 160,
                },
                {
                    colId: 'total',
                    flex: 1,
                    width: 160,
                },
                {
                    colId: 'gold',
                    flex: 1,
                    width: 160,
                },
                {
                    colId: 'silver',
                    flex: 1,
                    width: 160,
                },
                {
                    colId: 'bronze',
                    flex: 1,
                    width: 160,
                },
                {
                    colId: 'athlete',
                    flex: 1,
                    width: 150,
                },
                {
                    colId: 'sport',
                    flex: 1,
                    width: 150,
                },
                {
                    colId: 'year',
                    flex: 1,
                    width: 110,
                },
            ],
        },
        columnOrder: {
            orderedColIds: [
                'ag-Grid-AutoColumn',
                'country',
                'total',
                'gold',
                'silver',
                'bronze',
                'athlete',
                'sport',
                'year',
            ],
        },
        rowGroupExpansion: {
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        },
        pagination: {
            page: 0,
            pageSize: 100,
        },
    },
    swimmingLeaders: {
        version: '36.2.0',
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: null,
            toolPanels: {
                columns: {
                    expandedGroupIds: [],
                },
            },
        },
        sort: {
            sortModel: [
                {
                    colId: 'gold',
                    sort: 'desc',
                    type: 'default',
                },
                {
                    colId: 'silver',
                    sort: 'desc',
                    type: 'default',
                },
                {
                    colId: 'bronze',
                    sort: 'desc',
                    type: 'default',
                },
            ],
        },
        columnPinning: {
            leftColIds: ['athlete'],
            rightColIds: [],
        },
        columnVisibility: {
            hiddenColIds: ['sport', 'total'],
        },
        columnSizing: {
            columnSizingModel: [
                {
                    colId: 'athlete',
                    flex: 1,
                    width: 150,
                },
                {
                    colId: 'gold',
                    flex: undefined,
                    width: 160,
                },
                {
                    colId: 'silver',
                    flex: undefined,
                    width: 160,
                },
                {
                    colId: 'bronze',
                    flex: undefined,
                    width: 160,
                },
                {
                    colId: 'total',
                    flex: 1,
                    width: 140,
                },
                {
                    colId: 'country',
                    flex: 1,
                    width: 150,
                },
                {
                    colId: 'year',
                    flex: 1,
                    width: 140,
                },
                {
                    colId: 'sport',
                    flex: 1,
                    width: 150,
                },
            ],
        },
        columnOrder: {
            orderedColIds: ['athlete', 'gold', 'silver', 'bronze', 'total', 'country', 'year', 'sport'],
        },
        rowGroupExpansion: {
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        },
        pagination: {
            page: 0,
            pageSize: 100,
        },
        filter: {
            filterModel: {
                sport: {
                    filterType: 'set',
                    values: ['Swimming'],
                },
            },
        },
    },
};
