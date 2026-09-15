import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ColDef,
    HeaderValueGetterParams,
    IGetRowsParams,
    IServerSideGetRowsParams,
    IViewportDatasource,
    IViewportDatasourceParams,
} from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    DateEditorModule,
    DateFilterModule,
    InfiniteRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import { ROW_DATA, getSortModel, queryRows } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [
    ColumnApiModule,
    CheckboxEditorModule,
    DateEditorModule,
    DateFilterModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    ServerSideRowModelModule,
    ViewportRowModelModule,
    RowGroupingModule,
];

type RowModel = 'clientSide' | 'infinite' | 'serverSide' | 'viewport';

const ROW_MODELS: [value: RowModel, label: string][] = [
    ['clientSide', 'Client-Side'],
    ['infinite', 'Infinite'],
    ['serverSide', 'Server-Side'],
    ['viewport', 'Viewport'],
];

const BLOCK_SIZE = 4;

/** Shows each column's inferred type in its header, which is the point of the example. */
function headerValueGetter(params: HeaderValueGetterParams): string {
    const { headerName, cellDataType } = params.colDef ?? {};
    if (cellDataType === undefined) {
        return headerName ?? '';
    }
    return `${headerName} (${cellDataType === false ? 'not inferred yet' : cellDataType})`;
}

/** Serves the block asked for, from the rows left by the filter and sort the grid passed on. */
function getBlock(params: IGetRowsParams): void {
    const rows = queryRows(params.filterModel, params.sortModel);
    setTimeout(() => params.successCallback(rows.slice(params.startRow, params.endRow), rows.length), 200);
}

/**
 * Groups the rows by `dateStr`: the first request returns group rows, which carry only the group key,
 * and expanding a group returns the leaf rows under it.
 */
function getGroupedRows(params: IServerSideGetRowsParams): void {
    const { groupKeys, filterModel, sortModel } = params.request;
    const leaves = queryRows(filterModel as Record<string, any>, sortModel);
    const rows = groupKeys.length
        ? leaves.filter(({ dateStr }) => dateStr === groupKeys[0])
        : [...new Set(leaves.map(({ dateStr }) => dateStr))].map((dateStr) => ({ dateStr }));

    setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 200);
}

/**
 * The viewport datasource is given no filter or sort hook, so the grid's own filter and sort events
 * tell it to push the matching rows again.
 */
function createViewportDatasource(): { datasource: IViewportDatasource; refresh: () => void } {
    let params: IViewportDatasourceParams | undefined;

    const push = () => {
        if (!params) {
            return;
        }
        const rows = queryRows(params.api.getFilterModel(), getSortModel(params.api));
        params.setRowCount(rows.length);
        setTimeout(() => {
            const byIndex: Record<number, any> = {};
            rows.forEach((row, index) => (byIndex[index] = row));
            params!.setRowData(byIndex);
        }, 200);
    };

    return {
        datasource: {
            init: (viewportParams) => {
                params = viewportParams;
                push();
            },
            setViewportRange: () => {},
        },
        refresh: push,
    };
}

const datasourceProps = (rowModel: RowModel) => {
    switch (rowModel) {
        case 'clientSide':
            return { rowData: ROW_DATA };
        case 'infinite':
            return { cacheBlockSize: BLOCK_SIZE, datasource: { getRows: getBlock } };
        case 'serverSide':
            return { serverSideDatasource: { getRows: getGroupedRows } };
        case 'viewport': {
            const viewport = createViewportDatasource();
            return {
                viewportDatasource: viewport.datasource,
                onFilterChanged: viewport.refresh,
                onSortChanged: viewport.refresh,
            };
        }
    }
};

const GridExample = () => {
    const [rowModel, setRowModel] = useState<RowModel>('clientSide');
    const [gridVisible, setGridVisible] = useState(true);

    // No column declares `cellDataType`, so every type below is inferred from the data
    const columnDefs = useMemo<ColDef[]>(() => {
        // The Server-Side Row Model groups by `dateStr`, so inference there waits for the leaf rows
        const grouped: ColDef = rowModel === 'serverSide' ? { rowGroup: true, hide: true } : {};
        return [
            { field: 'athlete', headerName: 'Athlete' },
            { field: 'age', headerName: 'Age' },
            { field: 'date', headerName: 'Date' },
            { field: 'dateStr', headerName: 'Date (String)', ...grouped },
            { field: 'hasGold', headerName: 'Gold' },
        ];
    }, [rowModel]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 170,
            filter: true,
            editable: true,
            headerValueGetter,
        }),
        []
    );

    // `rowModelType` is an initial-only option, so switching it recreates the grid
    const onRowModelChange = useCallback((next: RowModel) => {
        setGridVisible(false);
        setRowModel(next);
        setTimeout(() => setGridVisible(true));
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="example-controls">
                    <span>Row model:</span>
                    {ROW_MODELS.map(([value, label]) => (
                        <label key={value}>
                            <input
                                type="radio"
                                name="rowModel"
                                value={value}
                                checked={rowModel === value}
                                onChange={() => onRowModelChange(value)}
                            />{' '}
                            {label}
                        </label>
                    ))}
                </div>
                <div id="myGrid">
                    {gridVisible && (
                        <AgGridReact
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowModelType={rowModel}
                            // `filter: true` then uses the filter the inferred data type implies, rather than the Set Filter
                            suppressSetFilterByDefault
                            {...datasourceProps(rowModel)}
                        />
                    )}
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
