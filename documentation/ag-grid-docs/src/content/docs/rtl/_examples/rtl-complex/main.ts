import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type {
    CellClassParams,
    CellStyle,
    ColDef,
    ColGroupDef,
    DefaultMenuItem,
    GetContextMenuItemsParams,
    GridApi,
    GridOptions,
    ICellRendererParams,
    MenuItemDef,
    RowSelectedEvent,
    SelectionChangedEvent,
    ValueSetterParams,
} from 'ag-grid-community';
import { LocaleModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { CountryCellRenderer } from './country-renderer_typescript';
import { LANGUAGES } from './data';
import type { LanguageConfig } from './data';

ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsEnterpriseModule), LocaleModule]);

const booleanValues = [true, 'true', false, 'false'];

const dataSize: string = '.1x22';

let currentLang: LanguageConfig = LANGUAGES['arabic'];
let gridApi: GridApi;

function getAutoGroupColumnDef(): ColDef {
    return {
        headerName: currentLang.headers.group,
        width: 200,
        field: 'name',
        valueGetter: (params) => {
            if (params.node && params.node.group) {
                return params.node.key;
            } else {
                return params.data[params.colDef.field!];
            }
        },
        cellRenderer: 'agGroupCellRenderer',
    };
}

function getGridOptions(language: string): GridOptions {
    currentLang = LANGUAGES[language];
    return {
        defaultColDef: {
            editable: true,
            minWidth: 100,
            filter: true,
            floatingFilter: true,
        },
        sideBar: true,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        enableRtl: currentLang.enableRtl,
        localeText: currentLang.localeText,
        statusBar: {
            statusPanels: [{ statusPanel: 'agAggregationComponent' }],
        },
        rowSelection: {
            mode: 'multiRow',
            groupSelects: 'descendants',
            selectAll: 'filtered',
        },
        quickFilterText: undefined,
        autoGroupColumnDef: getAutoGroupColumnDef(),
        onRowSelected: rowSelected,
        onSelectionChanged: selectionChanged,
        getBusinessKeyForNode: (node) => {
            if (node.data) {
                return node.data.name;
            } else {
                return '';
            }
        },
        getContextMenuItems: getContextMenuItems,
    };
}

function getContextMenuItems(params: GetContextMenuItemsParams): (DefaultMenuItem | MenuItemDef)[] {
    const result: (DefaultMenuItem | MenuItemDef)[] = params.defaultItems!.splice(0);
    result.push({
        name: currentLang.contextMenu.customMenuItem,
        icon: '<img src="https://www.ag-grid.com/example-assets/lab.png" style="width: 14px;" />',
        action: () => {
            const value = params.value ? params.value : '<empty>';
            console.log('You clicked a custom menu item on cell ' + value);
        },
    });

    return result;
}

