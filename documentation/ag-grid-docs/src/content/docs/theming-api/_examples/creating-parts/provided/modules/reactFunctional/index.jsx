'use strict';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { createPart, createTheme } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const myCheckboxStyle = createPart('checkboxStyle')
    // Add some CSS to this part. If your application is bundled with Vite you
    // can put this in a separate file and import it with
    // `import checkboxCSS "./checkbox.css?inline"`
    .withCSS(
        `
        .ag-checkbox-input-wrapper {
            border-radius: 4px;
            /* Parts' CSS can use new parameters - define support
               for them using withAdditionalParams below */
            box-shadow: 0 0 5px 4px var(--ag-checkbox-glow-color);
            width: 16px;
            height: 16px;

            &.ag-checked {
                box-shadow: 0 0 5px 4px var(--ag-checkbox-checked-glow-color);
                &::before {
                    content: '✔';
                    position: absolute;
                    inset: 0;
                    text-align: center;
                    line-height: 16px;
                    font-size: 14px;
                }
            }
        }

        .ag-checkbox-input {
            width: 16px;
            height: 16px;
            appearance: none;
            -webkit-appearance: none;
        }
        
        /* styles are scoped to grids using the theme, so won't pollute
           the page's global CSS. This next line will have no effect: */
        body {
            border: solid 50px blue !important;
        }
    `
    )
    // Declare parameters added by the custom CSS and provide default values
    .withAdditionalParams({
        checkboxCheckedGlowColor: { ref: 'accentColor' },
        checkboxGlowColor: { ref: 'foregroundColor', mix: 0.5 },
    })
    // If you want to provide new default values for parameters already defined
    // by the grid, use withParams which provides TypeScript checking
    .withParams({ accentColor: 'red' });

const myCustomTheme = createTheme().withPart(myCheckboxStyle);

const GridExample = () => {
    return (
        <AgGridReact
            theme={myCustomTheme}
            rowSelection={{ mode: 'multiRow', checkboxes: true }}
            initialState={{
                rowSelection: ['1', '2', '3'],
            }}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
        />
    );
};

const rowData = (() => {
    const rowData = [];
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

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
