'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import CustomButtonComponent from './customButtonComponent';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule]);

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'id',
        },
        {
            colId: 'customButton',
            headerName: 'Button',
            cellRenderer: CustomButtonComponent,
            editable: true,
        },
    ]);

    const [enableRangeSelection, setEnableRangeSelection] = useState(false);

    const toggleRangeSelection = useCallback(() => {
        setEnableRangeSelection((oldEnableRangeSelection) => !oldEnableRangeSelection);
    }, []);

    const [rowSelection, setRowSelection] = useState(undefined);

    const toggleRowSelection = useCallback(() => {
        setRowSelection((oldRowSelection) => (oldRowSelection === 'multiple' ? undefined : 'multiple'));
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button id="enableRangeSelection" onClick={toggleRangeSelection}>
                        {enableRangeSelection ? 'Disable Range Selection' : 'Enable Range Selection'}
                    </button>
                    <button onClick={toggleRowSelection}>
                        {rowSelection === 'multiple' ? 'Disable Row Selection' : 'Enable Row Selection'}
                    </button>
                </div>

                <div style={gridStyle} className={'ag-theme-quartz-dark'}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        enableRangeSelection={enableRangeSelection}
                        rowSelection={rowSelection}
                    />
                </div>
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
