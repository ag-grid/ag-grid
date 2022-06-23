/* eslint-disable */
import React, {memo, useEffect, useMemo, useRef, useState} from "react";
import {Helmet} from "react-helmet";
import styles from "../pages/components/assets/homepage/homepage.module.scss";
import {AgGridReact} from "@ag-grid-community/react";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model'
import {CsvExportModule} from '@ag-grid-community/csv-export'
import {ClipboardModule} from "@ag-grid-enterprise/clipboard";
import {ColumnsToolPanelModule} from "@ag-grid-enterprise/column-tool-panel";
import {ExcelExportModule} from "@ag-grid-enterprise/excel-export";
import {FiltersToolPanelModule} from "@ag-grid-enterprise/filter-tool-panel";
import {GridChartsModule} from "@ag-grid-enterprise/charts";
import {MasterDetailModule} from "@ag-grid-enterprise/master-detail";
import {MenuModule} from "@ag-grid-enterprise/menu";
import {MultiFilterModule} from "@ag-grid-enterprise/multi-filter";
import {RangeSelectionModule} from "@ag-grid-enterprise/range-selection";
import {RichSelectModule} from "@ag-grid-enterprise/rich-select";
import {RowGroupingModule} from "@ag-grid-enterprise/row-grouping";
import {SetFilterModule} from "@ag-grid-enterprise/set-filter";
import {SideBarModule} from "@ag-grid-enterprise/side-bar";
import {StatusBarModule} from "@ag-grid-enterprise/status-bar";
import {SparklinesModule} from "@ag-grid-enterprise/sparklines";
import {booleanValues, colNames, countries, COUNTRY_CODES, firstNames, games, lastNames, months} from "./consts"
import {
    pseudoRandom,
    suppressColumnMoveAnimation,
    sharedNumberParser,
    numberParser,
    booleanComparator,
    booleanCleaner,
    currencyFormatter,
    axisLabelFormatter,
    formatThousands
} from "./utils";
import {PersonFloatingFilterComponent} from "./PersonFloatingFilterComponent";
import {PersonFilter} from "./PersonFilter";
import {CountryFloatingFilterComponent} from "./CountryFloatingFilterComponent";
import {WinningsFilter} from "./WinningsFilter";

import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-alpine.css"
import "@ag-grid-community/styles/ag-theme-balham.css"
import "@ag-grid-community/styles/ag-theme-material.css"

const IS_SSR = typeof window === "undefined"

const helmet = [];

const AgGridReactMemo = memo(AgGridReact);

const groupColumn = {
    headerName: "Group",
    width: 250,
    field: 'name',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
};

function currencyCssFunc(params) {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return {"color": "red", "font-weight": "bold"};
    }
    return {};
}

const countryCellRenderer = (props) => {
    //get flags from here: http://www.freeflagicons.com/
    if (props.value === null || props.value === "" || props.value === '(Select All)') {
        return props.value;
    } else if (props.value === undefined) {
        return null
    }

    return <><img className={styles['flag']} alt="${props.value}" border="0" width="15" height="10"
                  src={`https://flags.fmcdn.net/data/flags/mini/${COUNTRY_CODES[props.value]}.png`}/> {props.value}</>;
}

function ratingFilterRenderer(params) {
    const {value} = params;
    if (value === '(Select All)') {
        return value;
    }

    return (
        <span>
            {[...Array(5)].map((x, i) => {
                    return value > i ?
                        <img key={i} src="../images/star.svg" alt={`${value} stars`} className={styles['star']} width="12" height="12"/> :
                        null
                }
            )}
            (No stars)
        </span>
    )
}

function ratingRenderer(params) {
    const {value} = params;
    if (value === '(Select All)') {
        return value;
    }

    return (
        <span>
            {[...Array(5)].map((x, i) => {
                    return value > i ?
                        <img key={i} src="../images/star.svg" alt={`${value} stars`} className={styles['star']} width="12" height="12"/> :
                        null
                }
            )}
        </span>
    )
}

const booleanCellRenderer = (props) => {
    const [valueCleaned] = useState(booleanCleaner(props.value));
    if (valueCleaned === true) {
        return <span title='true' className='ag-icon ag-icon-tick content-icon'/>;
    }

    if (valueCleaned === false) {
        return <span title='false' className='ag-icon ag-icon-cross content-icon'/>;
    }

    if (props.value !== null && props.value !== undefined) {
        return props.value.toString();
    }
    return null;
}

const booleanFilterCellRenderer = (props) => {
    const [valueCleaned] = useState(booleanCleaner(props.value));
    if (valueCleaned === true) {
        return <span title='true' className='ag-icon ag-icon-tick content-icon'/>;
    }

    if (valueCleaned === false) {
        return <span title='false' className='ag-icon ag-icon-cross content-icon'/>;
    }

    if (props.value === '(Select All)') {
        return props.value;
    }
    return "(empty)";
}

