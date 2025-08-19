import type { CellStyleFunc, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';

import { COUNTRY_NAMES, LANGUAGES, type RowItem, games, months } from '../data';
import { CountryCellRenderer, RatingRenderer } from './renderers';

//put in the month cols
const monthCols = months.map((month) => {
    const child: ColDef = {
        field: month,
        width: 120,
        enableValue: true,
        aggFunc: 'sum',
        cellClassRules: {
            'good-score': 'typeof x === "number" && x > 50000',
            'bad-score': 'typeof x === "number" && x < 10000',
            'currency-cell': 'typeof x === "number" && x >= 10000 && x <= 50000',
        },
        cellDataType: 'currency',
        filter: 'agNumberColumnFilter',
        filterParams: {
            buttons: ['reset'],
            inRangeInclusive: true,
        },
    };
    return child;
});

const currencyCssFunc: CellStyleFunc = (params) => {
    if (params.value != null && params.value < 0) {
        return { color: 'red', fontWeight: 'bold' };
    }
    return undefined;
};

const currencyFormatter = (params: ValueFormatterParams) => {
    if (params.value == null) {
        return '';
    }

    if (isNaN(params.value)) {
        return 'NaN';
    }

    // if we are doing 'count', then we do not show pound sign
    if (params.node?.group && params.column.getAggFunc() === 'count') {
        return params.value;
    }

    let result = '$' + Math.floor(Math.abs(params.value)).toLocaleString();

    if (params.value < 0) {
        result = '(' + result + ')';
    }

    return result;
};

export const columnTypes: GridOptions['columnTypes'] = {
    currencyType: {
        useValueFormatterForExport: false,
        valueFormatter: currencyFormatter,
    },
};

export const dataTypeDefinitions: GridOptions['dataTypeDefinitions'] = {
    currency: {
        extendsDataType: 'number',
        baseDataType: 'number',

        valueParser: (params) => {
            if (params.newValue == null) {
                return null;
            }
            let newValue = String(params.newValue)?.trim?.();
            if (newValue === '') {
                return null;
            }
            newValue = newValue.replace('$', '').replace(',', '');
            if (newValue.includes('(')) {
                newValue = newValue.replace('(', '').replace(')', '');
                newValue = '-' + newValue;
            }
            return Number(newValue);
        },
        columnTypes: ['currencyType', 'numericColumn'],
    },
};

const mobileDefaultCols: ColDef<RowItem>[] = [
    {
        rowDrag: true,
        field: 'name',
        width: 200,
        cellClass: 'v-align',
    },
    {
        field: 'language',
        width: 150,
        filter: 'agSetColumnFilter',
        cellEditor: 'agRichSelectCellEditor',
        cellClass: 'v-align',
        cellEditorParams: {
            values: LANGUAGES,
        },
    },
    {
        field: 'country',
        width: 150,
        cellRenderer: CountryCellRenderer,
        cellRendererParams: {
            deferRender: true,
        },
        cellClass: 'v-align',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: CountryCellRenderer,
            values: COUNTRY_NAMES,
        },
    },
    {
        field: 'game.name',
        width: 180,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: [...games].sort(),
        },
        filter: 'agSetColumnFilter',
        cellClass: () => 'alphabet',
    },
    {
        field: 'bankBalance',
        width: 180,
        cellClassRules: {
            'currency-cell': 'typeof x == "number"',
        },
        enableValue: true,
        cellDataType: 'currency',
        filter: 'agNumberColumnFilter',
    },
    {
        field: 'totalWinnings',
        filter: 'agNumberColumnFilter',
        width: 170,
        enableValue: true,
        cellClassRules: {
            'currency-cell': 'typeof x == "number"',
        },
        cellStyle: currencyCssFunc,
        cellDataType: 'currency',
    },
    ...monthCols, // Add flat month columns to the mobile default columns
];

