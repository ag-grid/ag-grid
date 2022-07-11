
'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { useEffect } from 'react';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ServerSideRowModelModule, RowGroupingModule, MenuModule, ColumnsToolPanelModule])

const getServerSideDatasource = (server) => {
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
    const [displayGrid, setDisplayGrid] = useState(true);
    const [serverSideInitialRowCount, setServerSideInitialRowCount] = useState(5000);
    const [initialPageTarget, setInitialPageTarget] = useState(4);
    const [initialRowTarget, setInitialRowTarget] = useState(4500);
    const [initialisedPosition, setInitialisedPosition] = useState(false);

    const columnDefs= useMemo(() => [
        { field: 'index' },
        { field: 'country' },
        { field: 'athlete', minWidth: 190 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], []);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 90,
        resizable: true,
        sortable: true,
    }), []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => data.map((item, index) => ({ ...item, index })))
            .then(data => {
                // setup the fake server with entire dataset
                var fakeServer = new FakeServer(data);
                // create datasource with a reference to the fake server
                var datasource = getServerSideDatasource(fakeServer);
                // register the datasource with the grid
                params.api.setServerSideDatasource(datasource);
            });
    }, []);

    const onBodyScrollEnd = useCallback((event) => {
        if(!initialisedPosition) {
            return;
        }
        setInitialRowTarget(event.api.getFirstVisibleRowIndex());
        setServerSideInitialRowCount(event.api.getDisplayedRowCount());
    }, [initialisedPosition]);

    const onPaginationChanged = useCallback((event) => {
        if(!initialisedPosition) {
            return;
        }
        setInitialPageTarget(event.api.paginationGetCurrentPage());
    }, [initialisedPosition]);

    const onFirstDataRendered = useCallback((event) => {
        event.api.paginationGoToPage(initialPageTarget);
        event.api.ensureIndexVisible(initialRowTarget, 'top');
        setInitialisedPosition(true);
    }, [initialPageTarget, initialRowTarget])

    const resetGrid = useCallback(() => {
        setDisplayGrid(false);
        setInitialisedPosition(false);
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
                        <AgGridReact
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
