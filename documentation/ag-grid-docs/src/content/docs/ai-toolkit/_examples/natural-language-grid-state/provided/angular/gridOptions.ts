import type { GridOptions } from 'ag-grid-community';

export interface IOlympicData {
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

export const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            headerName: 'Athlete',
            minWidth: 200,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
            enablePivot: false,
        },
        {
            field: 'age',
            headerName: 'Age',
            width: 90,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            enableRowGroup: false,
        },
        {
            field: 'country',
            headerName: 'Country',
            minWidth: 150,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'year',
            headerName: 'Year',
            width: 90,
            filter: 'agNumberColumnFilter',
            enableRowGroup: true,
            enableValue: false,
        },
        {
            field: 'sport',
            headerName: 'Sport',
            minWidth: 150,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'gold',
            headerName: 'Gold',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'silver',
            headerName: 'Silver',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'bronze',
            headerName: 'Bronze',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    enableFilterHandlers: true,
    sideBar: {
        toolPanels: ['columns', 'filters-new'],
    },
};
