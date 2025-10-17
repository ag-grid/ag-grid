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
            minWidth: 200,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
            enablePivot: false,
        },
        {
            field: 'age',
            width: 90,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            enableRowGroup: false,
        },
        {
            field: 'country',
            minWidth: 150,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'year',
            width: 90,
            filter: 'agNumberColumnFilter',
            enableRowGroup: true,
            enableValue: false,
        },
        {
            field: 'sport',
            minWidth: 150,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'gold',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'silver',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'bronze',
            width: 100,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'total',
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
