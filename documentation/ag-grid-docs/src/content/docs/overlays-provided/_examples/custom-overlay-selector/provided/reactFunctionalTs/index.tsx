import React, { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import type { ColDef, IOverlayParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import CustomLoadingOverlay from './customLoadingOverlay';
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

    const overlayComponentSelector = useCallback((params: IOverlayParams) => {
        if (params.overlayType === 'loading') {
            return {
                component: CustomLoadingOverlay,
                params: {
                    loadingMessage: 'Please wait while data is loading...',
                },
            };
        }
        // return undefined to use the provided overlay for other overlay types
        return undefined;
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
                    overlayComponentSelector={overlayComponentSelector}
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
