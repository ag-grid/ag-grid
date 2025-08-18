import { useDarkmode } from '@utils/hooks/useDarkmode';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import classnames from 'classnames';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
    CellSelectionOptions,
    CellStyleFunc,
    ColDef,
    ColGroupDef,
    CsvExportParams,
    ExcelExportParams,
    ExcelStyle,
    GridApi,
    GridOptions,
    GridReadyEvent,
    IRowNode,
    InitialGroupOrderComparatorParams,
    RowSelectionOptions,
    Theme,
} from 'ag-grid-community';
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    CsvExportModule,
    themeAlpine,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    IntegratedChartsModule,
    MasterDetailModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RichSelectModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    RowNumbersModule,
    SetFilterModule,
    SideBarModule,
    SparklinesModule,
    StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import styles from './Example.module.scss';
import { CountryCellRenderer, booleanCellRenderer, ratingRenderer } from './Renderers';
import { Toolbar } from './Toolbar';
import {
    COUNTRY_CODES,
    COUNTRY_NAMES,
    LANGUAGES,
    type RowItem,
    colNames,
    countries,
    createRowItem,
    games,
    months,
} from './consts';
import {
    axisLabelFormatter,
    createDataSizeValue,
    currencyFormatter,
    formatThousands,
    suppressColumnMoveAnimation,
} from './utils';
import type { SideBarDef } from '../../../../../packages/ag-grid-community/src/main';

const IS_SSR = typeof window === 'undefined';

const AgGridReactMemo = memo(AgGridReact);

const groupColumn: ColDef = {
    headerName: 'Group',
    width: 250,
    field: 'name',
};
const defaultChartThemes = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
const defaultChartThemesDark = defaultChartThemes.map((theme) => theme + '-dark');
const excelStyles: ExcelStyle[] = [
    {
        id: 'v-align',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'alphabet',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'good-score',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        interior: {
            color: '#C6EFCE',
            pattern: 'Solid',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'bad-score',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        interior: {
            color: '#FFC7CE',
            pattern: 'Solid',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'header',
        font: {
            color: '#44546A',
            size: 16,
        },
        interior: {
            color: '#F2F2F2',
            pattern: 'Solid',
        },
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        borders: {
            borderTop: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderRight: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderBottom: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
            borderLeft: {
                lineStyle: 'Continuous',
                weight: 0,
                color: '#8EA9DB',
            },
        },
    },
    {
        id: 'currency-cell',
        alignment: {
            horizontal: 'Center',
            vertical: 'Center',
        },
        numberFormat: {
            format: '[$$-409]#,##0',
        },
    },
    {
        id: 'boolean-type',
        dataType: 'Boolean',
        alignment: {
            vertical: 'Center',
        },
    },
    {
        id: 'country-cell',
        alignment: {
            indent: 4,
        },
    },
];
const currencyCssFunc: CellStyleFunc = (params) => {
    if (params.value != null && params.value < 0) {
        return { color: 'red', fontWeight: 'bold' };
    }
    return undefined;
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
        cellRenderer: 'countryCellRenderer',
        cellClass: 'v-align',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: 'countryCellRenderer',
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
                cellRenderer: 'countryCellRenderer',
                cellClass: ['country-cell', 'v-align'],
                enableRowGroup: true,
                enablePivot: true,
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    cellRenderer: 'countryCellRenderer',
                    values: COUNTRY_NAMES,
                },
                filter: 'agSetColumnFilter',
                filterParams: {
                    cellRenderer: 'countryCellRenderer',
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
                cellRenderer: 'booleanCellRenderer',
                cellStyle: { textAlign: 'center' },
                filterParams: {
                    cellRenderer: 'booleanCellRenderer',
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
                cellDataType: 'currency',
                filter: 'agNumberColumnFilter',
            },
        ],
    },
    {
        field: 'rating',
        width: 120,
        cellRenderer: 'ratingRenderer',
        cellClass: 'v-align',
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        chartDataType: 'category',
        filterParams: { cellRenderer: 'ratingRenderer', cellRendererParams: { isFilterRenderer: true } },
    },
    {
        field: 'totalWinnings',
        filter: 'agNumberColumnFilter',
        width: 200,
        enableValue: true,
        cellClassRules: {
            'currency-cell': 'typeof x == "number"',
        },
        cellDataType: 'currency',
        cellStyle: currencyCssFunc,
    },
];

