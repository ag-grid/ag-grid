// noinspection ES6UnusedImports
import React, {memo, Component} from 'react';
import {AgGridReact} from '../agGridReact';
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";

import {ensureGridApiHasBeenSet, htmlForSelector} from "./utils";

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    component = mount((<GridComponent/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20), () => fail("Grid API not set within expected time limits"));

});

afterEach(() => {
    component.unmount();
    agGridReact = null;
});

it('memoized value cell renderer test', () => {
    const renderedOutput = component.render();
    const cells = htmlForSelector(renderedOutput, 'div .ag-react-container');

    expect(cells.length).toEqual(2);
    expect(cells[0]).toEqual("FALSE");
    expect(cells[1]).toEqual("TRUE");
});

const CellRenderer = memo(({data}) => (<>{data.value ? 'TRUE' : 'FALSE'}</>));

class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: "value",
                    cellRenderer: "cellRenderer"
                }
            ],
            rowData: [
                {
                    value: null
                },
                {
                    value: true
                }
            ]

        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: 100}}>
                <AgGridReact
                    suppressReactUi={true}
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    frameworkComponents={{
                        cellRenderer: CellRenderer
                    }}
                    modules={[ClientSideRowModelModule]}/>
            </div>
        );
    }
}
