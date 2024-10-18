// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet, htmlForSelector } from './utils';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());

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

    window.requestAnimationFrame.mockRestore();
    jest.useRealTimers();
});

it('immutable data grid with cell renderer with refresh updates as expected', () => {
    jest.useFakeTimers();

    /*
     * This is testing a (previous) issue where immutable data wasn't correctly updating react renderers
     *
     * 1) Initial Render
     * 2) Add a new row
     * 3) Update the last row
     * 4) Add a new row
     *
     * The modified row should have been moved "down" when (4) is run
     *
     * So the "top" row should be:
     * 1) 9 (initial render)
     * 2) 10 (new row added)
     * 3) 10* (last row modified)
     * 4) 11 (new row added) (with the 2nd last row being 10*)
     * */
    let renderedOutput = component.render();
    let cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells.length).toBeGreaterThan(5); // 5 is arbitrary here
    expect(cells[0]).toEqual(`<span>9</span>`); // first cell
    expect(cells[cells.length - 1]).toEqual(`<span>0</span>`); // last cell

    const componentInstance = component.instance();
    componentInstance.addNew();
    jest.runAllTimers();

    renderedOutput = component.render();
    cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells[0]).toEqual(`<span>10</span>`); // first cell
    expect(cells[1]).toEqual(`<span>9</span>`); // second cell

    componentInstance.modifyRow();

    jest.runAllTimers();
    renderedOutput = component.render();
    cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells[0]).toEqual(`<span>10*</span>`); // first cell
    expect(cells[1]).toEqual(`<span>9</span>`); // second cell

    componentInstance.addNew();

    jest.runAllTimers();
    renderedOutput = component.render();
    cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells[0]).toEqual(`<span>11</span>`); // first cell
    expect(cells[1]).toEqual(`<span>10*</span>`); // second cell
    expect(cells[2]).toEqual(`<span>9</span>`); // third cell
});

class CellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };
    }

    refresh(newParams) {
        this.setState({ value: newParams.value });
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
                    field: 'id',
                    sort: 'desc',
                },
                {
                    field: 'value',
                    cellRenderer: 'cellRenderer',
                },
            ],
            rowData: this.createRowData(),
        };
    }

    getRowId(params) {
        return params.data.id;
    }

    onGridReady(params) {
        this.api = params.api;
    }

    addNew() {
        const newRowData = [
            ...this.state.rowData,
            {
                id: this.state.rowData.length,
                value: this.state.rowData.length,
            },
        ];
        this.setState({ rowData: newRowData });
    }

    modifyRow() {
        const newRowData = this.state.rowData.map((row) => {
            return row.value === this.state.rowData.length - 1 ? { ...row, value: `${row.value}*` } : row;
        });
        this.setState({ rowData: newRowData });
    }

    createRowData() {
        const rowData = [];

        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            rowData.push({
                id: i,
                value: i,
            });
        }

        return rowData;
    }

    render() {
        return (
            <div>
                <button onClick={this.addNew}>Add New Row</button>
                <button onClick={this.modifyRow}>Modify Row</button>
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
