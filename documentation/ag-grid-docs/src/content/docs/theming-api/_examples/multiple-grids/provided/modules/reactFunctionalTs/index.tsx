'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { applyCustomProperties, themeBalham, themeMaterial, themeQuartz } from '@ag-grid-community/theming';
import React, { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const [showGrid1, setShowGrid1] = React.useState(true);
    const [showGrid2, setShowGrid2] = React.useState(true);
    const [showGrid3, setShowGrid3] = React.useState(true);
    const [showGrid4, setShowGrid4] = React.useState(true);

    const grid4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (grid4Ref.current) {
            applyCustomProperties({ accentColor: 'red' }, grid4Ref.current);
        }
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ flex: 1 }}>
                    Quartz theme:{' '}
                    <input type="checkbox" checked={showGrid1} onChange={() => setShowGrid1(!showGrid1)} />
                </p>
                <p style={{ flex: 1 }}>
                    Material theme:{' '}
                    <input type="checkbox" checked={showGrid2} onChange={() => setShowGrid2(!showGrid2)} />
                </p>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    {showGrid1 && (
                        <AgGridReact
                            theme={themeQuartz}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    {showGrid2 && (
                        <AgGridReact
                            theme={themeMaterial}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ flex: 1 }}>
                    Two grids using Balham theme:{' '}
                    <input type="checkbox" checked={showGrid3} onChange={() => setShowGrid3(!showGrid3)} />
                </p>
                <p style={{ flex: 1 }}>
                    <input type="checkbox" checked={showGrid4} onChange={() => setShowGrid4(!showGrid4)} />
                </p>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    {showGrid3 && (
                        <AgGridReact
                            theme={themeBalham}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    )}
                </div>
                <div style={{ flex: 1 }} ref={grid4Ref}>
                    {showGrid4 && (
                        <AgGridReact
                            theme={themeBalham}
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 34000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 31000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 71000 + i * 1000 });
    }
    return rowData;
})();

const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
