// noinspection ES6UnusedImports
import React, {Component} from 'react';
import {AgGridReact} from '../agGridReact';

import {ensureGridApiHasBeenSet} from "./utils";

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

it('functional renderer with fragment renders expected cell values', (done) => {
    let renderedOutput = component.render();
    expect(renderedOutput.find('div .ag-cell-value').length).toBeGreaterThan(5); // 5 is arbitrary here
    expect(renderedOutput.find('div .ag-cell-value').first().html()).toEqual(`<div class="ag-react-container">0</div>`);
    expect(renderedOutput.find('div .ag-cell-value').last().html()).toEqual(`<div class="ag-react-container">1000</div>`);

    component.instance().scrollToBottom();

    // the output will be the result of rendering static markup
    // (values are wrapped in span by default for static markup renderering)
    renderedOutput = component.render();
    expect(renderedOutput.find('div .ag-cell-value').length).toBeGreaterThan(5); // 5 is arbitrary here
    expect(renderedOutput.find('div .ag-cell-value').first().html()).toEqual(`<div class="ag-react-container"><span>729000</span></div>`);
    expect(renderedOutput.find('div .ag-cell-value').last().html()).toEqual(`<div class="ag-react-container"><span>1331000</span></div>`);

    setTimeout(() => {
        // the result will now be the async react components actually supplied
        renderedOutput = component.render();
        expect(renderedOutput.find('div .ag-cell-value').length).toBeGreaterThan(5); // 5 is arbitrary here
        expect(renderedOutput.find('div .ag-cell-value').first().html()).toEqual(`<div class="ag-react-container">729000</div>`);
        expect(renderedOutput.find('div .ag-cell-value').last().html()).toEqual(`<div class="ag-react-container">1331000</div>`);
        done();
    }, 50)
});

const CellRenderer = props => <>{props.value * props.value * props.value}</>;

const NUMBER_OF_ROWS = 1500;

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
            rowData: this.createRowData()
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    scrollToBottom() {
        this.api.ensureIndexVisible(100, 'top');
    }

    scrollToTop() {
        this.api.ensureIndexVisible(0, 'top');
    }

    createRowData() {
        const rowData = [];

        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            rowData.push({
                row: "Row " + i,
                value: i
            });
        }

        return rowData;
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: 100}}>
                <button onClick={this.scrollToBottom}>Scroll To Bottom</button>
                <button onClick={this.scrollToTop}>Scroll To Top</button>
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    frameworkComponents={{
                        cellRenderer: CellRenderer
                    }}/>
            </div>
        );
    }
}
