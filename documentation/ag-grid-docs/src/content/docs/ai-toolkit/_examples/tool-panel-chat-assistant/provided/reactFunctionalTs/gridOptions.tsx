import type { GridOptions, ValueFormatterParams } from 'ag-grid-community';

import { ChatToolPanel } from './ChatToolPanel';
import { CountryFlagCellRenderer } from './CountryFlagCellRenderer';
import type { ITransaction } from './generateTransactions';

export const gridOptions: GridOptions<ITransaction> = {
    columnDefs: [
        {
            field: 'transactionDate',
            filter: 'agDateColumnFilter',
            groupHierarchy: ['formattedMonth'],
            enablePivot: true,
            enableRowGroup: true,
            valueFormatter: (params: ValueFormatterParams) => {
                if (params.value == null) return;
                return params.value.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            },
        },
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            cellRenderer: CountryFlagCellRenderer,
            enablePivot: true,
            enableRowGroup: true,
        },
        {
            field: 'status',
            filter: 'agSetColumnFilter',
            enablePivot: true,
            enableRowGroup: true,
        },
        {
            field: 'amount',
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => {
                if (params.value == null) return;
                return params.value.toLocaleString(`en-${params?.data?.country || 'GB'}`, {
                    style: 'currency',
                    currency: params.data?.currency || 'GBP',
                });
            },
            cellStyle: (params) => ({ color: params?.value < 0 ? '#dc3545' : '#28a745' }),
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'merchant',
            filter: 'agSetColumnFilter',
            enablePivot: true,
            enableRowGroup: true,
        },
        {
            field: 'category',
            filter: 'agSetColumnFilter',
            enablePivot: true,
            enableRowGroup: true,
        },
        {
            field: 'currency',
            filter: 'agSetColumnFilter',
            enablePivot: true,
            enableRowGroup: true,
            hide: true,
        },
    ],
    autoSizeStrategy: {
        type: 'fitCellContents',
    },
    defaultColDef: {
        filter: true,
        sortable: true,
        resizable: true,
    },
    pagination: true,
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
