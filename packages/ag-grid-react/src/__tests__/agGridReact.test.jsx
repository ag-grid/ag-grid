// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount(<App />);

    agGridReact = component.find(AgGridReact).instance();

    // don't start our tests until the grid is ready
    // it doesn't take long for the grid to initialise, but it is some finite amount of time after the component is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20));
});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('all rows selected', () => {
    // no rows are selected initially
    expect(agGridReact.api.getSelectedRows().length).toEqual(0);

    // simulate a user clicking on the select all button
    component.find('#selectAll').simulate('click', {
        // no actual event data is needed for this particular event/use case
    });

    expect(agGridReact.api.getSelectedRows().length).toEqual(3);
    expect(1).toEqual(1);
});

it('all rows deselected', () => {
    // no rows are selected initially - use the grid directly to select them all (bypassing our app component)
    agGridReact.api.selectAll();

    // simulate a user clicking on the deselect all button
    component.find('#deSelectAll').simulate('click', {
        // no actual event data is needed for this particular event/use case
    });

    expect(agGridReact.api.getSelectedRows().length).toEqual(0);
});

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { headerName: 'Make', field: 'make' },
                { headerName: 'Model', field: 'model' },
                { headerName: 'Price', field: 'price' },
            ],
            rowData: [
                { make: 'Toyota', model: 'Celica', price: 35000 },
                { make: 'Ford', model: 'Mondeo', price: 32000 },
                { make: 'Porsche', model: 'Boxster', price: 72000 },
            ],
        };
    }

    onGridReady = (params) => {
        this.api = params.api;
    };

    handleSelectAll = (event) => {
        this.api.selectAll();
    };

    handleDeselectAll = (event) => {
        this.api.deselectAll();
    };

    render() {
        return (
            <div>
                <button id="selectAll" onClick={this.handleSelectAll}>
                    Select All Rows
                </button>
                <button id="deSelectAll" onClick={this.handleDeselectAll}>
                    Deselect All Rows
                </button>
                <div
                    style={{
                        height: '500px',
                        width: '600px',
                    }}
                >
                    <AgGridReact
                        suppressReactUi={true}
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        modules={[ClientSideRowModelModule]}
                        onGridReady={this.onGridReady}
                    />
                </div>
            </div>
        );
    }
}
