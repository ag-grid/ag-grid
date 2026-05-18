import { useDarkmode } from '@utils/hooks/useDarkmode';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
    ColDef,
    ColGroupDef,
    CsvExportParams,
    ExcelExportParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    SideBarDef,
    Theme,
    Toolbar as ToolbarConfig,
} from 'ag-grid-community';
import { AllCommunityModule, themeAlpine, themeBalham, themeMaterial, themeQuartz } from 'ag-grid-community';
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
    PdfExportModule,
    PivotModule,
    RichSelectModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    RowNumbersModule,
    SetFilterModule,
    SideBarModule,
    SparklinesModule,
    StatusBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import styles from './Example.module.scss';
import { Toolbar } from './Toolbar';
import { chartThemeOverrides, getDefaultChartThemes } from './config/chartOverrides';
import {
    autoGroupColDef,
    columnTypes,
    dataTypeDefinitions,
    largeColCount,
    largeDefaultCols,
    smallColCount,
    smallDefaultCols,
} from './config/colDefs';
import { excelStyles } from './config/excelStyles';
import { COUNTRY_CODES, countries, createRowItem, extraColumns } from './data';
import { createDataSizeValue } from './utils';

const IS_SSR = typeof window === 'undefined';

const AgGridReactMemo = memo(AgGridReact);

const themeMap: Record<string, Theme> = {
    alpine: themeAlpine,
    balham: themeBalham,
    material: themeMaterial,
    quartz: themeQuartz,
};

const modules = [
    AllCommunityModule,
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
    PdfExportModule,
    PivotModule,
    RowNumbersModule,
    ToolbarModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    SparklinesModule.with(AgChartsEnterpriseModule),
];

const staticGridOptions: GridOptions = {
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent', key: 'totalAndFilter', align: 'left' },
            { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
            { statusPanel: 'agAggregationComponent', align: 'right' },
        ],
    },
    cellSelection: {
        enableHeaderHighlight: true,
        handle: {
            mode: 'fill',
        },
    },
    rowSelection: {
        mode: 'multiRow',
    },
    initialGroupOrderComparator: ({ nodeA, nodeB }) => {
        const aKey = nodeA.key || '';
        const bKey = nodeB.key || '';
        if (aKey < bKey) {
            return -1;
        }
        if (aKey > bKey) {
            return 1;
        }
        return 0;
    },
    enableRtl: IS_SSR ? false : /[?&]rtl=true/.test(window.location.search),

    enableCharts: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 50,
    rowNumbers: true,
    autoGroupColumnDef: autoGroupColDef,
    chartThemeOverrides: chartThemeOverrides,
    excelStyles: excelStyles,
    enableFilterHandlers: true,
    rowDragManaged: true,
    rowDragMultiRow: true,
    loadingOverlayComponent: () => (
        <div className="ag-overlay-loading-center" role="presentation">
            <div aria-live="polite" aria-atomic="true">
                Generating rows....
            </div>
        </div>
    ),
};

