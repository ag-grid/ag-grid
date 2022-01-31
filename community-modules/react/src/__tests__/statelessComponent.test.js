// noinspection ES6UnusedImports
import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {ensureGridApiHasBeenSet} from "./utils"

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount((<GridWithStatelessFunction/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20));

});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('stateless function renders as expected', () => {
    // stateless components _still_ require the wrapping div... :-(
    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div class="ag-react-container"><span>Age: 24</span></div>`);
});

it('stateless function has no component instance', () => {
    const instances = agGridReact.api.getCellRendererInstances({columns: ['age']});
    expect(instances).toBeTruthy();
    expect(instances.length).toEqual(1);
});

class GridWithStatelessFunction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [{
                field: "age",
                cellRenderer: (props) => <span>Age: {props.value}</span>,
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
                    disableStaticMarkup={true}
                    rowData={this.state.rowData}
                    modules={[ClientSideRowModelModule]} />
            </div>
        );
    }
}