const mobileDefaultCols = [
    {
        headerName: 'Name',
        rowDrag: true,
        field: 'name',
        width: 200,
        editable: true,
        cellClass: 'vAlign',
        checkboxSelection: params => {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelection: params => {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelectionFilteredOnly: true
    },
    {
        headerName: "Language", field: "language", width: 150, editable: true, filter: 'agSetColumnFilter',
        cellEditor: 'agSelectCellEditor',
        cellClass: 'vAlign',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', 'German',
                'Swedish', 'Norwegian', 'Italian', 'Greek', 'Icelandic', 'Portuguese', 'Maltese']
        }
    },
    {
        headerName: "Country", field: "country", width: 150, editable: true,
        cellRenderer: 'countryCellRenderer',
        cellClass: 'vAlign',
        cellEditorPopup: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: 'countryCellRenderer',
            values: ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
                "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
                "Uruguay", "Venezuela", "Belgium", "Luxembourg"]
        },
        // floatCell: true,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>'
        }
    },
    {
        headerName: "Game Name", field: "game.name", width: 180, editable: true, filter: 'agSetColumnFilter',
        cellClass: () => 'alphabet'
    },
    {
        headerName: "Bank Balance", field: "bankBalance", width: 180, editable: true,
        valueFormatter: currencyFormatter,
        type: 'numericColumn',
        cellClassRules: {
            'currencyCell': 'typeof x == "number"'
        },
        enableValue: true
    },
    {
        headerName: "Total Winnings", field: "totalWinnings", filter: 'agNumberColumnFilter', type: 'numericColumn',
        editable: true, valueParser: numberParser, width: 170,
        // aggFunc: 'sum',
        enableValue: true,
        cellClassRules: {
            'currencyCell': 'typeof x == "number"'
        },
        valueFormatter: currencyFormatter, cellStyle: currencyCssFunc,
        icons: {
            sortAscending: '<i class="fa fa-sort-amount-up"/>',
            sortDescending: '<i class="fa fa-sort-amount-down"/>'
        }
    }
];

const desktopDefaultCols = [
    // {
    //     headerName: 'Test Date',
    //     editable: true,
    //     cellEditor: 'date',
    //     field: 'testDate'
    // },
    //{headerName: "", valueGetter: "node.id", width: 20}, // this row is for showing node id, handy for testing
    {
        // column group 'Participant
        headerName: 'Participant',
        // marryChildren: true,
        children: [
            {
                headerName: 'Name',
                rowDrag: true,
                field: 'name',
                width: 200,
                editable: true,
                enableRowGroup: true,
                // enablePivot: true,
                filter: 'personFilter',
                cellClass: 'vAlign',
                floatingFilterComponent: 'personFloatingFilterComponent',
                checkboxSelection: params => {
                    // we put checkbox on the name if we are not doing grouping
                    return params.columnApi.getRowGroupColumns().length === 0;
                },
                headerCheckboxSelection: params => {
                    // we put checkbox on the name if we are not doing grouping
                    return params.columnApi.getRowGroupColumns().length === 0;
                },
                headerCheckboxSelectionFilteredOnly: true
            },
            {
                headerName: "Language", field: "language", width: 150, editable: true,
                cellEditor: 'agSelectCellEditor',
                cellClass: 'vAlign',
                // wrapText: true,
                // autoHeight: true,
                enableRowGroup: true,
                enablePivot: true,
                // rowGroupIndex: 0,
                // pivotIndex: 0,
                cellEditorParams: {
                    values: ['English', 'Spanish', 'French', 'Portuguese', 'German',
                        'Swedish', 'Norwegian', 'Italian', 'Greek', 'Icelandic', 'Portuguese', 'Maltese']
                },
                // pinned: 'left',
                headerTooltip: "Example tooltip for Language",
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        {
                            filter: 'agTextColumnFilter',
                            display: 'subMenu'
                        },
                        {
                            filter: 'agSetColumnFilter',
                            filterParams: {
                                buttons: ['reset']
                            }
                        }
                    ]
                },
            },
            {
                headerName: "Country", field: "country", width: 150, editable: true,
                cellRenderer: 'countryCellRenderer',
                cellEditorPopup: true,
                suppressFillHandle: true,
                // pivotIndex: 1,
                // rowGroupIndex: 1,
                cellClass: ['countryCell', 'vAlign'],
                // colSpan: function(params) {
                //     if (params.data && params.data.country==='Ireland') {
                //         return 2;
                //     } else if (params.data && params.data.country==='France') {
                //         return 3;
                //     } else {
                //         return 1;
                //     }
                // },
                // cellStyle: function(params) {
                //     if (params.data && params.data.country==='Ireland') {
                //         return {backgroundColor: 'red'};
                //     } else if (params.data && params.data.country==='France') {
                //         return {backgroundColor: 'green'};
                //     } else {
                //         return null;
                //     }
                // },
                // rowSpan: function(params) {
                //     if (params.data && params.data.country==='Ireland') {
                //         return 2;
                //     } else if (params.data && params.data.country==='France') {
                //         return 3;
                //     } else {
                //         return 1;
                //     }
                // },
                // suppressMovable: true,
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    cellRenderer: 'countryCellRenderer',
                    values: ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
                        "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
                        "Uruguay", "Venezuela", "Belgium", "Luxembourg"]
                },
                // pinned: 'left',
                // floatCell: true,
                filter: 'agSetColumnFilter',
                filterParams: {
                    cellRenderer: 'countryCellRenderer',
                    // cellHeight: 20,
                    buttons: ['reset'],
                    // suppressSelectAll: true
                },
                // floatingFilterComponent: 'countryFloatingFilterComponent',
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-up"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-down"/>'
                }
            }
        ]
    },
    {
        // column group 'Game of Choice'
        headerName: 'Game of Choice',
        children: [
            {
                headerName: "Game Name", field: "game.name", width: 180, editable: true, filter: 'agMultiColumnFilter',
                tooltipField: 'game.name',
                // wrapText: true,
                // autoHeight: true,
                cellClass: () => 'alphabet',
                filterParams: {
                    filters: [
                        {
                            filter: 'agTextColumnFilter',
                            display: 'subMenu'
                        },
                        {
                            filter: 'agSetColumnFilter',
                            filterParams: {
                                buttons: ['reset'],
                            }
                        }
                    ]
                },
                enableRowGroup: true,
                enablePivot: true,
                // pinned: 'right',
                // rowGroupIndex: 1,
                icons: {
                    sortAscending: '<i class="fa fa-sort-alpha-up"/>',
                    sortDescending: '<i class="fa fa-sort-alpha-down"/>'
                }
            },
            {
                headerName: "Bought", field: "game.bought", filter: 'agSetColumnFilter', editable: true, width: 150,
                // pinned: 'right',
                // rowGroupIndex: 2,
                // pivotIndex: 1,
                enableRowGroup: true,
                enablePivot: true,
                cellClass: 'booleanType',
                cellRenderer: 'booleanCellRenderer', cellStyle: {"textAlign": "center"}, comparator: booleanComparator,
                // floatCell: true,
                filterParams: {
                    cellRenderer: 'booleanFilterCellRenderer',
                    buttons: ['reset'],
                }
            }
        ]
    },
    {
        // column group 'Performance'
        headerName: 'Performance',
        groupId: 'performance',
        children: [
            {
                headerName: "Bank Balance", field: "bankBalance", width: 180, editable: true,
                filter: 'winningsFilter',
                valueFormatter: currencyFormatter,
                type: 'numericColumn',
                cellClassRules: {
                    'currencyCell': 'typeof x == "number"'
                },
                enableValue: true,
                // colId: 'sf',
                // valueGetter: '55',
                // aggFunc: 'sum',
                icons: {
                    sortAscending: '<i class="fa fa-sort-amount-up"/>',
                    sortDescending: '<i class="fa fa-sort-amount-down"/>'
                }
            },
            {
                colId: 'extraInfo1',
                headerName: "Extra Info 1", columnGroupShow: 'open', width: 150, editable: false, filter: false,
                sortable: false, suppressMenu: true, cellStyle: {"text-align": "right"},
                cellRenderer: () => 'Abra...'
            },
            {
                colId: 'extraInfo2',
                headerName: "Extra Info 2", columnGroupShow: 'open', width: 150, editable: false, filter: false,
                sortable: false, suppressMenu: true, cellStyle: {"text-align": "left"},
                cellRenderer: () => '...cadabra!'
            }
        ]
    },
    {
        headerName: "Rating", field: "rating", width: 120, editable: true,
        cellRenderer: 'ratingRenderer',
        cellClass: 'vAlign',
        // floatCell: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        chartDataType: 'category',
        filterParams: {cellRenderer: 'ratingFilterRenderer'}
    },
    {
        headerName: "Total Winnings", field: "totalWinnings", filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        editable: true, valueParser: numberParser, width: 200,
        // aggFunc: 'sum',
        enableValue: true,
        cellClassRules: {
            'currencyCell': 'typeof x == "number"'
        },
        valueFormatter: currencyFormatter, cellStyle: currencyCssFunc,
        icons: {
            sortAscending: '<i class="fa fa-sort-amount-up"/>',
            sortDescending: '<i class="fa fa-sort-amount-down"/>'
        }
    }
];

