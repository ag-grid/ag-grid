import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data.jsx';
import MoodEditor from './moodEditor.jsx';
import MoodRenderer from './moodRenderer.jsx';
import './styles.css';

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    ClientSideRowModelModule,
    RichSelectModule,
    ValidationModule /* Development Only */,
]);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'mood',
            headerName: 'Inline',
            cellRenderer: MoodRenderer,
            cellEditor: MoodEditor,
        },
        {
            field: 'mood',
            headerName: 'Popup Over',
            cellRenderer: MoodRenderer,
            cellEditor: MoodEditor,
            cellEditorPopup: true,
        },
        {
            field: 'mood',
            headerName: 'Popup Under',
            cellRenderer: MoodRenderer,
            cellEditor: MoodEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: 'under',
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
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