const desktopDefaultCols: (ColDef<RowItem> | ColGroupDef<RowItem>)[] = [
    {
        headerName: 'Participant',
        children: [
            {
                rowDrag: true,
                field: 'name',
                width: 200,
                enableRowGroup: true,
                cellClass: 'v-align',
            },
            {
                field: 'language',
                width: 150,
                cellEditor: 'agRichSelectCellEditor',
                cellClass: 'v-align',
                enableRowGroup: true,
                enablePivot: true,
                cellEditorParams: {
                    values: LANGUAGES,
                },
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        {
                            filter: 'agTextColumnFilter',
                            display: 'subMenu',
                        },
                        {
                            filter: 'agSetColumnFilter',
                            filterParams: {
                                buttons: ['reset'],
                            },
                        },
                    ],
                },
            },
            {
                field: 'country',
                width: 150,
                cellRenderer: CountryCellRenderer,
                cellRendererParams: {
                    deferRender: true,
                },
                cellClass: ['country-cell', 'v-align'],
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    cellRenderer: CountryCellRenderer,
                    values: COUNTRY_NAMES,
                },
                filter: 'agSetColumnFilter',
                filterParams: {
                    cellRenderer: CountryCellRenderer,
                    buttons: ['reset'],
                },
            },
        ],
    },
    {
        headerName: 'Game of Choice',
        children: [
            {
                field: 'game.name',
                width: 180,
                filter: 'agMultiColumnFilter',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: [...games].sort(),
                    allowTyping: true,
                    searchType: 'matchAny',
                    filterList: true,
                    highlightMatch: true,
                },
                tooltipField: 'game.name',
                cellClass: () => 'alphabet',
                filterParams: {
                    filters: [
                        {
                            filter: 'agTextColumnFilter',
                            display: 'subMenu',
                        },
                        {
                            filter: 'agSetColumnFilter',
                            filterParams: {
                                buttons: ['reset'],
                            },
                        },
                    ],
                },
                enableRowGroup: true,
                enablePivot: true,
            },
            {
                headerName: 'Bought',
                field: 'game.bought',
                filter: 'agSetColumnFilter',
                width: 150,
                enableRowGroup: true,
                enablePivot: true,
                cellClass: 'boolean-type',
                cellStyle: { justifyItems: 'center' },
                filterParams: {
                    cellRendererParams: { isFilterRenderer: true },
                    buttons: ['reset'],
                },
            },
        ],
    },
    {
        headerName: 'Performance',
        groupId: 'performance',
        children: [
            {
                field: 'bankBalance',
                width: 180,
                cellClassRules: {
                    'currency-cell': 'typeof x == "number"',
                },
                enableValue: true,
                aggFunc: 'avg',
                cellDataType: 'currency',
                filter: 'agNumberColumnFilter',
            },
        ],
    },
    {
        field: 'rating',
        width: 120,
        cellRenderer: RatingRenderer,
        cellClass: 'v-align',
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        aggFunc: 'avg',
        chartDataType: 'category',
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            min: 0,
            max: 5,
        },
        filterParams: { cellRenderer: RatingRenderer, cellRendererParams: { isFilterRenderer: true } },
    },
    {
        field: 'totalWinnings',
        filter: 'agNumberColumnFilter',
        width: 200,
        enableValue: true,
        aggFunc: 'sum',
        cellClassRules: {
            'currency-cell': 'typeof x == "number"',
        },
        cellDataType: 'currency',
        cellStyle: currencyCssFunc,
    },
    {
        headerName: 'Monthly Breakdown',
        children: monthCols,
    },
];

export const autoGroupColDef: ColDef = {
    headerName: 'Group',
    width: 250,
    field: 'name',
};

export const smallDefaultCols = mobileDefaultCols;
export const largeDefaultCols = desktopDefaultCols;

export const smallColCount = smallDefaultCols.length;
// Set the default column count taking into account if there are group columns
export const largeColCount = 22;
