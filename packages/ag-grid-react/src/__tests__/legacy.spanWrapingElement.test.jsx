// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount(<GridWithNoComponentContainerSpecified />);
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20));
});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('legacy component with span wrapping element set renders as expected', () => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(
        `<span class=\"ag-react-container\"><div>Blerp</div></span>`
    );
});

class CellRenderer extends Component {
    render() {
        return <div>Blerp</div>;
    }
}

class GridWithNoComponentContainerSpecified extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: 'age',
                    cellRenderer: CellRenderer,
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
                    componentWrappingElement="span"
                />
            </div>
        );
    }
}
