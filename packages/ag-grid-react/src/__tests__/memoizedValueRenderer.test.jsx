// noinspection ES6UnusedImports
import { mount } from 'enzyme';
import React, { Component, memo } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../agGridReact';
import { ensureGridApiHasBeenSet, htmlForSelector } from './utils';

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

it('memoized value cell renderer test', () => {
    const renderedOutput = component.render();
    const cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells.length).toEqual(2);
    expect(cells[0]).toEqual('FALSE');
    expect(cells[1]).toEqual('TRUE');
});

const CellRenderer = memo(({ data }) => <>{data.value ? 'TRUE' : 'FALSE'}</>);

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
            rowData: [
                {
                    value: null,
                },
                {
                    value: true,
                },
            ],
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            <div style={{ height: 100 }}>
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
