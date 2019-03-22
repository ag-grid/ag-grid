import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';

import {ensureGridApiHasBeenSet} from "./utils"

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount((<GridWithStatefullComponent/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => done());

});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('stateful component renders as expected', () => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div class=\"ag-react-container\"><div>Age: 24</div></div>`);
});

it('stateful component returns a valid component instance', () => {
    const instances = agGridReact.api.getCellRendererInstances({columns: ['age']});
    expect(instances).toBeTruthy();
    expect(instances.length).toEqual(1);

    const frameworkInstance = instances[0].getFrameworkComponentInstance();
    expect(frameworkInstance).toBeTruthy();
    expect(frameworkInstance.getValue()).toEqual("Test Value");
});

class CellRenderer extends Component {
    render() {
        return(
            <div>Age: {this.props.value}</div>
        )
    }

    getValue() {
        return 'Test Value';
    }
}

class GridWithStatefullComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [{
                field: "age",
                cellRendererFramework: CellRenderer
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
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    reactNext={true}
                />
            </div>
        );
    }
}
