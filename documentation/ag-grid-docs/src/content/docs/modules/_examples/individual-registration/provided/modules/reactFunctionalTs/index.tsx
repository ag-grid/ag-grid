import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

// Register shared Modules globally
ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, MenuModule, GridChartsModule]);
const leftModules = [SetFilterModule, ClipboardModule];
const rightModules = [ExcelExportModule];

const columns: ColDef[] = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 80,
    filter: true,
    floatingFilter: true,
};

const GridExample = () => {
    const [leftRowData, setLeftRowData] = useState<any[]>([]);
    const [rightRowData, setRightRowData] = useState<any[]>([]);

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
                /** DARK MODE START **/ (document.documentElement?.dataset.defaultTheme ||
                    'ag-theme-quartz') /** DARK MODE END **/
            }
        >
            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={leftRowData}
                    modules={leftModules}
                    columnDefs={columns}
                    enableRangeSelection
                    enableCharts
                />
            </div>

            <div className="inner-col">
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={rightRowData}
                    modules={rightModules}
                    columnDefs={columns}
                    enableRangeSelection
                    enableCharts
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<GridExample />);
