import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    type ColDef,
    type GetRowIdFunc,
    type GetRowIdParams,
    type SelectionOptions,
    type ValueFormatterFunc,
    type ValueGetterParams,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './FinanceExample.module.css';
import { TickerCellRenderer } from './cell-renderers/TickerCellRenderer';
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

const numberFormatter: ValueFormatterFunc = ({ value }) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
    });
    return value == null ? '' : formatter.format(value);
};

export const FinanceExample: React.FC<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode = false }) => {
    const [rowData, setRowData] = useState(getData());
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
                cellRenderer: TickerCellRenderer,
                minWidth: 380,
            },
            {
                field: 'instrument',
                cellDataType: 'text',
                type: 'rightAligned',
                maxWidth: 180,
            },
            {
                headerName: 'P&L',
                cellDataType: 'number',
                type: 'rightAligned',
                cellRenderer: 'agAnimateShowChangeCellRenderer',
                valueGetter: ({ data }: ValueGetterParams) => data && data.quantity * (data.price / data.purchasePrice),
                valueFormatter: numberFormatter,
                aggFunc: 'sum',
            },
            {
                headerName: 'Total Value',
                type: 'rightAligned',
                cellDataType: 'number',
                valueGetter: ({ data }: ValueGetterParams) => data && data.quantity * data.price,
                cellRenderer: 'agAnimateShowChangeCellRenderer',
                valueFormatter: numberFormatter,
                aggFunc: 'sum',
            },
            {
                field: 'quantity',
                cellDataType: 'number',
                type: 'rightAligned',
                valueFormatter: numberFormatter,
                maxWidth: 150,
            },
            {
                headerName: 'Price',
                field: 'purchasePrice',
                cellDataType: 'number',
                type: 'rightAligned',
                valueFormatter: numberFormatter,
                maxWidth: 150,
            },
            {
                field: 'purchaseDate',
                cellDataType: 'dateString',
                type: 'rightAligned',
                hide: true,
            },
            {
                headerName: 'Last 24hrs',
                field: 'last24',
                cellRenderer: 'agSparklineCellRenderer',
                cellRendererParams: {
                    sparklineOptions: {
                        line: {
                            strokeWidth: 2,
                        },
                    },
                },
            },
        ],
        []
    );

    const defaultColDef: ColDef = useMemo(
        () => ({
            flex: 1,
            filter: true,
            enableRowGroup: true,
            enableValue: true,
        }),
        []
    );

    const selection: SelectionOptions = useMemo(
        () => ({
            mode: 'cell',
        }),
        []
    );

    const getRowId = useCallback<GetRowIdFunc>(({ data: { ticker } }: GetRowIdParams) => ticker, []);

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
                        selection={selection}
                        enableCharts
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