function createDefaultCols(): (ColDef | ColGroupDef)[] {
    const firstColumn: ColDef = {
        headerName: currentLang.headers.name,
        field: 'name',
        width: 200,
        editable: true,
        enableRowGroup: true,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>',
        },
    };

    const cols: (ColDef | ColGroupDef)[] = [
        {
            headerName: currentLang.headers.participant,
            children: [
                firstColumn,
                {
                    headerName: currentLang.headers.language,
                    field: 'language',
                    width: 150,
                    editable: true,
                    filter: 'agSetColumnFilter',
                    cellRenderer: languageCellRenderer,
                    cellEditor: 'agSelectCellEditor',
                    enableRowGroup: true,
                    enablePivot: true,
                    cellEditorParams: {
                        values: currentLang.editorLanguages,
                    },
                    pinned: 'right',
                    headerTooltip: currentLang.headers.languageTooltip,
                },
                {
                    headerName: currentLang.headers.country,
                    field: 'country',
                    width: 150,
                    editable: true,
                    cellRenderer: CountryCellRenderer,
                    enableRowGroup: true,
                    enablePivot: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        cellRenderer: CountryCellRenderer,
                        values: currentLang.editorCountries,
                    },
                    filterParams: {
                        cellRenderer: CountryCellRenderer,
                    },
                },
            ],
        },
        {
            headerName: currentLang.headers.gameOfChoice,
            children: [
                {
                    headerName: currentLang.headers.gameName,
                    field: 'game.name',
                    width: 180,
                    editable: true,
                    filter: 'agSetColumnFilter',
                    tooltipField: 'game.name',
                    cellClass: () => {
                        return 'alphabet';
                    },
                    enableRowGroup: true,
                    enablePivot: true,
                    pinned: 'left',
                    icons: {
                        sortAscending: '<i class="fa fa-sort-alpha-up"/>',
                        sortDescending: '<i class="fa fa-sort-alpha-down"/>',
                    },
                },
                {
                    headerName: currentLang.headers.bought,
                    field: 'game.bought',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    width: 100,
                    enableRowGroup: true,
                    enablePivot: true,
                    enableValue: true,
                    cellRenderer: booleanCellRenderer,
                    cellStyle: { 'text-align': 'center' },
                    comparator: booleanComparator,
                    filterParams: { cellRenderer: booleanFilterCellRenderer },
                },
            ],
        },
        {
            groupId: 'performance',
            children: [
                {
                    headerName: currentLang.headers.bankBalance,
                    field: 'bankBalance',
                    width: 150,
                    editable: true,
                    cellRenderer: currencyRenderer,
                    cellStyle: currencyCssFunc,
                    filter: 'agNumberColumnFilter',
                    enableValue: true,
                    icons: {
                        sortAscending: '<i class="fa fa-sort-amount-up"/>',
                        sortDescending: '<i class="fa fa-sort-amount-down"/>',
                    },
                },
                {
                    headerName: currentLang.headers.extraInfo1,
                    columnGroupShow: 'open',
                    width: 150,
                    editable: false,
                    sortable: false,
                    suppressHeaderMenuButton: true,
                    cellStyle: { 'text-align': 'right' },
                    cellRenderer: () => {
                        return currentLang.cellContent.abra;
                    },
                },
                {
                    headerName: currentLang.headers.extraInfo2,
                    columnGroupShow: 'open',
                    width: 150,
                    editable: false,
                    sortable: false,
                    suppressHeaderMenuButton: true,
                    cellStyle: { 'text-align': 'left' },
                    cellRenderer: () => {
                        return currentLang.cellContent.cadabra;
                    },
                },
            ],
        },
        {
            headerName: currentLang.headers.rating,
            field: 'rating',
            width: 100,
            editable: true,
            cellRenderer: ratingRenderer,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            filterParams: { cellRenderer: ratingFilterRenderer },
        },
        {
            headerName: currentLang.headers.totalWinnings,
            field: 'totalWinnings',
            filter: 'agNumberColumnFilter',
            editable: true,
            valueSetter: numberValueSetter,
            width: 150,
            enableValue: true,
            cellRenderer: currencyRenderer,
            cellStyle: currencyCssFunc,
            icons: {
                sortAscending: '<i class="fa fa-sort-amount-up"/>',
                sortDescending: '<i class="fa fa-sort-amount-down"/>',
            },
        },
    ];

    const monthGroup: ColGroupDef = {
        headerName: currentLang.headers.monthlyBreakdown,
        children: [],
    };
    cols.push(monthGroup);
    for (let i = 0, len = currentLang.months.length; i < len; ++i) {
        const month = currentLang.months[i];
        const child: ColDef = {
            headerName: month,
            field: 'month_' + i,
            width: 100,
            filter: 'agNumberColumnFilter',
            editable: true,
            enableValue: true,
            cellClassRules: {
                'good-score': 'typeof x === "number" && x > 50000',
                'bad-score': 'typeof x === "number" && x < 10000',
            },
            valueSetter: numberValueSetter,
            cellRenderer: currencyRenderer,
            cellStyle: { 'text-align': 'right' },
        };
        monthGroup.children.push(child);
    }

    return cols;
}