function createDataSizeValue(rows, cols) {
    return `${rows / 1000}x${cols}`;
}

const Example = () => {
    const gridRef = useRef(null);
    const loadInstance = useRef(0);
    const [gridTheme, setGridTheme] = useState(() => {
        if(IS_SSR) {
            return 'ag-theme-alpine';
        }

        const params = new URLSearchParams(window.location.search);
        return params.get('theme') || 'ag-theme-alpine';
    });
    const [bodyClass, setBodyClass] = useState('');
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
    const [base64Flags, setBase64Flags] = useState();
    const [defaultCols, setDefaultCols] = useState();
    const [isSmall, setIsSmall] = useState(false);
    const [defaultColCount, setDefaultColCount] = useState();
    const [columnDefs, setColumnDefs] = useState();
    const [rowData, setRowData] = useState();
    const [message, setMessage] = useState();
    const [messageStyle, setMessageStyle] = useState({display: 'inline'});
    const [rowCols, setRowCols] = useState([]);
    const [dataSize, setDataSize] = useState();

    const modules = useMemo(() => [
        ClientSideRowModelModule,
        CsvExportModule,
        ClipboardModule,
        ColumnsToolPanelModule,
        ExcelExportModule,
        FiltersToolPanelModule,
        GridChartsModule,
        MasterDetailModule,
        MenuModule,
        MultiFilterModule,
        RangeSelectionModule,
        RichSelectModule,
        RowGroupingModule,
        SetFilterModule,
        SideBarModule,
        StatusBarModule,
        SparklinesModule
    ], []);

    const defaultExportParams = useMemo(() => ({
        headerRowHeight: 40,
        rowHeight: 30,
        fontSize: 14,
        addImageToCell: (rowIndex, column, value) => {
            if (column.colId === 'country') {
                return {
                    image: {
                        id: value,
                        base64: base64Flags[COUNTRY_CODES[value]],
                        imageType: 'png',
                        width: 20,
                        height: 12,
                        position: {
                            offsetX: 17,
                            offsetY: 14
                        }
                    },
                    value: value
                }
            }
        }
    }), [base64Flags]);

    const selectionChanged = (event) => {
        // console.log('Callback selectionChanged: selection count = ' + gridOptions.api.getSelectedNodes().length);
    }

    const rowSelected = (event) => {
        // the number of rows selected could be huge, if the user is grouping and selects a group, so
        // to stop the console from clogging up, we only print if in the first 10 (by chance we know
        // the node id's are assigned from 0 upwards)
        if (event.node.id < 10) {
            const valueToPrint = event.node.group ? `group (${event.node.key})` : event.node.data.name;
            console.log("Callback rowSelected: " + valueToPrint + " - " + event.node.isSelected());
        }
    }

    const getContextMenuItems = (params) => {
        const result = params.defaultItems ? params.defaultItems.splice(0) : [];
        result.push(
            {
                name: 'Custom Menu Item',
                icon: `<img src="../images/lab.svg" style="width: 14px; height: 14px;"/>`,
                //shortcut: 'Alt + M',
                action: () => {
                    const message = `You clicked a custom menu item on cell ${params.value ? params.value : '<empty>'}`;
                    IS_SSR ? console.log(message) : window.alert(message);
                }
            }
        );

        return result;
    }

    const gridOptions = useMemo(() => ({
        statusBar: {
            statusPanels: [
                {statusPanel: 'agTotalAndFilteredRowCountComponent', key: 'totalAndFilter', align: 'left'},
                {statusPanel: 'agSelectedRowCountComponent', align: 'left'},
                {statusPanel: 'agAggregationComponent', align: 'right'}
            ]
        },
        components: {
            personFilter: PersonFilter,
            personFloatingFilterComponent: PersonFloatingFilterComponent,
            countryCellRenderer: countryCellRenderer,
            countryFloatingFilterComponent: CountryFloatingFilterComponent,
            booleanCellRenderer: booleanCellRenderer,
            booleanFilterCellRenderer: booleanFilterCellRenderer,
            winningsFilter: WinningsFilter,
            ratingRenderer: ratingRenderer,
            ratingFilterRenderer: ratingFilterRenderer
        },
        defaultColDef: {
            minWidth: 50,
            sortable: true,
            filter: true,
            floatingFilter: !isSmall,
            resizable: true
        },
        enableCellChangeFlash: true,
        rowDragManaged: true,
        // suppressMoveWhenRowDragging: true,
        rowDragMultiRow: true,
        popupParent: IS_SSR ? null : document.querySelector('#example-wrapper'),
        // enableBrowserTooltips: true,
        // tooltipShowDelay: 200,
        // tooltipHideDelay: 2000,
        // ensureDomOrder: true,
        // enableCellTextSelection: true,
        // postProcessPopup: function(params) {
        //     console.log(params);
        // },
        // need to be careful here inside the normal demo, as names are not unique if big data sets
        // getRowId: function(params) {
        //     return params.data.name;
        // },
        // suppressAsyncEvents: true,
        // suppressAggAtRootLevel: true,
        // suppressAggFilteredOnly: true,
        // suppressScrollWhenPopupsAreOpen: true,
        // debug: true,
        // editType: 'fullRow',
        // debug: true,
        // suppressMultiRangeSelection: true,
        rowGroupPanelShow: isSmall ? undefined : 'always', // on of ['always','onlyWhenGrouping']
        suppressMenuHide: isSmall,
        pivotPanelShow: 'always', // on of ['always','onlyWhenPivoting']
        // suppressExpandablePivotGroups: true,
        // pivotColumnGroupTotals: 'before',
        // pivotRowTotals: 'before',
        // suppressRowTransform: true,
        // minColWidth: 50,
        // maxColWidth: 300,
        // rowBuffer: 10,
        // columnDefs: [],
        // singleClickEdit: true,
        // suppressClickEdit: true,
        // suppressClipboardApi: true,
        enterMovesDownAfterEdit: true,
        enterMovesDown: true,
        // domLayout: 'autoHeight',
        // domLayout: 'forPrint',
        // groupUseEntireRow: true, //one of [true, false]
        // groupDefaultExpanded: 9999, //one of [true, false], or an integer if greater than 1
        // headerHeight: 100, // set to an integer, default is 25, or 50 if grouping columns
        // groupSuppressAutoColumn: true,
        // pivotSuppressAutoColumn: true,
        // groupSuppressBlankHeader: true,
        // suppressMovingCss: true,
        // suppressMovableColumns: true,
        // groupIncludeFooter: true,
        // groupIncludeTotalFooter: true,
        // suppressHorizontalScroll: true,
        // alwaysShowHorizontalScroll: true,
        // alwaysShowVerticalScroll: true,
        // debounceVerticalScrollbar: true,
        suppressColumnMoveAnimation: suppressColumnMoveAnimation(),
        // suppressRowHoverHighlight: true,
        // suppressTouch: true,
        // suppressDragLeaveHidesColumns: true,
        // suppressMakeColumnVisibleAfterUnGroup: true,
        // unSortIcon: true,
        enableRtl: IS_SSR ? false : /[?&]rtl=true/.test(window.location.search),
        enableCharts: true,
        // multiSortKey: 'ctrl',
        animateRows: true,

        enableRangeSelection: true,
        // enableRangeHandle: true,
        enableFillHandle: true,
        undoRedoCellEditing: true,
        undoRedoCellEditingLimit: 50,

        suppressClearOnFillReduction: false,

        rowSelection: 'multiple', // one of ['single','multiple'], leave blank for no selection
        // suppressRowDeselection: true,
        quickFilterText: null,
        groupSelectsChildren: true, // one of [true, false]
        // groupAggFiltering: true,
        // pagination: true,
        // paginateChildRows: true,
        // paginationPageSize: 10,
        // groupSelectsFiltered: true,
        // groupRowsSticky: true,
        suppressRowClickSelection: true, // if true, clicking rows doesn't select (useful for checkbox selection)
        // suppressColumnVirtualisation: true,
        // suppressContextMenu: true,
        // preventDefaultOnContextMenu: true,
        // suppressFieldDotNotation: true,
        autoGroupColumnDef: groupColumn,
        // suppressActionCtrlC: true,
        // suppressActionCtrlV: true,
        // suppressActionCtrlD: true,
        // suppressActionCtrlA: true,
        // suppressCellFocus: true,
        // suppressMultiSort: true,
        // alwaysMultiSort: true,
        // scrollbarWidth: 20,
        sideBar: {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: {
                        syncLayoutWithGrid: true
                    }
                },
                {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                    toolPanelParams: {
                        syncLayoutWithGrid: true
                    }
                }
            ],
            position: 'right',
            defaultToolPanel: 'columns',
            hiddenByDefault: isSmall
        },

        // suppressBrowserResizeObserver: true,
        // showToolPanel: true,//window.innerWidth > 1000,
        // toolPanelSuppressColumnFilter: true,
        // toolPanelSuppressColumnSelectAll: true,
        // toolPanelSuppressColumnExpandAll: true,
        // autoSizePadding: 20,
        // toolPanelSuppressGroups: true,
        // toolPanelSuppressValues: true,
        // groupSuppressAutoColumn: true,
        // contractColumnSelection: true,
        // groupAggFields: ['bankBalance','totalWinnings'],
        // groupMultiAutoColumn: true,
        // groupHideOpenParents: true,
        // suppressMenuFilterPanel: true,
        // clipboardDelimiter: ',',
        // suppressLastEmptyLineOnPaste: true,
        // suppressMenuMainPanel: true,
        // suppressMenuColumnPanel: true,
        // forPrint: true,
        // rowClass: function(params) { return (params.data.country === 'Ireland') ? "theClass" : null; },
        onRowSelected: rowSelected, //callback when row selected
        onSelectionChanged: selectionChanged, //callback when selection changed,
        aggFuncs: {
            'zero': () => 0
        },
        getBusinessKeyForNode: node => node.data ? node.data.name : '',
        initialGroupOrderComparator: ({nodeA, nodeB}) => {
            if (nodeA.key < nodeB.key) {
                return -1;
            }
            if (nodeA.key > nodeB.key) {
                return 1;
            }

            return 0;

        },
        processCellFromClipboard: params => {
            const colIdUpperCase = params.column.getId().toUpperCase();
            const monthsUpperCase = months.map(month => month.toUpperCase());
            const isMonth = monthsUpperCase.indexOf(colIdUpperCase) >= 0;

            if (isMonth) {
                return sharedNumberParser(params.value);
            }

            return params.value;
        },
        // rowHeight: 100,
        // suppressTabbing: true,
        // columnHoverHighlight: true,
        // suppressAnimationFrame: true,
        // pinnedTopRowData: [
        //     {name: 'Mr Pinned Top 1', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        //     {name: 'Mr Pinned Top 2', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        //     {name: 'Mr Pinned Top 3', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        // ],
        // pinnedBottomRowData: [
        //     {name: 'Mr Pinned Bottom 1', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        //     {name: 'Mr Pinned Bottom 2', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        //     {name: 'Mr Pinned Bottom 3', language: 'English', country: 'Ireland', continent:"Europe", game:{name:"Hare and Hounds",bought:"true"}, totalWinnings: 342424, bankBalance:75700.9,rating:2,jan:20478.54,feb:2253.06,mar:39308.65,apr:98710.13,may:96186.55,jun:91925.91,jul:1149.47,aug:32493.69,sep:19279.44,oct:21624.14,nov:71239.81,dec:80031.35},
        // ],
        // callback when row clicked
        // stopEditingWhenCellsLoseFocus: true,
        // allowShowChangeAfterFilter: true,
        processPivotResultColDef: (def) => {
            def.filter = 'agNumberColumnFilter';
            def.floatingFilter = true;
        },
        onRowClicked: params => {
            // console.log("Callback onRowClicked: " + (params.data?params.data.name:null) + " - " + params.event);
        },
        // onSortChanged: function (params) {
        //     console.log("Callback onSortChanged");
        // },
        onRowDoubleClicked: params => {
            // console.log("Callback onRowDoubleClicked: " + params.data.name + " - " + params.event);
        },
        onGridSizeChanged: params => {
            // console.log("Callback onGridSizeChanged: ", params);
        },
        // callback when cell clicked
        onCellClicked: params => {
            // console.log("Callback onCellClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
        },
        onColumnVisible: event => {
            // console.log("Callback onColumnVisible:", event);
        },
        onColumnResized: event => {
            // leave this out, as it slows things down when resizing
            // console.log("Callback onColumnResized:", event);
        },
        onCellValueChanged: params => {
            // taking this out, as clipboard paste operation can result in this getting called
            // lots and lots of times (especially if user does ctrl+a to copy everything, then paste)
            // console.log("Callback onCellValueChanged:", params);
        },
        onRowDataChanged: params => {
            // console.log('Callback onRowDataChanged: ');
        },
        // callback when cell double clicked
        onCellDoubleClicked: params => {
            // console.log("Callback onCellDoubleClicked: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
        },
        // callback when cell right clicked
        onCellContextMenu: params => {
            // console.log("Callback onCellContextMenu: " + params.value + " - " + params.colDef.field + ' - ' + params.event);
        },
        onCellFocused: params => {
            // console.log('Callback onCellFocused: ' + params.rowIndex + " - " + params.colIndex);
        },
        onPasteStart: params => {
            // console.log('Callback onPasteStart:', params);
        },
        onPasteEnd: params => {
            // console.log('Callback onPasteEnd:', params);
        },
        onGridReady: event => {
            // console.log('Callback onGridReady: api = ' + event.api);

            if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
                event.api.closeToolPanel();
            }
        },
        onRowGroupOpened: event => {
            // console.log('Callback onRowGroupOpened: node = ' + event.node.key + ', ' + event.expanded);
        },
        onRangeSelectionChanged: event => {
            // console.log('Callback onRangeSelectionChanged: finished = ' + event.finished);
        },
        chartThemeOverrides: {
            polar: {
                series: {
                    pie: {
                        label: {
                            enabled: false
                        },
                        tooltip: {
                            renderer: params => ({
                                content: '$' + formatThousands(Math.round(params.datum[params.angleKey]))
                            })
                        }
                    }
                }
            },
            cartesian: {
                axes: {
                    number: {
                        label: {
                            formatter: axisLabelFormatter
                        }
                    },
                },
                series: {
                    column: {
                        tooltip: {
                            renderer: params => ({
                                content: '$' + formatThousands(Math.round(params.datum[params.yKey]))
                            })
                        }
                    },
                    bar: {
                        tooltip: {
                            renderer: params => ({
                                content: '$' + formatThousands(Math.round(params.datum[params.yKey]))
                            })
                        }
                    },
                    line: {
                        tooltip: {
                            renderer: params => ({
                                content: '$' + formatThousands(Math.round(params.datum[params.yKey]))
                            })
                        }
                    },
                    area: {
                        tooltip: {
                            renderer: params => ({
                                content: '$' + formatThousands(Math.round(params.datum[params.yKey]))
                            })
                        }
                    },
                    scatter: {
                        tooltip: {
                            renderer: params => {
                                const label = params.labelKey ? params.datum[params.labelKey] + '<br>' : '';
                                const xValue = params.xName + ': $' + formatThousands(params.datum[params.xKey]);
                                const yValue = params.yName + ': $' + formatThousands(params.datum[params.yKey]);
                                let size = '';
                                if (params.sizeKey) {
                                    size = '<br>' + params.sizeName + ': $' + formatThousands(params.datum[params.sizeKey]);
                                }
                                return {
                                    content: label + xValue + '<br>' + yValue + size
                                };
                            }
                        }
                    },
                    histogram: {
                        tooltip: {
                            renderer: params => ({
                                title: (params.xName || params.xKey) + ': $' + formatThousands(params.datum.domain[0]) + ' - $' + formatThousands(params.datum.domain[1]),
                                // With a yKey, the value is the total of the yKey value for the population of the bin.
                                // Without a yKey, the value is a count of the population of the bin.
                                content: params.yKey ? formatThousands(Math.round(params.datum.total)) : params.datum.frequency
                            })
                        }
                    }
                }
            }
        },
        getContextMenuItems: getContextMenuItems,
        excelStyles: [
            {
                id: 'vAlign',
                alignment: {
                    vertical: 'Center'
                }
            },
            {
                id: 'alphabet',
                alignment: {
                    vertical: 'Center'
                }
            },
            {
                id: 'good-score',
                alignment: {
                    horizontal: 'Center',
                    vertical: 'Center'
                },
                interior: {
                    color: "#C6EFCE", pattern: 'Solid'
                },
                numberFormat: {
                    format: '[$$-409]#,##0'
                }
            },
            {
                id: 'bad-score',
                alignment: {
                    horizontal: 'Center',
                    vertical: 'Center'
                },
                interior: {
                    color: "#FFC7CE", pattern: 'Solid'
                },
                numberFormat: {
                    format: '[$$-409]#,##0'
                }
            },
            {
                id: 'header',
                font: {
                    color: "#44546A",
                    size: 16
                },
                interior: {
                    color: '#F2F2F2',
                    pattern: 'Solid'
                },
                alignment: {
                    horizontal: 'Center',
                    vertical: 'Center'
                },
                borders: {
                    borderTop: {
                        lineStyle: 'Continuous',
                        weight: 0,
                        color: '#8EA9DB'
                    },
                    borderRight: {
                        lineStyle: 'Continuous',
                        weight: 0,
                        color: '#8EA9DB'
                    },
                    borderBottom: {
                        lineStyle: 'Continuous',
                        weight: 0,
                        color: '#8EA9DB'
                    },
                    borderLeft: {
                        lineStyle: 'Continuous',
                        weight: 0,
                        color: '#8EA9DB'
                    }
                }
            },
            {
                id: 'currencyCell',
                alignment: {
                    horizontal: 'Center',
                    vertical: 'Center'
                },
                numberFormat: {
                    format: '[$$-409]#,##0'
                }
            },
            {
                id: 'booleanType',
                dataType: 'boolean',
                alignment: {
                    vertical: 'Center'
                }
            },
            {
                id: 'countryCell',
                alignment: {
                    indent: 4
                }
            }
        ]
    }), [isSmall]);

    const createRowItem = (row, colCount) => {
        const rowItem = {};

        //create data for the known columns
        const countriesToPickFrom = Math.floor(countries.length * ((row % 3 + 1) / 3));
        const countryData = countries[(row * 19) % countriesToPickFrom];
        rowItem.country = countryData.country;
        rowItem.continent = countryData.continent;
        rowItem.language = countryData.language;

        const firstName = firstNames[row % firstNames.length];
        const lastName = lastNames[row % lastNames.length];
        rowItem.name = firstName + " " + lastName;

        rowItem.game = {
            name: games[Math.floor(row * 13 / 17 * 19) % games.length],
            bought: booleanValues[row % booleanValues.length]
        };

        rowItem.bankBalance = (Math.round(pseudoRandom() * 100000)) - 3000;
        rowItem.rating = (Math.round(pseudoRandom() * 5));

        let totalWinnings = 0;
        months.forEach(month => {
            const value = (Math.round(pseudoRandom() * 100000)) - 20;
            rowItem[month.toLocaleLowerCase()] = value;
            totalWinnings += value;
        });
        rowItem.totalWinnings = totalWinnings;

        //create dummy data for the additional columns
        for (let col = defaultCols.length; col < colCount; col++) {
            var value;
            const randomBit = pseudoRandom().toString().substring(2, 5);
            value = colNames[col % colNames.length] + "-" + randomBit + " - (" + (row + 1) + "," + col + ")";
            rowItem["col" + col] = value;
        }

        return rowItem;
    }

    const createData = () => {
        loadInstance.current = loadInstance.current + 1;
        const loadInstanceCopy = loadInstance.current;

        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.showLoadingOverlay();
        }

        const colDefs = createCols();

        const rowCount = getRowCount();
        const colCount = getColCount();

        let row = 0;
        const data = [];

        setMessageStyle({display: 'inline'})
        setMessage(` Generating rows`);

        const loopCount = rowCount > 10000 ? 10000 : 1000;

        const intervalId = setInterval(() => {
            if (loadInstanceCopy !== loadInstance.current) {
                clearInterval(intervalId);
                return;
            }

            for (let i = 0; i < loopCount; i++) {
                if (row < rowCount) {
                    const rowItem = createRowItem(row, colCount);
                    data.push(rowItem);
                    row++;
                } else {
                    break;
                }
            }

            setMessage(` Generating rows ${row}`);

            if (row >= rowCount) {
                setMessageStyle({display: 'none'});
                setMessage('');
                clearInterval(intervalId);
                setColumnDefs(colDefs);
                setRowData(data)
            }
        }, 0);
    }

    useEffect(() => {
        const small = IS_SSR ? false : document.documentElement.clientHeight <= 415 || document.documentElement.clientWidth < 768;
        setIsSmall(small);

        //put in the month cols
        const monthGroup = {
            headerName: 'Monthly Breakdown',
            children: []
        };

        months.forEach(month => {
            monthGroup.children.push({
                headerName: month,
                field: month.toLocaleLowerCase(),
                width: 150,
                filter: 'agNumberColumnFilter',
                editable: true,
                type: 'numericColumn',
                enableValue: true,
                cellClassRules: {
                    'good-score': 'typeof x === "number" && x > 50000',
                    'bad-score': 'typeof x === "number" && x < 10000',
                    'currencyCell': 'typeof x === "number" && x >= 10000 && x <= 50000'
                },
                valueParser: numberParser,
                valueFormatter: currencyFormatter,
                filterParams: {
                    buttons: ['reset'],
                    inRangeInclusive: true
                }
            });
        })

        let defaultCols;
        let defaultColCount;
        if (small) {
            defaultCols = mobileDefaultCols;
            defaultCols = defaultCols.concat(monthGroup.children);
            defaultColCount = defaultCols.length;
        } else {
            defaultCols = desktopDefaultCols;
            defaultCols.push(monthGroup);
            defaultColCount = 22;
        }

        setDefaultCols(defaultCols);
        setDefaultColCount(defaultColCount);

        const newRowsCols = [
            [100, defaultColCount],
            [1000, defaultColCount]
        ];

        if (!small) {
            newRowsCols.push(
                [10000, 100],
                [50000, defaultColCount],
                [100000, defaultColCount]
            );
        }

        setDataSize(createDataSizeValue(newRowsCols[0][0], newRowsCols[0][1]))
        setRowCols(newRowsCols);
    }, [])

    useEffect(() => {
        const flags = {};
        const promiseArray = countries.map(country => {
            const countryCode = COUNTRY_CODES[country.country];

            return fetch(`https://flagcdn.com/w20/${countryCode}.png`)
                .then(response => response.blob())
                .then(blob => new Promise(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        flags[countryCode] = reader.result;
                        res(reader.result);
                    }
                    reader.readAsDataURL(blob);
                }))
        });

        Promise.all(promiseArray).then(() => setBase64Flags(flags))
    }, []);

    const getColCount = () => {
        return parseInt(dataSize.split('x')[1], 10);
    }

    const getRowCount = () => {
        const rows = parseFloat(dataSize.split('x')[0]);

        return rows * 1000;
    }

    const createCols = () => {
        const colCount = getColCount();
        // start with a copy of the default cols
        const columns = defaultCols.slice(0, colCount);

        for (let col = defaultColCount; col < colCount; col++) {
            const colName = colNames[col % colNames.length];
            const colDef = {headerName: colName, field: "col" + col, width: 200, editable: true};
            columns.push(colDef);
        }

        return columns;
    }

    useEffect(() => {
        if (dataSize) {
            createData();
        }
    }, [dataSize]);

    useEffect(() => {
        const isDark = gridTheme.indexOf('dark') >= 0;

        if (isDark) {
            setBodyClass(styles['dark']);
            gridOptions.chartThemes = ['ag-default-dark', 'ag-material-dark', 'ag-pastel-dark', 'ag-vivid-dark', 'ag-solar-dark'];
        } else {
            setBodyClass('');
            gridOptions.chartThemes = null;
        }
    }, [gridTheme]);

    function onDataSizeChanged(event) {
        setDataSize(event.target.value)
    }

    function onThemeChanged(event) {
        const newTheme = event.target.value || 'ag-theme-none';
        setGridTheme(newTheme);

        if(!IS_SSR) {
            let url = window.location.href;
            if (url.indexOf('?theme=') !== -1) {
                url = url.replace(/\?theme=[\w-]+/, `?theme=${newTheme}`);
            } else {
                const sep = url.indexOf('?') === -1 ? '?' : '&';
                url += `${sep}theme=${newTheme}`;
            }
            history.replaceState({}, '', url);
        }
    }

    function toggleOptionsCollapsed() {
        setToolbarCollapsed(!toolbarCollapsed)
    }

    function onFilterChanged(event) {
        gridRef.current.api.setQuickFilter(event.target.value);
    }

    return (
        <>
            <Helmet>
                <style type="text/css">{`
                .collapsed {
                            height: 0;
                }
            `}</style>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"/>
                {helmet.map(entry => entry)}
            </Helmet>
            <div className={`${styles['example-wrapper']} ${bodyClass}`}>
                <div className={`${styles['example-toolbar']} ${toolbarCollapsed ? styles['collapsed'] : ''}`}>
                    <div className={styles['options-container']}>
                        <div>
                            <label htmlFor="data-size">Data Size:</label>
                            <select id="data-size" alt="Grid Theme Dropdown" onChange={onDataSizeChanged} value={dataSize}>
                                {rowCols.map(rowCol => {
                                    const rows = rowCol[0];
                                    const cols = rowCol[1];

                                    const value = createDataSizeValue(rows, cols);
                                    const text = `${rows} Rows, ${cols} Cols`;
                                    return <option key={value} value={value}>{text}</option>
                                })}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="grid-theme">Theme:</label>
                            <select id="grid-theme" defaultValue="ag-theme-alpine" onChange={onThemeChanged} value={gridTheme}>
                                <option value="ag-theme-none">-none-</option>
                                <option value="ag-theme-alpine">Alpine</option>
                                <option value="ag-theme-alpine-dark">Alpine Dark</option>
                                <option value="ag-theme-balham">Balham</option>
                                <option value="ag-theme-balham-dark">Balham Dark</option>
                                <option value="ag-theme-material">Material</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="global-filter">Filter:</label>
                            <input
                                placeholder="Filter any column..." type="text"
                                className={styles['hide-when-small']}
                                onInput={onFilterChanged}
                                id="global-filter"
                                style={{flex: 1}}
                            />
                        </div>
                        <div className={styles['video-tour']}>
                            <a href="https://youtu.be/29ja0liMuv4" target="_blank" rel="noreferrer">Take a video tour</a>
                        </div>
                    </div>
                </div>
                <span style={{marginLeft: 10, ...messageStyle}}>
                                {message}<i className="fa fa-spinner fa-pulse fa-fw margin-bottom"/>
                </span>
                <div className={styles['options-expander']}>
                    <span id="messageText"/>
                    <div id="options-toggle" onClick={toggleOptionsCollapsed}><span>&nbsp;</span>OPTIONS</div>
                    <span>&nbsp;</span>
                </div>
                <section className={styles['example-wrapper__grid-wrapper']} style={{padding: "1rem", paddingTop: 0}}>
                    <div id="myGrid" style={{flex: "1 1 auto", overflow: "hidden"}} className={gridTheme}>
                        <AgGridReactMemo
                            key={gridTheme}
                            ref={gridRef}
                            modules={modules}
                            gridOptions={gridOptions}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultCsvExportParams={defaultExportParams}
                            defaultExcelExportParams={defaultExportParams}
                        />
                    </div>
                </section>
            </div>
        </>
    )
}

export default Example;
