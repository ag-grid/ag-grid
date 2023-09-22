'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import React,{ Component } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridKey: `grid-key-${Math.random()}`,
            columnDefs: [
                {field: 'name', headerName: 'Athlete', width: 250},
                {field: 'person.country', headerName: 'Country'},
                {field: 'person.age', headerName: 'Age'},
                {field: 'medals.gold', headerName: 'Gold Medals'},
                {field: 'medals.silver', headerName: 'Silver Medals'},
                {field: 'medals.bronze', headerName: 'Bronze Medals'},
            ],
            rowData: getData(),
            rowSelection: 'multiple'
        };
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const checkbox = document.querySelector('#pinFirstColumnOnLoad');
        const shouldPinFirstColumn = checkbox && checkbox.checked;
        if (shouldPinFirstColumn) {
            params.columnApi.applyColumnState({
                state: [
                    {colId: 'name', pinned: 'left'},
                ],
            });
        }

    }

    reloadGrid = () => {
        // Trigger re-load by assigning a new key to the Grid React component
        this.setState({ gridKey: `grid-key-${Math.random()}` });
    }

    render() {
        return (
          <div style={{ width: "100%", height: "100%" }}>
            <div className="test-container">
              <div className="test-header">
                <div style={{ marginBottom: "1rem" }}>
                  <input type="checkbox" id="pinFirstColumnOnLoad" />
                  <label htmlFor="pinFirstColumnOnLoad">
                    Pin first column on load
                  </label>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <button
                    id="reloadGridButton"
                    onClick={() => this.reloadGrid()}
                  >
                    Reload Grid
                  </button>
                </div>
              </div>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                }}
                className="ag-theme-alpine"
              >
                <AgGridReact
                  key={this.state.gridKey}
                  columnDefs={this.state.columnDefs}
                  rowData={this.state.rowData}
                  rowSelection={this.state.rowSelection}
                  onGridReady={this.onGridReady}
                />
              </div>
            </div>
          </div>
        )
    }
}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample/>);
