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

import { CustomOverlay } from './customOverlay';
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
    flex: 1,
    minWidth: 120,
};

const GridExample: React.FC = () => {
    const [activeOverlay, setActiveOverlay] = useState<any>();

    return (
        <div className="example-wrapper">
            <div className="button-row">
                <button onClick={() => setActiveOverlay(() => CustomOverlay)}>Show custom overlay</button>
                <button onClick={() => setActiveOverlay(undefined)}>Hide custom overlay</button>
            </div>

            <div className="grid-wrapper">
                <AgGridReact<IAthlete>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
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
