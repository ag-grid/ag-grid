'use strict';

import React, { useCallback, useMemo, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import './styles.css';
import GenderRenderer from './genderRenderer.jsx';
import MoodEditor from './moodEditor.jsx';
import MoodRenderer from './moodRenderer.jsx';
import NumericEditor from './numericEditor.jsx';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RichSelectModule])

class CountryCellRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<span style="overflow: hidden; text-overflow: ellipsis">${params.value.name}</span>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }
}

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState([
        { field: 'first_name', headerName: 'First Name', width: 120, editable: true },
        { field: 'last_name', headerName: 'Last Name', width: 120, editable: true },
        {
            field: 'gender',
            width: 100,
            editable: true,
            cellRenderer: GenderRenderer,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                cellRenderer: GenderRenderer,
                values: ['Male', 'Female'],
            },
        },
        {
            field: 'age',
            width: 80,
            editable: true,
            cellEditor: NumericEditor,
        },
        {
            field: 'mood',
            width: 100,
            cellRenderer: MoodRenderer,
            cellEditor: MoodEditor,
            cellEditorPopup: true,
            editable: true,
        },
        {
            field: 'country',
            width: 110,
            cellEditor: 'agRichSelectCellEditor',
            cellRenderer: CountryCellRenderer,
            keyCreator: (params) => {
                return params.value.name;
            },
            cellEditorParams: {
                cellRenderer: CountryCellRenderer,
                values: [
                    { name: 'Ireland', code: 'IE' },
                    { name: 'UK', code: 'UK' },
                    { name: 'France', code: 'FR' },
                ],
            },
            editable: true,
            cellDataType: false,
        },
        {
            field: 'address',
            editable: true,
            cellEditor: 'agLargeTextCellEditor',
            cellEditorPopup: true,
            cellEditorParams: {
                maxLength: '300',
                cols: '50',
                rows: '6',
            },
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }
    }, []);

    const onRowEditingStarted = useCallback((event) => {
        console.log('never called - not doing row editing');
    }, [])

    const onRowEditingStopped = useCallback((event) => {
        console.log('never called - not doing row editing');
    }, [])

    const onCellEditingStarted = useCallback((event) => {
        console.log('cellEditingStarted');
    }, [])

    const onCellEditingStopped = useCallback((event) => {
        console.log('cellEditingStopped');
    }, [])

    return (
        <div style={containerStyle}>
            <div style={gridStyle} className={/** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    reactiveCustomComponents
                    onRowEditingStarted={onRowEditingStarted}
                    onRowEditingStopped={onRowEditingStopped}
                    onCellEditingStarted={onCellEditingStarted}
                    onCellEditingStopped={onCellEditingStopped}
                />
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><GridExample /></StrictMode>);
