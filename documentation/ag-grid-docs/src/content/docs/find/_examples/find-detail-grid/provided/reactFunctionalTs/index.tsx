'use client';

import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ColDef,
    FindOptions,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    IDetailCellRendererParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, RowApiModule, enableDevValidations } from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData] = useState<any[]>(getData());
    const [columnDefs] = useState<ColDef[]>([{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
        }),
        []
    );

    const getRowId = useCallback((params: GetRowIdParams) => params.data.a1, []);

    const getFindMatches = useCallback((params: GetFindMatchesParams) => {
        const getMatchesForValue = params.getMatchesForValue;
        let numMatches = 0;
        const checkRow = (row: any) => {
            for (const key of Object.keys(row)) {
                if (key === 'children') {
                    row.children.forEach((child: any) => checkRow(child));
                } else {
                    numMatches += getMatchesForValue(row[key]);
                }
            }
        };
        params.data.children.forEach(checkRow);
        return numMatches;
    }, []);

    const detailCellRendererParams = useMemo<Partial<IDetailCellRendererParams>>(
        () => ({
            // level 2 grid options
            detailGridOptions: {
                columnDefs: [{ field: 'a2', cellRenderer: 'agGroupCellRenderer' }, { field: 'b2' }],
                defaultColDef: {
                    flex: 1,
                },
                masterDetail: true,
                detailRowHeight: 240,
                getRowId: (params: GetRowIdParams) => params.data.a2,
                findOptions: {
                    searchDetail: true,
                },
                detailCellRendererParams: {
                    // level 3 grid options
                    detailGridOptions: {
                        columnDefs: [{ field: 'a3', cellRenderer: 'agGroupCellRenderer' }, { field: 'b3' }],
                        defaultColDef: {
                            flex: 1,
                        },
                        getRowId: (params: GetRowIdParams) => params.data.a3,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        params.successCallback(params.data.children);
                    },
                    getFindMatches,
                } as IDetailCellRendererParams,
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                params.successCallback(params.data.children);
            },
            getFindMatches,
        }),
        []
    );

    const findOptions = useMemo<FindOptions>(
        () => ({
            searchDetail: true,
        }),
        []
    );

    const toolbar = useMemo(() => ({ items: ['agFindToolbarItem' as const] }), []);

    const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    }, []);

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    masterDetail
                    getRowId={getRowId}
                    detailCellRendererParams={detailCellRendererParams}
                    findOptions={findOptions}
                    toolbar={toolbar}
                    modules={modules}
                    onFirstDataRendered={onFirstDataRendered}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