function getColCount() {
    switch (dataSize) {
        case '10x100':
            return 100;
        default:
            return 22;
    }
}

function getRowCount() {
    switch (dataSize) {
        case '.1x22':
            return 100;
        case '1x22':
            return 1000;
        case '10x100':
            return 10000;
        case '100x22':
            return 100000;
        default:
            return -1;
    }
}

function createCols() {
    const colCount = getColCount();
    const defaultCols = createDefaultCols();
    const columns = defaultCols.slice(0, colCount);

    for (let col = 22; col < colCount; col++) {
        const colName = currentLang.colNames[col % currentLang.colNames.length];
        const colDef = {
            headerName: colName,
            field: 'col' + col,
            width: 200,
            editable: true,
        };
        columns.push(colDef);
    }

    return columns;
}

let loadInstance = 0;

function createData() {
    loadInstance++;

    const loadInstanceCopy = loadInstance;
    gridApi!.setGridOption('loading', true);

    const colDefs = createCols();

    const rowCount = getRowCount();
    const colCount = getColCount();

    let row = 0;
    const data: any[] = [];

    const intervalId = setInterval(() => {
        if (loadInstanceCopy != loadInstance) {
            clearInterval(intervalId);
            return;
        }

        for (let i = 0; i < 1000; i++) {
            if (row < rowCount) {
                const rowItem = createRowItem(row, colCount);
                data.push(rowItem);
                row++;
            }
        }

        if (row >= rowCount) {
            clearInterval(intervalId);
            setTimeout(() => {
                gridApi!.setGridOption('columnDefs', colDefs);
                gridApi!.setGridOption('rowData', data);
                gridApi!.setGridOption('loading', false);
            }, 0);
        }
    }, 0);
}

function createRowItem(row: number, colCount: number) {
    const rowItem: any = {};

    const countries = currentLang.countries;
    const countriesToPickFrom = Math.floor(countries.length * (((row % 3) + 1) / 3));
    const countryData = countries[(row * 19) % countriesToPickFrom];
    rowItem.country = countryData.country;
    rowItem.continent = countryData.continent;
    rowItem.language = countryData.language;

    const firstName = currentLang.firstNames[row % currentLang.firstNames.length];
    const lastName = currentLang.lastNames[row % currentLang.lastNames.length];
    rowItem.name = firstName + ' ' + lastName;

    rowItem.game = {
        name: currentLang.games[Math.floor(((row * 13) / 17) * 19) % currentLang.games.length],
        bought: booleanValues[row % booleanValues.length],
    };

    rowItem.bankBalance = Math.round(pseudoRandom() * 10000000) / 100 - 3000;
    rowItem.rating = Math.round(pseudoRandom() * 5);

    let totalWinnings = 0;
    for (let i = 0, len = currentLang.months.length; i < len; ++i) {
        const value = Math.round(pseudoRandom() * 10000000) / 100 - 20;
        rowItem['month_' + i] = value;
        totalWinnings += value;
    }
    rowItem.totalWinnings = totalWinnings;

    const defaultColCount = 22;
    for (let col = defaultColCount; col < colCount; col++) {
        const randomBit = pseudoRandom().toString().substring(2, 5);
        rowItem['col' + col] =
            currentLang.colNames[col % currentLang.colNames.length] +
            '-' +
            randomBit +
            ' - (' +
            (row + 1) +
            ',' +
            col +
            ')';
    }

    return rowItem;
}

let seed = 123456789;
const m = Math.pow(2, 32);
const a = 1103515245;
const c = 12345;

function pseudoRandom() {
    seed = (a * seed + c) % m;
    return seed / m;
}

function selectionChanged(event: SelectionChangedEvent) {
    console.log('Callback selectionChanged: selection count = ' + event.selectedNodes?.length);
}

