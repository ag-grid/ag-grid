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
    { athlete: 'Aleksey Nemov', country: 'Russia' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

const defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    minWidth: 120,
    filter: true,
};

const GridExample: React.FC = () => {
    const components = useMemo(() => ({ statusOverlay: StatusOverlay }), []);
    const [activeOverlay, setActiveOverlay] = useState<string | undefined>();
    const [overlayParams, setOverlayParams] = useState({
        heading: 'Overlay message',
        message: 'Use the buttons to pick which overlay should be visible.',
    });

    const setLoadingOverlay = () => {
        setOverlayParams({
            heading: 'Loading data',
            message: 'Showing the built-in loading overlay via activeOverlay.',
        });
        setActiveOverlay('agLoadingOverlay');
    };

    const setNoRowsOverlay = () => {
        setOverlayParams({
            heading: 'No rows',
            message: 'Displaying the built-in no-rows overlay via activeOverlay.',
        });
        setActiveOverlay('agNoRowsOverlay');
    };

    const setCustomOverlay = () => {
        setOverlayParams({
            heading: 'Scheduled maintenance',
            message: 'This overlay comes from the components map using the key "statusOverlay".',
        });
        setActiveOverlay('statusOverlay');
    };

    const clearOverlay = () => {
        setOverlayParams({
            heading: 'Overlay hidden',
            message: 'No overlay is currently active.',
        });
        setActiveOverlay(undefined);
    };

    return (
        <div className="example-wrapper">
            <div className="button-row">
                <button onClick={setLoadingOverlay}>Show loading overlay</button>
                <button onClick={setNoRowsOverlay}>Show no-rows overlay</button>
                <button onClick={setCustomOverlay}>Show custom overlay</button>
                <button onClick={clearOverlay}>Hide overlay</button>
            </div>

            <div className="grid-wrapper" style={{ height: '100%', width: '100%' }}>
                <AgGridReact<IAthlete>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    components={components}
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
