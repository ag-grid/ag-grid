import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    NumberEditorModule,
    TextEditorModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import MoodEditor from './moodEditor';
import MoodRenderer from './moodRenderer';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [NumberEditorModule, TextEditorModule, CustomEditorModule, ClientSideRowModelModule, RichSelectModule];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
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
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div style={gridStyle}>
                    <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
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
