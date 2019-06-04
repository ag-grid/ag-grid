import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';

import {ensureGridApiHasBeenSet, waitForAsyncCondition} from "./utils"

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount((<GridWithStatefullComponent/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 10), () => fail("Grid API not set within expected time limits"));

});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('stateful component renders as expected', () => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div>Age: 24</div>`);
});

it('stateful component returns a valid component instance', () => {
    const instances = agGridReact.api.getCellRendererInstances({columns: ['age']});
    expect(instances).toBeTruthy();
    expect(instances.length).toEqual(1);

    const frameworkInstance = instances[0].getFrameworkComponentInstance();
    expect(frameworkInstance).toBeTruthy();
    expect(frameworkInstance.getValue()).toEqual("Test Value");
});

it('cell should be editable and editor component usable', async() => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div>Age: 24</div>`);

    // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
    agGridReact.api.startEditingCell({
        rowIndex: 0,
        colKey: 'age'
    });

    await waitForAsyncCondition(() => agGridReact.api.getCellEditorInstances() && agGridReact.api.getCellEditorInstances().length > 0,
        5).then(() => null, () => fail("Editor instance not created within expected time"));

    const instances = agGridReact.api.getCellEditorInstances();
    expect(instances.length).toEqual(1);

    const editorComponent = instances[0].getFrameworkComponentInstance();
    editorComponent.setValue(50);

    agGridReact.api.stopEditing();

    await waitForAsyncCondition(() => agGridReact.api.getCellRendererInstances() && agGridReact.api.getCellRendererInstances().length > 0,
        5).then(() => null, () => fail("Renderer instance not created within expected time"));

    expect(component.render().find('.ag-cell-value').html()).toEqual(`<div>Age: 50</div>`);
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

class EditorComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        }
    }

    render() {
        return (
            <input type="text" value={this.state.value} onChange={this.handleChange} style={{width: "100%"}} />
        )
    }

    handleChange = (event) => {
        this.setState({value: event.target.value});
    }

    getValue() {
        return this.state.value;
    }

    // for testing
    setValue(newValue) {
        this.setState({
            value: newValue
        })
    }

    isCancelBeforeStart() {
        return false;
    }

    isCancelAfterEnd() {
        return false;
    };
}

class GridWithStatefullComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [{
                field: "age",
                editable: true,
                cellRendererFramework: CellRenderer,
                cellEditorFramework: EditorComponent
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
