import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type ColDef, type GetRowIdFunc, type GetRowIdParams, type ValueFormatterFunc } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact, type CustomCellRendererProps } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AdvancedFilterModule } from '@ag-grid-enterprise/advanced-filter';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './FinanceExample.module.css';
import { getData } from './data';

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AdvancedFilterModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    GridChartsModule,
    MenuModule,
    RangeSelectionModule,
    RowGroupingModule,
    SetFilterModule,
    RichSelectModule,
    StatusBarModule,
    SparklinesModule,
]);

const numberFormatter: ValueFormatterFunc = (params) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
    });
    return params.value == null ? '' : formatter.format(params.value);
};

const FinanceExample: React.FC<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode = false }) => {
    const [rowData, setRowData] = useState(getData);
    const gridRef = useRef<AgGridReact>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRowData((rowData) =>
                rowData.map((item) =>
                    Math.random() < 0.1
                        ? {
                              ...item,
                              price:
                                  item.price +
                                  item.price * ((Math.random() * 4 + 1) / 100) * (Math.random() > 0.5 ? 1 : -1),
                          }
                        : item
                )
            );
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const colDefs = useMemo<ColDef[]>(
        () => [
            {
                field: 'ticker',
                cellRenderer: (params: CustomCellRendererProps) =>
                    params.data && (
                        <>
                            <div>
                                <img
                                    src={urlWithBaseUrl(`/example/finance/logos/${params.data.ticker}.png`)}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        marginRight: '5px',
                                        borderRadius: '32px',
                                    }}
                                />
                                <b className="custom-ticker">{params.data.ticker}</b>
                                <span className="ticker-name"> {params.data.name}</span>
                            </div>
                        </>
                    ),
            },
            {
                field: 'name',
                cellDataType: 'text',
                hide: true,
            },
            {
                field: 'instrument',
                cellDataType: 'text',
                rowGroup: true,
                sort: 'desc',
                hide: true,
            },
            {
                headerName: 'P&L',
                cellDataType: 'number',
                type: 'rightAligned',
                cellRenderer: 'agAnimateShowChangeCellRenderer',
                valueGetter: (params) =>
                    params.data && params.data.quantity * (params.data.price / params.data.purchasePrice),
                valueFormatter: numberFormatter,
                aggFunc: 'sum',
            },
            {
                headerName: 'Total Value',
                type: 'rightAligned',
                cellDataType: 'number',
                valueGetter: (params) => params.data && params.data.quantity * params.data.price,
                cellRenderer: 'agAnimateShowChangeCellRenderer',
                valueFormatter: numberFormatter,
                aggFunc: 'sum',
            },
            {
                field: 'quantity',
                cellDataType: 'number',
                maxWidth: 140,
                type: 'rightAligned',
                valueFormatter: numberFormatter,
            },
            {
                field: 'purchasePrice',
                cellDataType: 'number',
                maxWidth: 140,
                type: 'rightAligned',
                valueFormatter: numberFormatter,
            },
            {
                field: 'purchaseDate',
                cellDataType: 'dateString',
                type: 'rightAligned',
            },
            {
                headerName: 'Last 24hrs',
                field: 'last24',
                maxWidth: 500,
                cellRenderer: 'agSparklineCellRenderer',
            },
        ],
        []
    );

    const defaultColDef: ColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 140,
            maxWidth: 180,
            filter: true,
            floatingFilter: true,
            enableRowGroup: true,
            enableValue: true,
        }),
        []
    );

    const getRowId = useCallback<GetRowIdFunc>((params: GetRowIdParams) => params.data.ticker, []);

    const statusBar = useMemo(
        () => ({
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent' },
                { statusPanel: 'agTotalRowCountComponent' },
                { statusPanel: 'agFilteredRowCountComponent' },
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' },
            ],
        }),
        []
    );

    const themeClass = `${gridTheme}${isDarkMode ? '-dark' : ''}`;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        getRowId={getRowId}
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        enableRangeSelection
                        enableCharts
                        rowSelection={'multiple'}
                        rowGroupPanelShow={'always'}
                        suppressAggFuncInHeader
                        groupDefaultExpanded={-1}
                        statusBar={statusBar}
                    />
                </div>
            </div>
        </div>
    );
};

export default FinanceExample;
