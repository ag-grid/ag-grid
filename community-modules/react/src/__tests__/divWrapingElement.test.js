// noinspection ES6UnusedImports
import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";

import {ensureGridApiHasBeenSet} from "./utils"

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount((<GridWithNoComponentContainerSpecified/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20));

});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('wrapping element set to div renders as expected', () => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div class=\"ag-react-container\"><div>Blerp</div></div>`);
});

class CellRenderer extends Component {
    render() {
        return(
            <div>Blerp</div>
        )
    }
}

class GridWithNoComponentContainerSpecified extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [{
                field: "age",
                cellRenderer: CellRenderer
            }],
            rowData: [{age: 24}]
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            <div
                className="ag-theme-balham">
                <AgGridReact
                    suppressReactUi={true}
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    modules={[ClientSideRowModelModule]}
                    componentWrappingElement="div"
                />
            </div>
        );
    }
}
