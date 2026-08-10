import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'total' },
];

const GridExample = () => {
    const [themeClass, setThemeClass] = useState('ag-theme-quartz');
    const { data } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const applyTheme = (theme: string, isDark: boolean) => {
        setThemeClass(`ag-theme-${theme}${isDark ? '-dark' : ''}`);
    };

    return (
        <AgGridProvider modules={[AllEnterpriseModule]}>
            <div className="example-wrapper">
                <div className="example-header">
                    <span className="button-group">
                        <button onClick={() => applyTheme('quartz', false)}>Quartz</button>
                        <button onClick={() => applyTheme('quartz', true)}>Quartz Dark</button>
                        <button onClick={() => applyTheme('alpine', false)}>Alpine</button>
                        <button onClick={() => applyTheme('alpine', true)}>Alpine Dark</button>
                        <button onClick={() => applyTheme('balham', false)}>Balham</button>
                        <button onClick={() => applyTheme('balham', true)}>Balham Dark</button>
                        <button onClick={() => applyTheme('material', false)}>Material</button>
                        <button onClick={() => applyTheme('material', true)}>Material Dark</button>
                    </span>
                </div>
                <div id="myGrid" className={themeClass}>
                    <AgGridReact theme="legacy" columnDefs={columnDefs} rowData={data} />
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
