// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount(<GridWithStatelessFunction />);
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
    expect(component.render().find('.ag-cell-value').html()).toEqual(
        `<div class="ag-react-container"><span>Age: 24</span></div>`
    );
});

it('stateless function has no component instance', () => {
    const instances = agGridReact.api.getCellRendererInstances({ columns: ['age'] });
    expect(instances).toBeTruthy();
    expect(instances.length).toEqual(1);
});

class GridWithStatelessFunction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: 'age',
                    cellRenderer: (props) => <span>Age: {props.value}</span>,
                },
            ],
            rowData: [{ age: 24 }],
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            <div>
                <AgGridReact
                    suppressReactUi={true}
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    modules={[ClientSideRowModelModule]}
                />
            </div>
        );
    }
}
