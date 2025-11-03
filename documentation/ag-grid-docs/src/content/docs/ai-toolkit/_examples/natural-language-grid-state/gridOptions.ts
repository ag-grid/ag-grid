import type { GridOptions } from 'ag-grid-community';

import { ChatToolPanel } from './ChatToolPanel';

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
        toolPanels: [
            'columns',
            'filters-new',
            {
                id: 'chatPanel',
                labelDefault: 'AI Assistant',
                labelKey: 'chatPanel',
                iconKey: 'message',
                toolPanel: ChatToolPanel,
            },
        ],
        defaultToolPanel: 'chatPanel',
    },
    icons: {
        message:
            '<i style="display:inline-flex;line-height:1;vertical-align:middle;color:currentColor;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square-icon"><path d="M12 6V2H8"/><path d="M15 11v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M9 11v2"/></svg></i>',
    },
};
