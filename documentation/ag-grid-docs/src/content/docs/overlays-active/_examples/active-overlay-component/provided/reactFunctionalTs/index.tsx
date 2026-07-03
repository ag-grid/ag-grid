import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { CustomParams } from './customOverlay';
import { CustomOverlay } from './customOverlay';
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

const columnDefs: ColDef[] = [
    { field: 'athlete', flex: 1 },
    { field: 'country', flex: 1 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
    { athlete: 'Aleksey Nemov', country: 'Russia' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

const GridExample = () => {
    const [activeOverlay, setActiveOverlay] = useState<any>(() => CustomOverlay);
    const [activeOverlayParams, setActiveOverlayParams] = useState<CustomParams>({ count: 1 });

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="button-row">
                    <button onClick={() => setActiveOverlay(() => CustomOverlay)}>Show custom overlay</button>
                    <button onClick={() => setActiveOverlay(undefined)}>Hide custom overlay</button>
                    <button onClick={() => setActiveOverlayParams((prev) => ({ count: prev.count + 1 }))}>
                        Increment Param
                    </button>
                </div>

                <div className="grid-wrapper">
                    <AgGridReact<IAthlete>
                        rowData={rowData}
                        columnDefs={columnDefs}
                        activeOverlay={activeOverlay}
                        activeOverlayParams={activeOverlayParams}
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
