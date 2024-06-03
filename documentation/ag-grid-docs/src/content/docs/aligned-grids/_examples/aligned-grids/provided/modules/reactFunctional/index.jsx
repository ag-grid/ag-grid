import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const GridExample = () => {
    const topGrid = useRef(null);
    const bottomGrid = useRef(null);

    const defaultColDef = useMemo(() => ({
        filter: true,
        minWidth: 100,
    }));

    const columnDefs = useMemo(
        () => [
            { field: 'athlete' },
            { field: 'age' },
            { field: 'country' },
            { field: 'date' },
            { field: 'sport' },
            {
                headerName: 'Medals',
                children: [
                    {
                        columnGroupShow: 'closed',
                        colId: 'total',
                        valueGetter: 'data.gold + data.silver + data.bronze',
                        width: 200,
                    },
                    { columnGroupShow: 'open', field: 'gold', width: 100 },
                    { columnGroupShow: 'open', field: 'silver', width: 100 },
                    { columnGroupShow: 'open', field: 'bronze', width: 100 },
                ],
            },
        ],
        []
    );

    const [rowData, setRowData] = useState();

    const autoSizeStrategy = useMemo(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );

    const onGridReady = (params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    };

    const onCbAthlete = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current) {
            topGrid.current.api.setColumnsVisible(['athlete'], event.target.checked);
        }
    };

    const onCbAge = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current) {
            topGrid.current.api.setColumnsVisible(['age'], event.target.checked);
        }
    };

    const onCbCountry = (event) => {
        // we only need to update one grid, as the other is a slave
        if (topGrid.current) {
            topGrid.current.api.setColumnsVisible(['country'], event.target.checked);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <label>
                    <input type="checkbox" defaultChecked onChange={onCbAthlete} />
                    Athlete
                </label>
                <label>
                    <input type="checkbox" defaultChecked onChange={onCbAge} />
                    Age
                </label>
                <label>
                    <input type="checkbox" defaultChecked onChange={onCbCountry} />
                    Country
                </label>
            </div>

            <div
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={topGrid}
                    alignedGrids={[bottomGrid]}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    autoSizeStrategy={autoSizeStrategy}
                    onGridReady={onGridReady}
                />
            </div>

            <div className="divider"></div>

            <div
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={bottomGrid}
                    alignedGrids={[topGrid]}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
