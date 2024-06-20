'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import type { ColDef } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const GridExample = () => {
    const [rowData, setRowData] = useState<IAthlete[]>([]);
    const [suppressNoRowsOverlay, setSuppressNoRowsOverlay] = useState(false);

    return (
        <div className="example-wrapper">
            <div>
                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={suppressNoRowsOverlay}
                        onChange={(e) => setSuppressNoRowsOverlay(e.target.checked)}
                    />
                    suppressNoRowsOverlay
                </label>

                <button onClick={() => setRowData([])}>Clear rowData</button>
                <button onClick={() => setRowData([{ athlete: 'Michael Phelps', country: 'US' }])}>Set rowData</button>
            </div>

            <div
                style={{ height: '100%' }}
                className={
                    /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact suppressNoRowsOverlay={suppressNoRowsOverlay} rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<GridExample />);
