import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import StatusOverlay from './statusOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', flex: 1 },
    { field: 'country', flex: 1 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
];

const GridExample = () => {
    const components = useMemo(() => ({ statusOverlay: StatusOverlay }), []);
    const [activeOverlay, setActiveOverlay] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean | undefined>(undefined);

    const setNoRowsOverlay = () => {
        setActiveOverlay('agNoRowsOverlay');
    };

    const setCustomOverlay = () => {
        setActiveOverlay('statusOverlay');
    };

    const clearOverlay = () => {
        setActiveOverlay(undefined);
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
                <button onClick={setNoRowsOverlay}>activeOverlay = agNoRowsOverlay</button>
                <button onClick={setCustomOverlay}>activeOverlay = CustomOverlay</button>
                <button onClick={clearOverlay}>Hide activeOverlay</button>
            </div>

            <div className="grid-wrapper">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    components={components}
                    loading={loading}
                    activeOverlay={activeOverlay}
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
