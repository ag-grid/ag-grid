import { useDarkmode } from '@utils/hooks/useDarkmode';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
    CellSelectionOptions,
    ColDef,
    ColGroupDef,
    CsvExportParams,
    ExcelExportParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    InitialGroupOrderComparatorParams,
    RowSelectionOptions,
    SideBarDef,
    Theme,
} from 'ag-grid-community';
import {
    AllCommunityModule,
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
    StatusBarModule,
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
import { COUNTRY_CODES, colNames, countries, createRowItem } from './data';
import { createDataSizeValue, suppressColumnMoveAnimation } from './utils';

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
    PivotModule,
    RowNumbersModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
];

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
                                theme={gridTheme}
                                ref={gridRef}
                                modules={modules}
                                columnDefs={columnDefs}
                                rowData={rowData}
                                loading={isLoading}
                                loadingOverlayComponent={() => 'Generating rows...'}
                                defaultColDef={defaultColDef}
                                sideBar={sideBar}
                                columnTypes={columnTypes}
                                dataTypeDefinitions={dataTypeDefinitions}
                                statusBar={statusBar}
                                chartThemes={chartThemes}
                                chartThemeOverrides={chartThemeOverrides}
                                excelStyles={excelStyles}
                                enableFilterHandlers
                                rowDragManaged
                                rowDragMultiRow
                                rowGroupPanelShow={isSmall ? undefined : 'always'}
                                pivotPanelShow={'always'}
                                cellSelection={cellSelection}
                                rowSelection={rowSelection}
                                enableCharts
                                undoRedoCellEditing
                                undoRedoCellEditingLimit={50}
                                autoGroupColumnDef={autoGroupColDef}
                                rowNumbers
                                enableRtl={enableRtl}
                                suppressColumnMoveAnimation={suppressColMoveAnimation}
                                defaultCsvExportParams={defaultExportParams as CsvExportParams}
                                defaultExcelExportParams={defaultExportParams as ExcelExportParams}
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
