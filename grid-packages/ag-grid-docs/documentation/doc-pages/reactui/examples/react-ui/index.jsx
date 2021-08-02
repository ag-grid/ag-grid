'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

// this is a hook, but we work also with classes
function MyRenderer(params) {
    return (
          <span className="my-renderer">
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" className="my-spinner"/>
              {params.value}
          </span>
    );
}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule],
            columnDefs: [
                {
                    field: 'athlete',
                    enableRowGroup: true
                },
                {
                    field: 'age',
                    enableRowGroup: true,
                    cellRendererFramework: MyRenderer,
                },
                {
                    field: 'country',
                    enableRowGroup: true
                },
                {
                    field: 'year',
                    enableRowGroup: true
                },
                {
                    field: 'date',
                },
                {
                    field: 'sport',
                    enableRowGroup: true,
                },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                { field: 'bronze', aggFunc: 'sum' },
                { field: 'total', aggFunc: 'sum' },
            ],
            defaultColDef: {
                resizable: true,
                sortable: true
            },
            rowData: null,
            frameworkComponents: {
                'bananas': MyRenderer
            }
        };
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            this.setState({ rowData: data });
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => updateData(data));
    };

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    className="ag-theme-alpine"
                >
                    <AgGridReact
                        reactUi="true"
                        animateRows="true"
                        modules={this.state.modules}
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        onGridReady={this.onGridReady}
                        rowGroupPanelShow="always"
                        enableRangeSelection="true"
                        rowData={this.state.rowData}
                        rowSelection="multiple"
                        suppressRowClickSelection="true"
                        frameworkComponents={this.state.frameworkComponents}
                        components={this.state.components}
                    />
                </div>
            </div>
        );
    }
}

render(<GridExample></GridExample>, document.querySelector('#root'));
