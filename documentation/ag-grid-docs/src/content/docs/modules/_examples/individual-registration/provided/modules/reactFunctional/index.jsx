import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import React, { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

// Register shared Modules globally
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule]);

const leftModules = [SetFilterModule, ClipboardModule];
const rightModules = [ExcelExportModule];

const columns = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];

const defaultColDef = {
    flex: 1,
    minWidth: 80,
    filter: true,
    floatingFilter: true,
};

const GridExample = () => {
    const [leftRowData, setLeftRowData] = useState([]);
    const [rightRowData, setRightRowData] = useState([]);

    let rowIdSequence = 100;

    useEffect(() => {
        const createRowBlock = () =>
            ['Red', 'Green', 'Blue'].map((color) => ({
                id: rowIdSequence++,
                color: color,
                value1: Math.floor(Math.random() * 100),
            }));

        setLeftRowData(createRowBlock());
        setRightRowData(createRowBlock());
    }, []);

    return (
        <div
            className={
                'example-wrapper ' +
                /** DARK MODE START **/ (document.documentElement.dataset.defaultTheme ||
                    'ag-theme-quartz') /** DARK MODE END **/
            }
        >
            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={leftRowData}
                    modules={leftModules}
                    columnDefs={columns}
                />
            </div>

            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={rightRowData}
                    modules={rightModules}
                    columnDefs={columns}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
