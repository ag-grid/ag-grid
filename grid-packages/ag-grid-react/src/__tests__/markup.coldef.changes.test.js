// noinspection ES6UnusedImports
import React, {Component} from 'react';
import { AgGridReact, AgGridColumn } from '../main';

import { ensureGridApiHasBeenSet, wait } from "./utils";

import {mount} from 'enzyme';

let component = null;
let agGridReact = null;

beforeEach((done) => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());

    component = mount((<DeclarativeColumnsGrid/>));
    // jest.runAllTimers();
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => setTimeout(() => done(), 20));
});

afterEach(() => {
    component.unmount();
    agGridReact = null;

    window.requestAnimationFrame.mockRestore();
    jest.useRealTimers();
});

it('declarative grid renders as expected', () => {
    expect(component.render().find('.ag-pinned-left-header .ag-header-cell-text').text()).toEqual("Name");
    expect(component.render().find('.ag-header-viewport .ag-header-cell-text').text()).toEqual("Country");
    expect(component.render().find('.ag-header-cell-text').text()).toEqual("NameCountry");
    expect(component.render().find('.ag-cell-value').text()).toEqual("24South Africa");
});

it('declarative grid hiding a column removes it from the dom', (done) => {
    jest.useFakeTimers();
    component.setState({
        hideCountry: true
    }, () => {
        jest.runAllTimers();

        const renderedOutput = component.render();
        expect(renderedOutput.find('.ag-pinned-left-header .ag-header-cell-text').text()).toEqual("Name");
        expect(renderedOutput.find('.ag-header-viewport .ag-header-cell-text').text()).toEqual("");
        expect(renderedOutput.find('.ag-header-cell-text').text()).toEqual("Name");
        expect(renderedOutput.find('.ag-cell-value').text()).toEqual("24");

        done();
    });
});

it('declarative grid unpinning a column moves it to the center header section', (done) => {
    jest.useFakeTimers();
    component.setState({
        pinName: false
    }, () => {
        jest.runAllTimers();

        const renderedOutput = component.render();
        expect(renderedOutput.find('.ag-pinned-left-header .ag-header-cell-text').text()).toEqual("");
        expect(renderedOutput.find('.ag-header-viewport .ag-header-cell[aria-colindex=1]').text().trim()).toEqual("Name");
        expect(renderedOutput.find('.ag-header-viewport .ag-header-cell[aria-colindex=2]').text().trim()).toEqual("Country");
        expect(renderedOutput.find('.ag-cell-value[aria-colindex=1]').text()).toEqual("24");
        expect(renderedOutput.find('.ag-cell-value[aria-colindex=2]').text()).toEqual("South Africa");

        done();
    });
});

class DeclarativeColumnsGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rowData: [{name: 24, country: 'South Africa'}],
            pinName: true,
            hideCountry: false
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            <div
                style={{height: 200, width: 500}}
                className="ag-theme-balham">
                <AgGridReact
                    suppressReactUi={true}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}>
                    <AgGridColumn field="name" width={150} pinned={this.state.pinName} editable/>
                    <AgGridColumn field="country" width={150} hide={this.state.hideCountry}/>
                </AgGridReact>
            </div>
        );
    }
}
