'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import DoublingEditor from './doublingEditor.jsx';
import MoodEditor from './moodEditor.jsx';
import MoodRenderer from './moodRenderer.jsx';
import NumericEditor from './numericEditor.jsx';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);
class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: 'Doubling',
                    field: 'number',
                    cellEditor: DoublingEditor,
                    cellEditorPopup: true,
                    editable: true,
                    width: 300,
                },
                {
                    field: 'mood',
                    cellRenderer: MoodRenderer,
                    cellEditor: MoodEditor,
                    cellEditorPopup: true,
                    editable: true,
                    width: 300,
                },
                {
                    headerName: 'Numeric',
                    field: 'number',
                    cellEditor: NumericEditor,
                    cellEditorPopup: true,
                    editable: true,
                    width: 280,
                },
            ],
            rowData: [
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
            ],
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true,
            }
        };
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ "height": "100%", "boxSizing": "border-box" }}>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            defaultColDef={this.state.defaultColDef}
                            onGridReady={this.onGridReady}
                        />
                    </div>
                </div>

            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
