import { GridOptions } from 'ag-grid-community';

import { ChatToolPanel } from './ChatToolPanel';
import { CountryFlagCellRenderer } from './CountryFlagCellRenderer';
import { TransactionResultCellRenderer } from './TransactionResultCellRenderer';
import { ITransaction } from './generateTransactions';

export const gridOptions: GridOptions<ITransaction> = {
    columnDefs: [
        {
            field: 'transaction_id',
            headerName: 'Transaction ID',
            minWidth: 140,
            filter: 'agTextColumnFilter',
            enableRowGroup: false,
            enablePivot: false,
        },
        {
            field: 'country',
            headerName: 'Country',
            width: 120,
            filter: 'agSetColumnFilter',
            cellRenderer: CountryFlagCellRenderer,
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
            cellRenderer: TransactionResultCellRenderer,
        },
        {
            field: 'signed_amount',
            headerName: 'Signed Amount',
            width: 140,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
            valueFormatter: (params) => {
                if (params.value == null) return '';
                return `£${params.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
            cellStyle: (params) => {
                if (params.value == null) return null;
                return { color: params.value < 0 ? '#dc3545' : '#28a745' };
            },
        },
        {
            field: 'account_type',
            headerName: 'Account Type',
            minWidth: 130,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'transaction_date',
            headerName: 'Transaction Date',
            minWidth: 160,
            filter: 'agDateColumnFilter',
            enableRowGroup: false,
            enablePivot: false,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString();
            },
        },
        {
            field: 'settlement_date',
            headerName: 'Settlement Date',
            minWidth: 160,
            filter: 'agDateColumnFilter',
            enableRowGroup: false,
            enablePivot: false,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString();
            },
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            filter: 'agNumberColumnFilter',
            enableValue: true,
            aggFunc: 'sum',
            valueFormatter: (params) => {
                if (params.value == null) return '';
                return params.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            },
        },
        {
            field: 'currency',
            headerName: 'Currency',
            width: 100,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 100,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'category',
            headerName: 'Category',
            minWidth: 130,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'merchant',
            headerName: 'Merchant',
            minWidth: 150,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'account_id',
            headerName: 'Account ID',
            minWidth: 120,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
            enablePivot: false,
        },
        {
            field: 'month',
            headerName: 'Month',
            width: 110,
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
            enablePivot: true,
        },
    ],
    autoSizeStrategy: {
        type: 'fitCellContents',
    },
    defaultColDef: {
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
