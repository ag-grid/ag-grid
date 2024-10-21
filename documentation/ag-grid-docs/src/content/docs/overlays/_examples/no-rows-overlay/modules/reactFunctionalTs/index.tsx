import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const GridExample = () => {
    const [rowData, setRowData] = useState<IAthlete[]>([]);

    return (
        <div className="example-wrapper">
            <div>
                <button onClick={() => setRowData([])}>Clear rowData</button>
                <button onClick={() => setRowData([{ athlete: 'Michael Phelps', country: 'US' }])}>Set rowData</button>
            </div>

            <div style={{ height: '100%' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<GridExample />);
