import type { GridOptions } from 'ag-grid-community';

const ssrmRowData = [
    {
        key: 'Ireland',
        id: '0',
        children: [
            {
                id: '1',
                key: '2000',
                children: [
                    { id: '2', key: 'John Von Neumann' },
                    { id: '3', key: 'Alan Turing' },
                ],
            },
            {
                id: '4',
                key: '',
                children: [{ id: '5', key: 'Ada Lovelace' }],
            },
        ],
    },
    {
        id: '6',
        key: 'Italy',
        children: [
            {
                id: '7',
                key: '2000',
                children: [{ id: '8', key: 'Donald Knuth' }],
            },
            {
                id: '9',
                key: '2001',
                children: [{ id: '10', key: 'Marvin Minsky' }],
            },
        ],
    },
    {
        id: '11',
        key: '',
        children: [
            {
                id: '12',
                key: '2000',
                children: [{ id: '13', key: 'Donald Knuth' }],
            },
            {
                id: '14',
                key: '2001',
                children: [{ id: '15', key: 'Marvin Minsky' }],
            },
            {
                id: '16',
                key: '',
                children: [{ id: '17', key: 'Donald Knuth' }],
            },
        ],
    },
];

const csrmGridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete', hide: true },
    ],
    rowData: ssrmRowData,
    treeData: true,
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    autoGroupColumnDef: {
        cellClass: 'ag-cell-group',
    },
    detailCellRenderer: () => 'EMPTY',
    groupTotalRow: 'bottom', // tests for location of "Total" cell values
    grandTotalRow: 'bottom', // tests for location of "Total" cell values
};

const ssrmGidOptions: GridOptions = {
    columnDefs: [{ field: 'athlete', hide: true }],
    isServerSideGroup: (data) => !!data.children,
    getServerSideGroupKey: (data) => data.key,
    isServerSideGroupOpenByDefault: () => true,
    treeData: true,
    rowModelType: 'serverSide',
    serverSideDatasource: {
        getRows: (params) => {
            if (!params.parentNode.data) {
                params.success({ rowData: ssrmRowData, rowCount: ssrmRowData.length });
                return;
            }
            const data = params.parentNode.data.children;
            params.success({ rowData: data, rowCount: data.length });
        },
    },
    getChildCount: () => 50,
    getRowId: (p) => p.data.id,
    autoGroupColumnDef: {
        cellClass: 'ag-cell-group',
    },
    detailCellRenderer: () => 'EMPTY',
    groupTotalRow: 'bottom', // tests for location of "Total" cell values
};

export const rowModelGridOptions = {
    ssrm: ssrmGidOptions,
    csrm: csrmGridOptions,
};
