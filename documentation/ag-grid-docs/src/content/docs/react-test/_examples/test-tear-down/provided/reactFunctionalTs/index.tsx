'use client';

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);
export function GridExample() {
    const [show, setShow] = useState(true);
    const [visibility, setVisibility] = useState<any>('visible');

    return (
        <div style={{ height: '100%' }}>
            <button
                onClick={() => {
                    setVisibility('hidden'); // Making the grid not-visible will force the 'setScrollPosition' function to invoke the 'attemptSettingScrollPosition' function, which in turn triggers the _waitUntil
                    const scroller = document.querySelector('.ag-body-viewport')!;
                    scroller.scrollTop += 50; // Performing a scroll will trigger a code path that uses the problematic _waitUntil function
                    setTimeout(() => {
                        setShow(false); // Simulating _disposal_ of the Ag-Grid
                        setTimeout(() => {
                            // Simulating the removal of DOM api (which happens in vitest between tests)
                            (window as any).clearInterval = undefined;
                            (window as any).setTimeout = undefined;
                            (window as any).setInterval = undefined;
                            (window as any).clearTimeout = undefined;
                        }, 50);
                    }, 50);
                }}
            >
                Destroy
            </button>
            <div style={{ height: '60%', visibility }}>{show && <GridWrapper />}</div>
        </div>
    );
}

function GridWrapper() {
    // These are purposefully not stable references to trigger the issue
    // as we then get property changes triggered on the grid at the same time as it is being destroyed.
    const rowData = [
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    ];

    const colDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }];

    return <AgGridReact rowData={rowData} columnDefs={colDefs} />;
}
const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