const pieSeriesThemeOverrides = {
    series: {
        calloutLabel: {
            enabled: false,
        },
    },
};

const hierarchicalSeriesThemeOverrides = {
    gradientLegend: {
        scale: {
            label: {
                formatter: ({ value }: { value: any }) => {
                    const num = Number(value);
                    return isNaN(num) ? value : '$' + formatThousands(num);
                },
            },
        },
    },
};

const chartThemeOverrides = {
    common: {
        axes: {
            number: {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
            'angle-number': {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
            'radius-number': {
                label: {
                    formatter: axisLabelFormatter,
                },
            },
        },
    },
    pie: pieSeriesThemeOverrides,
    donut: pieSeriesThemeOverrides,
    treemap: hierarchicalSeriesThemeOverrides,
    sunburst: hierarchicalSeriesThemeOverrides,
};

const themeMap: Record<string, Theme> = {
    alpine: themeAlpine,
    balham: themeBalham,
    material: themeMaterial,
    quartz: themeQuartz,
};

const modules = [
    AllCommunityModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    NewFiltersToolPanelModule,
    MasterDetailModule,
    ColumnMenuModule,
    ContextMenuModule,
    MultiFilterModule,
    CellSelectionModule,
    RichSelectModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SetFilterModule,
    SideBarModule,
    StatusBarModule,
    PivotModule,
    RowNumbersModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    SparklinesModule.with(AgChartsEnterpriseModule),
];
const components = {
    countryCellRenderer: CountryCellRenderer,
    booleanCellRenderer: booleanCellRenderer,
    ratingRenderer: ratingRenderer,
};
const statusBar: GridOptions['statusBar'] = {
    statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent', key: 'totalAndFilter', align: 'left' },
        { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
        { statusPanel: 'agAggregationComponent', align: 'right' },
    ],
};
const cellSelection: CellSelectionOptions = {
    enableHeaderHighlight: true,
    handle: {
        mode: 'fill',
    },
};
const rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
};
const suppressColMoveAnimation = suppressColumnMoveAnimation();

const columnTypes: GridOptions['columnTypes'] = {
    currencyType: {
        useValueFormatterForExport: false,
        valueFormatter: currencyFormatter,
    },
};

const dataTypeDefinitions: GridOptions['dataTypeDefinitions'] = {
    currency: {
        extendsDataType: 'number',
        baseDataType: 'number',

        valueFormatter: currencyFormatter,
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

const getBusinessKeyForNode = (node: IRowNode) => (node.data ? node.data.name : '');
const initialGroupOrderComparator = ({ nodeA, nodeB }: InitialGroupOrderComparatorParams) => {
    const aKey = nodeA.key || '';
    const bKey = nodeB.key || '';
    if (aKey < bKey) {
        return -1;
    }
    if (aKey > bKey) {
        return 1;
    }

    return 0;
};

const ExampleInner = ({ darkMode, theme, isSmall }: { darkMode: boolean; theme: string; isSmall: boolean }) => {
    const gridRef = useRef(null);
    const loadInstance = useRef(0);
    const [gridThemeStr, setGridThemeStr] = useState(theme);

    const gridTheme = themeMap[gridThemeStr] || themeQuartz;
    const chartThemes = darkMode ? defaultChartThemesDark : defaultChartThemes;

    const [base64Flags, setBase64Flags] = useState<Record<string, any>>();
    const [defaultCols, setDefaultCols] = useState<(ColDef | ColGroupDef)[]>();
    const [defaultColCount, setDefaultColCount] = useState<number>(0);
    const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>();
    const [rowData, setRowData] = useState<any[]>();
    const [message, setMessage] = useState<string>();
    const [showMessage, setShowMessage] = useState(false);
    const [rowCols, setRowCols] = useState<any[]>([]);
    const [dataSize, setDataSize] = useState<string>();
    const [initialLoad, setInitialLoad] = useState(true);

    const defaultExportParams = useMemo<ExcelExportParams | CsvExportParams>(
        () => ({
            headerRowHeight: 40,
            rowHeight: 30,
            fontSize: 14,
            addImageToCell: (rowIndex, column, value) => {
                if (column.getColId() === 'country' && base64Flags) {
                    return {
                        image: {
                            id: value,
                            base64: base64Flags[COUNTRY_CODES[value]],
                            imageType: 'png',
                            width: 20,
                            height: 12,
                            position: {
                                offsetX: 17,
                                offsetY: 14,
                            },
                        },
                        value: value,
                    };
                }
            },
        }),
        [base64Flags]
    );

    const enableRtl = IS_SSR ? false : /[?&]rtl=true/.test(window.location.search);

    const defaultColDef = useMemo<ColDef>(
        () => ({
            minWidth: 50,
            editable: true,
            filter: true,
            floatingFilter: !isSmall,
            enableCellChangeFlash: true,
        }),
        [isSmall]
    );
    const sideBar = useMemo<SideBarDef>(
        () => ({
            toolPanels: ['columns', 'filters-new'],
            position: 'right',
            defaultToolPanel: 'columns',
            hiddenByDefault: isSmall,
        }),
        [isSmall]
    );

    const onGridReady = useCallback((event: GridReadyEvent) => {
        if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
            event.api.closeToolPanel();
        }
    }, []);

    const createData = (dataSize: string) => {
        loadInstance.current = loadInstance.current + 1;
        const loadInstanceCopy = loadInstance.current;

        const colCount = parseInt(dataSize?.split('x')[1] ?? '0', 10);
        const rowCount = parseFloat(dataSize?.split('x')[0] ?? '0') * 1000;
        const colDefs = createCols(colCount);

        let row = 0;
        const data: any[] = [];

        // Don't show message on initial load as it causes a spike in CLS
        setShowMessage(!initialLoad);
        setMessage(` Generating rows`);

        const loopCount = rowCount > 10000 ? 10000 : 1000;

        const intervalId = setInterval(() => {
            if (loadInstanceCopy !== loadInstance.current) {
                clearInterval(intervalId);
                return;
            }

            for (let i = 0; i < loopCount; i++) {
                if (row < rowCount) {
                    const rowItem = createRowItem(row, colCount, defaultCols?.length ?? 0, defaultColCount);
                    data.push(rowItem);
                    row++;
                } else {
                    break;
                }
            }

            setMessage(` Generating rows ${row}`);

            if (row >= rowCount) {
                setShowMessage(false);
                setMessage('');
                clearInterval(intervalId);
                setColumnDefs(colDefs);
                setRowData(data);
            }
        }, 0);
    };

    const setCountryColumnPopupEditor = (theme: string, gridApi: GridApi) => {
        if (!columnDefs) {
            return;
        }
        const participantGroup = columnDefs.find((group) => group.headerName === 'Participant');
        if (!gridApi || !participantGroup) {
            return;
        }

        const countryColumn: ColDef = (participantGroup as ColGroupDef).children.find(
            (column) => (column as ColDef).field === 'country'
        )!;
        countryColumn.cellEditorPopup = theme.includes('material');

        setColumnDefs(columnDefs);
    };

    useEffect(() => {
        let defaultCols: ColDef[];
        let defaultColCount: number;

        //put in the month cols
        const monthGroup: ColGroupDef = {
            headerName: 'Monthly Breakdown',
            children: [],
        };

        months.forEach((month) => {
            const child: ColDef = {
                field: month.toLocaleLowerCase(),
                width: 150,
                enableValue: true,
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
            monthGroup.children.push(child);
        });

        if (isSmall) {
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
            [1000, defaultColCount],
        ];

        if (!isSmall) {
            newRowsCols.push([10000, 100], [50000, defaultColCount], [100000, defaultColCount]);
        }

        setDataSize(createDataSizeValue(newRowsCols[0][0], newRowsCols[0][1]));
        setRowCols(newRowsCols);
    }, [isSmall]);

    useEffect(() => {
        const flags: Record<string, any> = {};
        const promiseArray = countries.map((country) => {
            const countryCode = COUNTRY_CODES[country.country];

            return fetch(`https://flagcdn.com/w20/${countryCode}.png`)
                .then((response) => response.blob())
                .then(
                    (blob) =>
                        new Promise((res) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                flags[countryCode] = reader.result;
                                res(reader.result);
                            };
                            reader.readAsDataURL(blob);
                        })
                );
        });

        Promise.all(promiseArray).then(() => setBase64Flags(flags));
    }, []);

    const createCols = (colCount: number) => {
        // start with a copy of the default cols
        const columns = defaultCols?.slice(0, colCount) ?? [];

        for (let col = defaultColCount; col < colCount; col++) {
            const colName = colNames[col % colNames.length];
            const colDef = { headerName: colName, field: 'col' + col, width: 200, editable: true };
            columns.push(colDef);
        }

        return columns;
    };

    const createDataRef = useRef(createData);
    // Ensure we always use the latest createData function to avoid stale closures but without
    // triggering the createData function to be recreated on every render
    createDataRef.current = createData;

    useEffect(() => {
        if (dataSize) {
            createDataRef.current(dataSize);
            setInitialLoad(false);
        }
    }, [dataSize]);

    return (
        <>
            <div className={styles.exampleWrapper}>
                <Toolbar
                    gridRef={gridRef}
                    dataSize={dataSize}
                    setDataSize={setDataSize}
                    rowCols={rowCols}
                    gridTheme={gridThemeStr}
                    setGridTheme={setGridThemeStr}
                    setCountryColumnPopupEditor={setCountryColumnPopupEditor}
                />
                <span className={classnames({ [styles.messages]: true, [styles.show]: showMessage })}>
                    {message}
                    <i className="fa fa-spinner fa-pulse fa-fw margin-bottom" />
                </span>
                <section className={styles.gridWrapper}>
                    {gridTheme && (
                        <div
                            id="myGrid"
                            style={{ flex: '1 1 auto', overflow: 'hidden' }}
                            data-ag-theme-mode={darkMode ? 'dark-blue' : 'light'}
                        >
                            <AgGridReactMemo
                                theme={gridTheme}
                                ref={gridRef}
                                modules={modules}
                                columnDefs={columnDefs}
                                rowData={rowData}
                                defaultColDef={defaultColDef}
                                sideBar={sideBar}
                                components={components}
                                columnTypes={columnTypes}
                                dataTypeDefinitions={dataTypeDefinitions}
                                statusBar={statusBar}
                                chartThemes={chartThemes}
                                chartThemeOverrides={chartThemeOverrides}
                                excelStyles={excelStyles}
                                enableFilterHandlers={true}
                                rowDragManaged={true}
                                rowDragMultiRow={true}
                                rowGroupPanelShow={isSmall ? undefined : 'always'}
                                pivotPanelShow={'always'}
                                cellSelection={cellSelection}
                                rowSelection={rowSelection}
                                enableCharts={true}
                                undoRedoCellEditing={true}
                                undoRedoCellEditingLimit={50}
                                autoGroupColumnDef={groupColumn}
                                rowNumbers={true}
                                enableRtl={enableRtl}
                                suppressColumnMoveAnimation={suppressColMoveAnimation}
                                defaultCsvExportParams={defaultExportParams as CsvExportParams}
                                defaultExcelExportParams={defaultExportParams as ExcelExportParams}
                                getBusinessKeyForNode={getBusinessKeyForNode}
                                initialGroupOrderComparator={initialGroupOrderComparator}
                                onGridReady={onGridReady}
                            />
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

const Example = () => {
    const [darkMode] = useDarkmode();
    const [gridThemeStr] = useState<string>(() => new URLSearchParams(window.location.search).get('theme') ?? 'quartz');
    const [small] = useState(() =>
        IS_SSR ? false : document.documentElement.clientHeight <= 415 || document.documentElement.clientWidth < 768
    );

    return <ExampleInner darkMode={darkMode ?? false} theme={gridThemeStr} isSmall={small} />;
};

export default memo(Example);
