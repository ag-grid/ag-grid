// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet, waitForAsyncCondition } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());

    component = mount(<GridWithStatefulComponent />);
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

    window.requestAnimationFrame.mockRestore();
    jest.useRealTimers();
});

it('stateful component renders as expected', () => {
    expect(component.render().find('.ag-cell-value').html()).toEqual(
        `<div class="ag-react-container"><div>Age: 24</div></div>`
    );
});

it('stateful component returns a valid component instance', () => {
    const instances = agGridReact.api.getCellRendererInstances({ columns: ['age'] });
    expect(instances).toBeTruthy();
    expect(instances.length).toEqual(1);
    expect(instances[0].getValue()).toEqual('Test Value');
});

it('cell should be editable and editor component usable', async () => {
    jest.useFakeTimers();

    expect(component.render().find('.ag-cell-value').html()).toEqual(
        `<div class="ag-react-container"><div>Age: 24</div></div>`
    );

    // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
    agGridReact.api.startEditingCell({
        rowIndex: 0,
        colKey: 'age',
    });

    jest.runAllTimers();

    const instances = agGridReact.api.getCellEditorInstances();
    expect(instances.length).toEqual(1);

    const editorComponent = instances[0];
    editorComponent.setValue(50);

    agGridReact.api.stopEditing();

    jest.runAllTimers();

    expect(component.render().find('.ag-cell-value').html()).toEqual(
        `<div class="ag-react-container"><div>Age: 50</div></div>`
    );
});

class CellRenderer extends Component {
    render() {
        return <div>Age: {this.props.value}</div>;
    }

    getValue() {
        return 'Test Value';
    }
}

class EditorComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
        };
    }

    render() {
        return <input type="text" value={this.state.value} onChange={this.handleChange} style={{ width: '100%' }} />;
    }

    handleChange = (event) => {
        this.setState({ value: event.target.value });
    };

    getValue() {
        return this.state.value;
    }

    // for testing
    setValue(newValue) {
        this.setState({
            value: newValue,
        });
    }

    isCancelBeforeStart() {
        return false;
    }

    isCancelAfterEnd() {
        return false;
    }
}

class GridWithStatefulComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: 'age',
                    editable: true,
                    cellRenderer: CellRenderer,
                    cellEditor: EditorComponent,
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
