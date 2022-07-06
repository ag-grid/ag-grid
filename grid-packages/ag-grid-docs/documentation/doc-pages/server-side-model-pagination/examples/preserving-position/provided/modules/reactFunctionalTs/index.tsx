
'use strict';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, GridApi, FirstDataRenderedEvent, GridReadyEvent, IServerSideDatasource, BodyScrollEndEvent, PaginationChangedEvent } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ServerSideRowModelModule, RowGroupingModule, MenuModule, ColumnsToolPanelModule])

declare var FakeServer: any;

const getServerSideDatasource: (server: any) => IServerSideDatasource = (server: any) => {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            var response = server.getData(params.request);
            // adding delay to simulate real server call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                }
                else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}

const GridExample = () => {
    const [serverSideInitialRowCount, setServerSideInitialRowCount] = useState(5000);
    const [initialPageTarget, setInitialPageTarget] = useState(4);
    const [initialRowTarget, setInitialRowTarget] = useState(4500);
    const [displayGrid, setDisplayGrid] = useState(true);
    const [positionInitialised, setPositionInitialised] = useState(false);

    const columnDefs = useMemo<ColDef[]>(() => [
        { field: 'index' },
        { field: 'country' },
        { field: 'athlete', minWidth: 190 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], []);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 90,
            resizable: true,
            sortable: true,
        }
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent<IOlympicData>) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then((data: IOlympicData[]) => data.map((item: IOlympicData, index: number) => ({ ...item, index })))
            .then(data => {
                // setup the fake server with entire dataset
                var fakeServer = new FakeServer(data);
                // create datasource with a reference to the fake server
                var datasource = getServerSideDatasource(fakeServer);
                // register the datasource with the grid
                params.api.setServerSideDatasource(datasource);
            });
    }, []);

    const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent<IOlympicData>) => {
        event.api.paginationGoToPage(initialPageTarget);
        event.api.ensureIndexVisible(initialRowTarget, 'top');
        setPositionInitialised(true)
    }, [initialPageTarget, initialRowTarget])

    const onBodyScrollEnd = useCallback((event: BodyScrollEndEvent) => {
        if (!positionInitialised) {
            return;
        }
        setInitialRowTarget(event.api.getFirstVisibleRowIndex());
        setServerSideInitialRowCount(event.api.getDisplayedRowCount());
    }, [positionInitialised]);

    const onPaginationChanged = useCallback((event: PaginationChangedEvent) => {
        if (!positionInitialised) {
            return;
        }
        setInitialPageTarget(event.api.paginationGetCurrentPage());
    }, [positionInitialised]);

    const resetGrid = useCallback(() => {
        setPositionInitialised(false);
        setDisplayGrid(false);
    }, []);

    useEffect(() => {
        if (!displayGrid) {
            setDisplayGrid(true);
        }
    }, [displayGrid]);

    return (
        <React.Fragment>
            <button onClick={resetGrid}>Reload Grid</button>
            {
                displayGrid && (
                    <div className="ag-theme-alpine-dark grid-wrapper">
                        <AgGridReact<IOlympicData>
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowModelType={'serverSide'}
                            pagination={true}
                            paginationPageSize={1000}
                            serverSideInitialRowCount={serverSideInitialRowCount}
                            suppressAggFuncInHeader={true}
                            animateRows={true}
                            onGridReady={onGridReady}
                            onFirstDataRendered={onFirstDataRendered}
                            onBodyScrollEnd={onBodyScrollEnd}
                            onPaginationChanged={onPaginationChanged}
                        >
                        </AgGridReact>
                    </div>
                )
            }
        </React.Fragment>
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
