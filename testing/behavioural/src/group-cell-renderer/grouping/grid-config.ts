import type { GridOptions } from 'ag-grid-community';

const csrmRowData = [
    { country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
    { country: 'Ireland', year: '2000', sport: 'Football', athlete: 'Alan Turing' },
    { country: 'Ireland', sport: 'Soccer', athlete: 'Ada Lovelace' },
    { year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
    { year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
    { sport: 'Soccer', athlete: 'Donald Knuth' },
];

const ssrmRowData = [
    {
        id: '0',
        country: 'Ireland',
        children: [
            {
                id: '1',
                year: '2000',
                children: [
                    { id: '2', sport: 'Sailing', athlete: 'John Von Neumann' },
                    { id: '3', sport: 'Football', athlete: 'Alan Turing' },
                ],
            },
            {
                id: '4',
                year: '',
                children: [{ id: '5', sport: 'Soccer', athlete: 'Ada Lovelace' }],
            },
        ],
    },
    {
        id: '6',
        country: 'Italy',
        children: [
            {
                id: '7',
                year: '2000',
                children: [{ id: '8', sport: 'Soccer', athlete: 'Donald Knuth' }],
            },
            {
                id: '9',
                year: '2001',
                children: [{ id: '10', sport: 'Football', athlete: 'Marvin Minsky' }],
            },
        ],
    },
    {
        id: '11',
        country: '',
        children: [
            {
                id: '12',
                year: '2000',
                children: [{ id: '13', sport: 'Soccer', athlete: 'Donald Knuth' }],
            },
            {
                id: '14',
                year: '2001',
                children: [{ id: '15', sport: 'Football', athlete: 'Marvin Minsky' }],
            },
            {
                id: '16',
                year: '',
                children: [{ id: '17', athlete: 'Donald Knuth' }],
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
    groupDefaultExpanded: -1,
    rowData: csrmRowData,
    autoGroupColumnDef: {
        cellClass: 'ag-cell-group',
    },
    detailCellRenderer: () => 'EMPTY',
    groupTotalRow: 'bottom', // tests for location of "Total" cell values
    grandTotalRow: 'bottom', // tests for location of "Total" cell values
};

const ssrmGidOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete', hide: true },
    ],
    isServerSideGroupOpenByDefault: () => true,
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
