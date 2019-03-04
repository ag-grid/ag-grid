import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

// you probably want to have some sort of timeout here so this doesn't hang in the event of some
// other grid related issue
const ensureGridApiHasBeenSet = (component) => {
    return new Promise(function (resolve, reject) {
        (function waitForGridReady() {
            // we need to wait for the gridReady event before we can start interacting with the grid
            // in this case we're looking at the api property in our App component, but it could be anything (ie a boolean flag)
            if (component.instance().api) {

                // once our condition has been met we can start the tests
                return resolve();
            }

            // not set - wait a bit longer
            setTimeout(waitForGridReady, 10);
        })();
    });
};

beforeEach((done) => {
    component = mount((
        <App/>
    ));

    agGridReact = component.find(AgGridReact).instance();

    // don't start our tests until the grid is ready
    // it doesn't take long for the grid to initialise, but it is some finite amount of time after the component is ready
    ensureGridApiHasBeenSet(component).then(() => done());
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

    expect(agGridReact.api.getSelectedRows().length).toEqual(3)
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
                {headerName: "Make", field: "make"},
                {headerName: "Model", field: "model"},
                {headerName: "Price", field: "price"}

            ],
            rowData: [
                {make: "Toyota", model: "Celica", price: 35000},
                {make: "Ford", model: "Mondeo", price: 32000},
                {make: "Porsche", model: "Boxter", price: 72000}
            ]
        }
    }

    onGridReady = params => {
        this.api = params.api;
        this.columnApi = params.columnApi;
    };

    handleSelectAll = event => {
        this.api.selectAll()
    };

    handleDeselectAll = event => {
        this.api.deselectAll()
    };

    render() {
        return (
            <div>
                <button id="selectAll" onClick={this.handleSelectAll}>Select All Rows</button>
                <button id="deSelectAll" onClick={this.handleDeselectAll}>Deselect All Rows</button>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '500px',
                        width: '600px'
                    }}>
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        onGridReady={this.onGridReady}>
                    </AgGridReact>
                </div>
            </div>
        );
    }
}