const ExampleInner = ({
    darkMode,
    theme,
    isSmall,
    dataSizeStr,
}: {
    darkMode: boolean;
    theme: string;
    dataSizeStr: string | undefined;
    isSmall: boolean;
}) => {
    const gridRef = useRef(null);
    const loadInstance = useRef(0);
    const [gridThemeStr, setGridThemeStr] = useState(theme);

    const gridTheme = themeMap[gridThemeStr] || themeQuartz;
    const chartThemes = getDefaultChartThemes(darkMode);
    const themeClass = darkMode ? `ag-theme-${gridThemeStr}-dark` : `ag-theme-${gridThemeStr}`;

    const [base64Flags, setBase64Flags] = useState<Record<string, any>>();
    const [defaultCols, setDefaultCols] = useState<(ColDef | ColGroupDef)[]>();
    const [defaultColCount, setDefaultColCount] = useState<number>(0);
    const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>();
    const [rowData, setRowData] = useState<any[]>();
    const [isLoading, setIsLoading] = useState(true);
    const [rowCols, setRowCols] = useState<any[]>([]);
    const [dataSize, setDataSize] = useState<string>();

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
    const toolbar = useMemo<ToolbarConfig>(
        () => ({
            alignment: 'right',
            items: [
                ...(isSmall
                    ? []
                    : [
                          { toolbarItem: 'agRowGroupPanelToolbarItem', alignment: 'left' as const },
                          { toolbarItem: 'separator', alignment: 'left' as const },
                          { toolbarItem: 'agPivotPanelToolbarItem', alignment: 'left' as const },
                      ]),
                'agQuickFilterToolbarItem',
            ],
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
        // eslint-disable-next-line react-hooks/purity -- Date.now() called at execution time, not during render
        const startTime = Date.now(); // Track when message display started

        const colCount = parseInt(dataSize?.split('x')[1] ?? '0', 10);
        const rowCount = parseFloat(dataSize?.split('x')[0] ?? '0');
        const colDefs = createCols(colCount);

        let row = 0;
        const data: any[] = [];
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

            if (row >= rowCount) {
                const elapsedTime = Date.now() - startTime;
                const minDisplayTime = 500; // Minimum 500ms display time
                const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

                setTimeout(() => {
                    setIsLoading(false);
                    setColumnDefs(colDefs);
                    setRowData(data);
                }, remainingTime);

                clearInterval(intervalId);
            }
        }, 0);
    };

    const setCountryColumnPopupEditor = (theme: string, gridApi: GridApi) => {
        if (!gridApi || !columnDefs) {
            return;
        }
        const participantGroup = columnDefs.find((group) => group.headerName === 'Participant');
        if (!participantGroup) {
            return;
        }

        const countryColumn: ColDef = (participantGroup as ColGroupDef).children.find(
            (column) => (column as ColDef).field === 'country'
        )!;
        // Material theme uses a popup editor for the country column as this looks better
        countryColumn.cellEditorPopup = theme.includes('material');

        // Ensure a new array is created to trigger a re-render
        setColumnDefs([...columnDefs]);
    };

    useEffect(() => {
        const defaultCols = isSmall ? smallDefaultCols : largeDefaultCols;
        const defaultColCount = isSmall ? smallColCount : largeColCount;

        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing derived state from props
        setDefaultCols(defaultCols);
        setDefaultColCount(defaultColCount);

        const newRowsCols = [
            [100, defaultColCount],
            [1_000, defaultColCount],
        ];

        if (!isSmall) {
            newRowsCols.push([10_000, 100], [50_000, defaultColCount], [100_000, defaultColCount]);
        }

        const defaultDataSize = dataSizeStr
            ? newRowsCols.find(([r, c]) => createDataSizeValue(r, c) === dataSizeStr)
                ? dataSizeStr
                : createDataSizeValue(newRowsCols[1][0], newRowsCols[1][1])
            : createDataSizeValue(newRowsCols[1][0], newRowsCols[1][1]);

        setDataSize(defaultDataSize);
        setRowCols(newRowsCols);
    }, [isSmall, dataSizeStr]);

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
        const columns: (ColDef | ColGroupDef)[] = defaultCols?.slice(0, colCount) ?? [];

        // Group extra columns by their group name
        const groups = new Map<string, ColDef[]>();
        for (let col = defaultColCount; col < colCount; col++) {
            const extraColIndex = col - defaultColCount;
            const colConfig = extraColumns[extraColIndex % extraColumns.length];
            const colDef: ColDef = {
                headerName: colConfig.headerName,
                field: 'col' + col,
                width: 150,
                editable: true,
            };
            switch (colConfig.dataType) {
                case 'currency':
                    colDef.cellDataType = 'currency';
                    colDef.filter = 'agNumberColumnFilter';
                    colDef.width = 160;
                    break;
                case 'percent':
                    colDef.filter = 'agNumberColumnFilter';
                    colDef.valueFormatter = (params) => (params.value != null ? `${params.value.toFixed(1)}%` : '');
                    colDef.width = 130;
                    break;
                case 'rating':
                    colDef.filter = 'agNumberColumnFilter';
                    colDef.width = 120;
                    break;
                case 'text':
                    colDef.filter = 'agSetColumnFilter';
                    colDef.width = 160;
                    break;
                case 'number':
                default:
                    colDef.filter = 'agNumberColumnFilter';
                    colDef.width = 140;
                    break;
            }
            const group = colConfig.group;
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group)!.push(colDef);
        }

        for (const [groupName, children] of groups) {
            columns.push({
                headerName: groupName,
                children,
            });
        }

        return columns;
    };

    const createDataRef = useRef(createData);
    // Ensure we always use the latest createData function to avoid stale closures but without
    // triggering the createData function to be recreated on every render
    // eslint-disable-next-line react-hooks/refs -- intentional ref update during render to avoid stale closure
    createDataRef.current = createData;

    useEffect(() => {
        if (dataSize) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading state before async data generation
            setIsLoading(true);
            setTimeout(() => {
                createDataRef.current(dataSize);
            }, 10); // Use a timeout to allow the UI to update before starting data generation
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
                ></Toolbar>
                <section className={styles.gridWrapper}>
                    {gridTheme && (
                        <div id="myGrid" style={{ flex: '1 1 auto', overflow: 'hidden' }} className={`${themeClass}`}>
                            <AgGridReactMemo
                                ref={gridRef}
                                modules={modules}
                                gridOptions={staticGridOptions}
                                theme={gridTheme}
                                chartThemes={chartThemes}
                                columnDefs={columnDefs}
                                rowData={rowData}
                                loading={isLoading}
                                defaultColDef={defaultColDef}
                                sideBar={sideBar}
                                toolbar={toolbar}
                                columnTypes={columnTypes}
                                dataTypeDefinitions={dataTypeDefinitions}
                                defaultCsvExportParams={defaultExportParams as CsvExportParams}
                                defaultExcelExportParams={defaultExportParams as ExcelExportParams}
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
    const [gridThemeStr] = useState<string>(() =>
        IS_SSR ? 'quartz' : (new URLSearchParams(window.location.search).get('theme') ?? 'quartz')
    );
    const [dataSizeStr] = useState<string | undefined>(() =>
        IS_SSR ? undefined : (new URLSearchParams(window.location.search).get('dataSize') ?? undefined)
    );
    const [small] = useState(() =>
        IS_SSR ? false : document.documentElement.clientHeight <= 415 || document.documentElement.clientWidth < 768
    );

    return <ExampleInner darkMode={darkMode ?? false} theme={gridThemeStr} dataSizeStr={dataSizeStr} isSmall={small} />;
};

export default memo(Example);
