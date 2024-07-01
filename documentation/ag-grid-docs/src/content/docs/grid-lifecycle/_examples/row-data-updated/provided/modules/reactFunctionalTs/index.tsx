'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import type { ColDef, FirstDataRenderedEvent, RowDataUpdatedEvent } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { fetchDataAsync } from './data';
import type { TAthlete } from './data';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const updateRowCount = (id: string) => {
    const element = document.querySelector(`#${id} > .value`);
    element!.textContent = `${new Date().toLocaleTimeString()}`;
};

const columnDefs = [
    { field: 'name', headerName: 'Athlete' },
    { field: 'person.age', headerName: 'Age' },
    { field: 'medals.gold', headerName: 'Gold Medals' },
];

const GridExample = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [rowData, setRowData] = useState<TAthlete[] | undefined>();

    const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
        updateRowCount('firstDataRendered');
        console.log('First Data Rendered');
    }, []);

    const onRowDataUpdated = useCallback((event: RowDataUpdatedEvent<TAthlete>) => {
        updateRowCount('rowDataUpdated');
        console.log('Row Data Updated');
    }, []);

    const reloadData = useCallback(() => {
        console.log('Loading Data ...');
        setLoading(true);
        fetchDataAsync()
            .then((data) => {
                console.info('Data Loaded');
                setRowData(data);
            })
            .catch((error) => {
                console.error('Failed to load data', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(reloadData, []);

    return (
        <div className="test-container">
            <div className="test-header">
                <div id="firstDataRendered">
                    First Data Rendered: <span className="value">-</span>
                </div>
                <div id="rowDataUpdated">
                    Row Data Updated: <span className="value">-</span>
                </div>
                <div>
                    <button disabled={loading} onClick={reloadData}>
                        Reload Data
                    </button>
                </div>
            </div>

            <div style={{ height: '100%' }} className={'ag-theme-quartz-dark'}>
                <AgGridReact
                    loading={loading}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onFirstDataRendered={onFirstDataRendered}
                    onRowDataUpdated={onRowDataUpdated}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<GridExample />);
