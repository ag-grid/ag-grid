import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import CustomOverlay from './customOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const rowData: IAthlete[] = [];

const defaultColDef: ColDef = {
    flex: 1,
};

const GridExample = () => {
    const [loading, setLoading] = useState(true);

    const overlayComponentParams = useMemo(() => {
        return {
            loadingMessage: 'Custom loading message',
            noRowsMessage: 'Custom no rows message',
        };
    }, []);

    return (
        <div className="example-wrapper">
            <div>
                <label className="checkbox">
                    <input type="checkbox" onChange={(e) => setLoading(e.target.checked)} checked={loading} />
                    loading
                </label>
            </div>

            <div style={{ height: '100%', width: '100%' }}>
                <AgGridReact<IAthlete>
                    loading={loading}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    overlayComponent={CustomOverlay}
                    overlayComponentParams={overlayComponentParams}
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
