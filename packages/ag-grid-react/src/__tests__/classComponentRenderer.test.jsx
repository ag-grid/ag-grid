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

it('class component renderer with fragment renders expected cell values', () => {
    const renderedOutput = component.render();
    expect(renderedOutput.find('div .ag-cell-value').length).toBeGreaterThan(5); // 5 is arbitrary here
    expect(renderedOutput.find('div .ag-cell-value').first().html()).toEqual(
        `<div class="ag-react-container"><span>0</span></div>`
    );
    expect(renderedOutput.find('div .ag-cell-value').last().html()).toEqual(
        `<div class="ag-react-container"><span>81</span></div>`
    );
});

class CellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value * props.value,
        };
    }

    render() {
        return <span>{this.state.value}</span>;
    }
}

const NUMBER_OF_ROWS = 10;

class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: 'value',
                    cellRenderer: 'cellRenderer',
                },
            ],
            rowData: this.createRowData(),
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    createRowData() {
        const rowData = [];

        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            rowData.push({
                row: 'Row ' + i,
                value: i,
            });
        }

        return rowData;
    }

    render() {
        return (
            <div>
                <button onClick={this.scrollToBottom}>Scroll To Bottom</button>
                <button onClick={this.scrollToTop}>Scroll To Top</button>
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
