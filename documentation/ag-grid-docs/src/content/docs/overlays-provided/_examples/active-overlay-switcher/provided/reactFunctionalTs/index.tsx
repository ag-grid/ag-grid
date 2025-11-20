import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { StatusOverlayParams } from './statusOverlay';
import StatusOverlay from './statusOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 150 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
];

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
};

const GridExample: React.FC = () => {
    const components = useMemo(() => ({ statusOverlay: StatusOverlay }), []);
    const [activeOverlay, setActiveOverlay] = useState<string | undefined>();
    const [overlayParams, setOverlayParams] = useState<StatusOverlayParams | undefined>();
    const [statusOverlayCounter, setStatusOverlayCounter] = useState(0);
    const [loading, setLoading] = useState<boolean | undefined>(undefined);

    const setNoRowsOverlay = () => {
        setActiveOverlay('agNoRowsOverlay');
        setOverlayParams(undefined);
    };

    const setCustomOverlay = () => {
        const newCounter = statusOverlayCounter + 1;
        setStatusOverlayCounter(newCounter);
        setActiveOverlay('statusOverlay');
        setOverlayParams({ myCounter: newCounter });
    };

    const clearOverlay = () => {
        setActiveOverlay(undefined);
        setOverlayParams(undefined);
    };

    const onLoadingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(event.target.checked ? true : undefined);
    };

    return (
        <div className="example-wrapper">
            <div className="button-row">
                <label className="toggle loading-toggle">
                    <input type="checkbox" checked={loading === true} onChange={onLoadingToggle} /> Loading
                </label>
                <button onClick={setNoRowsOverlay}>Show no-rows overlay</button>
                <button onClick={setCustomOverlay}>Show custom overlay</button>
                <button onClick={clearOverlay}>Hide active overlay</button>
            </div>

            <div className="grid-wrapper">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    components={components}
                    loading={loading}
                    activeOverlay={activeOverlay}
                    activeOverlayParams={overlayParams}
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
