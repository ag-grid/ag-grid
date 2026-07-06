import React, { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef, IOverlayParams } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomLoadingOverlay from './customLoadingOverlay';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [ClientSideRowModelModule];

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const rowData: IAthlete[] = [];
const loadingOverlayText = 'Please wait while data is loading...';

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
                    loading: { overlayText: loadingOverlayText },
                },
            };
        }
        // return undefined to use the provided overlay for other overlay types
        return undefined;
    }, []);

    return (
        <AgGridProvider modules={modules}>
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
                        overlayComponentParams={{
                            loading: { overlayText: loadingOverlayText },
                        }}
                        overlayComponentSelector={overlayComponentSelector}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
