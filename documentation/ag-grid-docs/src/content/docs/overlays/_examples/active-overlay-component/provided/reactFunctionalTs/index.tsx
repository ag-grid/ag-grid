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

import CustomActiveOverlay from './customActiveOverlay';
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
    const [activeOverlay, setActiveOverlay] = useState<typeof CustomActiveOverlay | undefined>();

    const activeOverlayParams = useMemo(() => {
        return {
            heading: 'Updates in progress',
            message: 'The grid content is temporarily paused while we fetch fresh data.',
        };
    }, []);

    return (
        <div className="example-wrapper">
            <div className="button-row">
                <button onClick={() => setActiveOverlay(() => CustomActiveOverlay)}>Show active overlay</button>
                <button onClick={() => setActiveOverlay(undefined)}>Hide active overlay</button>
            </div>

            <div className="grid-wrapper" style={{ height: '100%', width: '100%' }}>
                <AgGridReact<IAthlete>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    activeOverlay={activeOverlay}
                    activeOverlayParams={activeOverlayParams}
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
