'use strict';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';

import MedalCellRenderer from './medalCellRenderer.jsx';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const GridExample = () => {
    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', width: 150 },
        { field: 'country', width: 150 },
        { field: 'year', width: 100 },
        { field: 'gold', width: 100, cellRenderer: MedalCellRenderer },
        { field: 'silver', width: 100, cellRenderer: MedalCellRenderer },
        { field: 'bronze', width: 100, cellRenderer: MedalCellRenderer },
        {
            field: 'total',
            editable: false,
            valueGetter: (params) => params.data.gold + params.data.silver + params.data.bronze,
            width: 100,
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    const onCallGold = useCallback(() => {
        console.log('=========> calling all gold');
        // pass in list of columns, here it's gold only
        const params = { columns: ['gold'] };
        const instances = gridRef.current.api.getCellRendererInstances(params);
        instances.forEach((instance) => {
            instance.medalUserFunction();
        });
    }, []);

    const onFirstRowGold = useCallback(() => {
        console.log('=========> calling gold row one');
        // pass in one column and one row to identify one cell
        const firstRowNode = gridRef.current.api.getDisplayedRowAtIndex(0);
        const params = { columns: ['gold'], rowNodes: [firstRowNode] };
        const instances = gridRef.current.api.getCellRendererInstances(params);
        instances.forEach((instance) => {
            instance.medalUserFunction();
        });
    }, []);

    const onCallAllCells = useCallback(() => {
        console.log('=========> calling everything');
        // no params, goes through all rows and columns where cell renderer exists
        const instances = gridRef.current.api.getCellRendererInstances();
        instances.forEach((instance) => {
            instance.medalUserFunction();
        });
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button onClick={onCallGold}>Gold</button>
                    <button onClick={onFirstRowGold}>First Row Gold</button>
                    <button onClick={onCallAllCells}>All Cells</button>
                </div>

                <div
                    style={gridStyle}
                    className={
                        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                    />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
