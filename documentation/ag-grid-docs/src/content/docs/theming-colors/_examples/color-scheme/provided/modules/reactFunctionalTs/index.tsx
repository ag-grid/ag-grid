import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    colorSchemeDarkBlue,
    colorSchemeDarkWarm,
    colorSchemeLightCold,
    colorSchemeLightWarm,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const themeLightWarm = themeQuartz.withPart(colorSchemeLightWarm);
const themeLightCold = themeQuartz.withPart(colorSchemeLightCold);
const themeDarkWarm = themeQuartz.withPart(colorSchemeDarkWarm);
const themeDarkBlue = themeQuartz.withPart(colorSchemeDarkBlue);

const GridExample = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ flex: 1 }}>colorSchemeLightWarm:</p>
                <p style={{ flex: 1 }}>colorSchemeLightCold:</p>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    {
                        <AgGridReact
                            theme={themeLightWarm}
                            loadThemeGoogleFonts
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    }
                </div>
                <div style={{ flex: 1 }}>
                    {
                        <AgGridReact
                            theme={themeLightCold}
                            loadThemeGoogleFonts
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    }
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ flex: 1 }}>colorSchemeDarkWarm:</p>
                <p style={{ flex: 1 }}>colorSchemeDarkBlue:</p>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    {
                        <AgGridReact
                            theme={themeDarkWarm}
                            loadThemeGoogleFonts
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    }
                </div>
                <div style={{ flex: 1 }}>
                    {
                        <AgGridReact
                            theme={themeDarkBlue}
                            loadThemeGoogleFonts
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                        />
                    }
                </div>
            </div>
        </div>
    );
};

const rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
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
