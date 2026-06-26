import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import NumericEditor from './numericEditor';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [TextEditorModule, TextFilterModule, CustomEditorModule, ClientSideRowModelModule];

const GridExample = () => {
    const [rowData] = useState([
        { name: 'Bob', mood: 'Happy', number: 10 },
        { name: 'Harry', mood: 'Sad', number: 3 },
        { name: 'Sally', mood: 'Happy', number: 20 },
        { name: 'Mary', mood: 'Sad', number: 5 },
        { name: 'John', mood: 'Happy', number: 15 },
        { name: 'Jack', mood: 'Happy', number: 25 },
        { name: 'Sue', mood: 'Sad', number: 43 },
        { name: 'Sean', mood: 'Sad', number: 1335 },
        { name: 'Niall', mood: 'Happy', number: 2 },
        { name: 'Alberto', mood: 'Happy', number: 123 },
        { name: 'Fred', mood: 'Sad', number: 532 },
        { name: 'Jenny', mood: 'Happy', number: 34 },
        { name: 'Larry', mood: 'Happy', number: 13 },
    ]);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: 'Provided Text',
                field: 'name',
                width: 300,
            },
            {
                headerName: 'Custom Numeric',
                field: 'number',
                cellEditor: NumericEditor,
                editable: true,
                width: 280,
            },
        ],
        []
    );

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    return (
        <AgGridProvider modules={modules}>
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <AgGridReact columnDefs={columnDefs} rowData={rowData} defaultColDef={defaultColDef} />
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