function rowSelected(event: RowSelectedEvent) {
    // the number of rows selected could be huge, if the user is grouping and selects a group, so
    // to stop the console from clogging up, we only print if in the first 10 (by chance we know
    // the node id's are assigned from 0 upwards)
    if (Number(event.node.id) < 10) {
        const valueToPrint = event.node.group ? 'group (' + event.node.key + ')' : event.node.data.name;
        console.log('Callback rowSelected: ' + valueToPrint);
    }
}

function numberValueSetter(params: ValueSetterParams) {
    const newValue = params.newValue;
    let valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    const field = params.colDef.field!;
    const data = params.data;
    data[field] = valueAsNumber;
    return true;
}

function currencyCssFunc(params: CellClassParams): CellStyle {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return { color: 'red', 'text-align': 'right', 'font-weight': 'bold' };
    } else {
        return { 'text-align': 'right' };
    }
}

function ratingFilterRenderer(params: ICellRendererParams) {
    return ratingRendererGeneral(params.value, true);
}

function ratingRenderer(params: ICellRendererParams) {
    return ratingRendererGeneral(params.value, false);
}

function ratingRendererGeneral(value: any, forFilter: boolean) {
    if (value === '(Select All)') {
        return value;
    }

    let result = '<span>';

    for (let i = 0; i < 5; i++) {
        if (value > i) {
            result += '<img src="https://www.ag-grid.com/example-assets/gold-star.png" />';
        }
    }

    if (forFilter && Number(value) === 0) {
        result += currentLang.cellContent.noStars;
    }

    return result;
}

function currencyRenderer(params: ICellRendererParams) {
    if (params.value === null || params.value === undefined) {
        return null;
    } else if (isNaN(params.value)) {
        return 'NaN';
    } else {
        if (params.node.group && params.column!.getAggFunc() === 'count') {
            return params.value;
        } else {
            return (
                '&pound;' +
                Math.floor(params.value)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            );
        }
    }
}

function booleanComparator(value1: any, value2: any) {
    const value1Cleaned = booleanCleaner(value1);
    const value2Cleaned = booleanCleaner(value2);
    const value1Ordinal = value1Cleaned === true ? 0 : value1Cleaned === false ? 1 : 2;
    const value2Ordinal = value2Cleaned === true ? 0 : value2Cleaned === false ? 1 : 2;
    return value1Ordinal - value2Ordinal;
}

let count = 0;

function booleanCellRenderer(params: ICellRendererParams) {
    count++;
    if (count <= 1) {
        // params.api.onRowHeightChanged();
    }

    const valueCleaned = booleanCleaner(params.value);
    if (valueCleaned === true) {
        //this is the unicode for tick character
        return "<span title='true'>&#10004;</span>";
    } else if (valueCleaned === false) {
        //this is the unicode for cross character
        return "<span title='false'>&#10006;</span>";
    } else if (params.value !== null && params.value !== undefined) {
        return params.value.toString();
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params: ICellRendererParams) {
    const valueCleaned = booleanCleaner(params.value);

    if (valueCleaned === true) {
        //this is the unicode for tick character
        return '&#10004;';
    } else if (valueCleaned === false) {
        //this is the unicode for cross character
        return '&#10006;';
    } else if (params.value === '(Select All)') {
        return params.value;
    } else {
        return currentLang.cellContent.empty;
    }
}

function booleanCleaner(value: any) {
    if (value === 'true' || value === true || value === 1) {
        return true;
    } else if (value === 'false' || value === false || value === 0) {
        return false;
    } else {
        return null;
    }
}

function languageCellRenderer(params: ICellRendererParams) {
    if (params.value !== null && params.value !== undefined) {
        return params.value;
    } else {
        return null;
    }
}

function onLanguageChange() {
    const select = document.querySelector<HTMLSelectElement>('#language')!;
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    seed = 123456789;
    gridApi.destroy();
    gridApi = createGrid(gridDiv, getGridOptions(select.value));
    createData();
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridApi = createGrid(gridDiv, getGridOptions('arabic'));
    createData();
});
