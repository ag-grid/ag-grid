// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount(<GridComponent />);
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(
        () => setTimeout(() => done(), 20),
        () => fail('Grid API not set within expected time limits')
    );
});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('functional renderer with NaN renders expected cell values', () => {
    expect(component.render().find('div .ag-cell-value').length).toEqual(2);
    expect(component.render().find('div .ag-cell-value').first().html()).toEqual(
        `<div class="ag-react-container">NaN</div>`
    );
    expect(component.render().find('div .ag-cell-value').last().html()).toEqual(
        `<div class="ag-react-container">10</div>`
    );
});

const CellRenderer = (props) => props.value;

class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: 'Price',
                    field: 'price',
                    cellRenderer: 'cellRenderer',
                },
            ],
            rowData: [
                {
                    price: NaN,
                },
                {
                    price: 10,
                },
            ],
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
                    components={{
                        cellRenderer: CellRenderer,
                    }}
                    modules={[ClientSideRowModelModule]}
                />
            </div>
        );
    }
}
